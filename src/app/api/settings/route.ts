import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/audit-log";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

const SETTING_KEYS = [
  "company_name",
  "application_name",
  "email",
  "phone",
  "address",
  "timezone",
  "registration_open",
  "maintenance_mode",
] as const;

type SettingKey = (typeof SETTING_KEYS)[number];

function isAllowedRole(role: string) {
  return ALLOWED_ROLES.includes(
    role as (typeof ALLOWED_ROLES)[number],
  );
}

function serializeSettings(
  rows: Array<{
    key: string;
    value: string | null;
  }>,
) {
  const data: Record<string, string> = {};

  for (const row of rows) {
    data[row.key] = row.value ?? "";
  }

  return {
    company_name: data.company_name ?? "",
    application_name: data.application_name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
    timezone: data.timezone || "Asia/Jakarta",

    registration_open:
      data.registration_open === "true",

    maintenance_mode:
      data.maintenance_mode === "true",
  };
}

/**
 * GET /api/settings
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (!isAllowedRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu tidak memiliki akses ke pengaturan sistem",
        },
        {
          status: 403,
        },
      );
    }

    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [...SETTING_KEYS],
        },
      },
      orderBy: {
        key: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: serializeSettings(settings),
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("GET /api/settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil pengaturan sistem",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * PATCH /api/settings
 */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (!isAllowedRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu tidak memiliki akses untuk mengubah pengaturan",
        },
        {
          status: 403,
        },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Format request tidak valid",
        },
        {
          status: 400,
        },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Data pengaturan tidak valid",
        },
        {
          status: 400,
        },
      );
    }

    const input = body as Record<string, unknown>;

    const updates: Array<{
      key: SettingKey;
      value: string;
    }> = [];

    for (const key of SETTING_KEYS) {
      if (!(key in input)) {
        continue;
      }

      const rawValue = input[key];

      let value: string;

      if (typeof rawValue === "boolean") {
        value = rawValue ? "true" : "false";
      } else if (typeof rawValue === "string") {
        value = rawValue.trim();
      } else if (rawValue === null || rawValue === undefined) {
        value = "";
      } else {
        return NextResponse.json(
          {
            success: false,
            message: `Nilai ${key} tidak valid`,
          },
          {
            status: 400,
          },
        );
      }

      updates.push({
        key,
        value,
      });
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada pengaturan yang dikirim",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Simpan seluruh perubahan secara atomic.
     */
    await prisma.$transaction(
      updates.map((item) =>
        prisma.systemSetting.upsert({
          where: {
            key: item.key,
          },
          create: {
            key: item.key,
            value: item.value,
          },
          update: {
            value: item.value,
          },
        }),
      ),
    );

    /*
     * Ambil kembali data terbaru dari database.
     */
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [...SETTING_KEYS],
        },
      },
      orderBy: {
        key: "asc",
      },
    });

    /*
     * Catat perubahan ke audit log.
     */
    try {
      await createAuditLog({
        userId: user.id,
        action: "UPDATE",
        entity: "SystemSetting",
        description: "Mengubah pengaturan sistem Golden Net",
      });
    } catch (auditError) {
      /*
       * Kegagalan audit tidak boleh membuat
       * perubahan settings dianggap gagal.
       */
      console.error(
        "PATCH /api/settings audit log error:",
        auditError,
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pengaturan berhasil disimpan",
        data: serializeSettings(settings),
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("PATCH /api/settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyimpan pengaturan sistem",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}