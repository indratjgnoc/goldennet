import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/audit";

const ALLOWED_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "CUSTOMER_SERVICE",
];

const VALID_STATUSES = [
  "PROSPECT",
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
] as const;

function isAllowedRole(role: string) {
  return ALLOWED_ROLES.includes(role);
}

function cleanString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}

/**
 * GET /api/customers
 *
 * Query:
 * ?search=
 * ?status=
 * ?branchId=
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAllowedRole(user.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = cleanString(searchParams.get("search"));
    const status = cleanString(searchParams.get("status"));
    const branchIdParam = cleanString(searchParams.get("branchId"));

    let branchId: number | undefined;

    if (branchIdParam) {
      branchId = Number(branchIdParam);

      if (!Number.isInteger(branchId) || branchId <= 0) {
        return NextResponse.json(
          { message: "branchId tidak valid" },
          { status: 400 }
        );
      }
    }

    if (
      status &&
      !VALID_STATUSES.includes(
        status as (typeof VALID_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        { message: "Status customer tidak valid" },
        { status: 400 }
      );
    }

    const customers = await prisma.customer.findMany({
      where: {
        ...(search
          ? {
              OR: [
                {
                  customerCode: {
                    contains: search,
                  },
                },
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  phone: {
                    contains: search,
                  },
                },
                {
                  email: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),

        ...(status
          ? {
              status:
                status as (typeof VALID_STATUSES)[number],
            }
          : {}),

        ...(branchId
          ? {
              branchId,
            }
          : {}),
      },

      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },

        subscriptions: {
          select: {
            id: true,
            subscriptionCode: true,
            status: true,
            startDate: true,
            endDate: true,
            package: {
              select: {
                id: true,
                name: true,
                code: true,
                speed: true,
                price: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: customers,
      total: customers.length,
    });
  } catch (error) {
    console.error("GET /api/customers ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data customer",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAllowedRole(user.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = cleanString(body.name);
    const phone = cleanString(body.phone);
    const email = cleanString(body.email);
    const address = cleanString(body.address);
    const customerCode = cleanString(body.customerCode);
    const status = cleanString(body.status) || "PROSPECT";

    const branchId =
      body.branchId === null ||
      body.branchId === undefined ||
      body.branchId === ""
        ? null
        : Number(body.branchId);

    // =========================
    // VALIDATION
    // =========================

    if (!name) {
      return NextResponse.json(
        { message: "Nama customer wajib diisi" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { message: "Nomor telepon wajib diisi" },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { message: "Alamat wajib diisi" },
        { status: 400 }
      );
    }

    if (!customerCode) {
      return NextResponse.json(
        { message: "Kode customer wajib diisi" },
        { status: 400 }
      );
    }

    if (
      !VALID_STATUSES.includes(
        status as (typeof VALID_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        { message: "Status customer tidak valid" },
        { status: 400 }
      );
    }

    if (
      branchId !== null &&
      (!Number.isInteger(branchId) || branchId <= 0)
    ) {
      return NextResponse.json(
        { message: "Branch tidak valid" },
        { status: 400 }
      );
    }

    // =========================
    // CHECK DUPLICATE CODE
    // =========================

    const existingCustomer =
      await prisma.customer.findUnique({
        where: {
          customerCode,
        },
      });

    if (existingCustomer) {
      return NextResponse.json(
        {
          message: "Kode customer sudah digunakan",
        },
        { status: 409 }
      );
    }

    // =========================
    // CHECK BRANCH
    // =========================

    if (branchId !== null) {
      const branch = await prisma.branch.findUnique({
        where: {
          id: branchId,
        },
      });

      if (!branch) {
        return NextResponse.json(
          {
            message: "Branch tidak ditemukan",
          },
          { status: 400 }
        );
      }

      if (!branch.isActive) {
        return NextResponse.json(
          {
            message: "Branch sedang tidak aktif",
          },
          { status: 400 }
        );
      }
    }

    // =========================
    // CREATE CUSTOMER
    // =========================

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        name,
        phone,
        email: email || null,
        address,
        status:
          status as (typeof VALID_STATUSES)[number],
        branchId,
      },

      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // =========================
    // AUDIT LOG
    // =========================

    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "Customer",
      entityId: customer.id,
      description: `Membuat customer ${customer.customerCode} - ${customer.name}`,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json(
      {
        message: "Customer berhasil dibuat",
        data: customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/customers ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal membuat customer",
      },
      { status: 500 }
    );
  }
}