import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { UserRole } from '@prisma/client';

const MANAGE_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN'
] as const;

const READ_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'TEKNISI',
  'CUSTOMER_SERVICE',
  'FINANCE',
] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const user = await getCurrentUser();

    if (!user || !READ_ROLES.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { id: rawId } = await context.params;
    const id = parseId(rawId);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID branch tidak valid.",
        },
        { status: 400 },
      );
    }

    const branch = await prisma.branch.findUnique({
      where: {
        id,
      },
      include: {
        customers: {
          select: {
            id: true,
            customerCode: true,
            name: true,
            phone: true,
            status: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
        coverageAreas: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        registrations: {
          select: {
            id: true,
            registrationCode: true,
            name: true,
            phone: true,
            status: true,
            createdAt: true,
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
          take: 20,
        },
        _count: {
          select: {
            customers: true,
            coverageAreas: true,
            registrations: true,
          },
        },
      },
    });

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          message: "Branch tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: branch,
    });
  } catch (error) {
    console.error("GET /api/branches/[id] ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail branch.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user = await getCurrentUser();

    if (!user || !MANAGE_ROLES.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki izin untuk mengubah branch.",
        },
        { status: 403 },
      );
    }

    const { id: rawId } = await context.params;
    const id = parseId(rawId);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID branch tidak valid.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.branch.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Branch tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const data: {
      name?: string;
      code?: string;
      address?: string;
      phone?: string | null;
      email?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Nama branch tidak boleh kosong.",
          },
          { status: 400 },
        );
      }

      data.name = name;
    }

    if (body.code !== undefined) {
      const code = String(body.code).trim().toUpperCase();

      if (!code) {
        return NextResponse.json(
          {
            success: false,
            message: "Kode branch tidak boleh kosong.",
          },
          { status: 400 },
        );
      }

      const duplicate = await prisma.branch.findFirst({
        where: {
          code,
          NOT: {
            id,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: `Kode branch "${code}" sudah digunakan.`,
          },
          { status: 409 },
        );
      }

      data.code = code;
    }

    if (body.address !== undefined) {
      const address = String(body.address).trim();

      if (!address) {
        return NextResponse.json(
          {
            success: false,
            message: "Alamat branch tidak boleh kosong.",
          },
          { status: 400 },
        );
      }

      data.address = address;
    }

    if (body.phone !== undefined) {
      data.phone = body.phone
        ? String(body.phone).trim()
        : null;
    }

    if (body.email !== undefined) {
      data.email = body.email
        ? String(body.email).trim()
        : null;
    }

    if (body.latitude !== undefined) {
      if (body.latitude === null || body.latitude === "") {
        data.latitude = null;
      } else {
        const latitude = Number(body.latitude);

        if (
          Number.isNaN(latitude) ||
          latitude < -90 ||
          latitude > 90
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Latitude tidak valid.",
            },
            { status: 400 },
          );
        }

        data.latitude = latitude;
      }
    }

    if (body.longitude !== undefined) {
      if (body.longitude === null || body.longitude === "") {
        data.longitude = null;
      } else {
        const longitude = Number(body.longitude);

        if (
          Number.isNaN(longitude) ||
          longitude < -180 ||
          longitude > 180
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Longitude tidak valid.",
            },
            { status: 400 },
          );
        }

        data.longitude = longitude;
      }
    }

    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
    }

    const branch = await prisma.branch.update({
      where: {
        id,
      },
      data,
    });

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "Branch",
      entityId: branch.id,
      description: `Memperbarui branch ${branch.name} (${branch.code})`,
    });

    return NextResponse.json({
      success: true,
      message: "Branch berhasil diperbarui.",
      data: branch,
    });
  } catch (error) {
    console.error("PATCH /api/branches/[id] ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui branch.",
      },
      { status: 500 },
    );
  }
}
