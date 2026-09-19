import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

const WORK_ORDER_TYPES = [
  "INSTALLATION",
  "TROUBLESHOOTING",
  "REPAIR",
  "MAINTENANCE",
  "UPGRADE",
  "DOWNGRADE",
] as const;

const WORK_ORDER_STATUSES = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING",
  "COMPLETED",
  "CANCELLED",
] as const;

const WORK_ORDER_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login tidak ditemukan.",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const workOrderId = Number(id);

    if (!Number.isInteger(workOrderId) || workOrderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Work Order tidak valid.",
        },
        { status: 400 },
      );
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: {
        id: workOrderId,
      },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            status: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
        installation: {
          select: {
            id: true,
            installationCode: true,
            installationDate: true,
            address: true,
            notes: true,
          },
        },
        materials: {
          include: {
            item: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!workOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Work Order tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const isAdmin = ADMIN_ROLES.includes(
      user.role as (typeof ADMIN_ROLES)[number],
    );

    if (!isAdmin && workOrder.technicianId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu tidak memiliki akses ke Work Order ini.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: workOrder,
    });
  } catch (error) {
    console.error("GET /api/work-orders/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail Work Order.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login tidak ditemukan.",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const workOrderId = Number(id);

    if (!Number.isInteger(workOrderId) || workOrderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Work Order tidak valid.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.workOrder.findUnique({
      where: {
        id: workOrderId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Work Order tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const isAdmin = ADMIN_ROLES.includes(
      user.role as (typeof ADMIN_ROLES)[number],
    );

    if (!isAdmin) {
      if (user.role !== "TEKNISI") {
        return NextResponse.json(
          {
            success: false,
            message: "Kamu tidak memiliki akses.",
          },
          { status: 403 },
        );
      }

      if (existing.technicianId !== user.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Work Order ini bukan tugas kamu.",
          },
          { status: 403 },
        );
      }
    }

    const body = await request.json();

    const data: Record<string, unknown> = {};

    if (isAdmin) {
      if (body.title !== undefined) {
        if (
          typeof body.title !== "string" ||
          !body.title.trim()
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Judul Work Order tidak boleh kosong.",
            },
            { status: 400 },
          );
        }

        data.title = body.title.trim();
      }

      if (body.description !== undefined) {
        data.description =
          typeof body.description === "string"
            ? body.description.trim() || null
            : null;
      }

      if (body.technicianId !== undefined) {
        if (
          body.technicianId === null ||
          body.technicianId === ""
        ) {
          data.technicianId = null;
        } else {
          const technicianId = Number(body.technicianId);

          const technician = await prisma.user.findFirst({
            where: {
              id: technicianId,
              role: "TEKNISI",
              status: "ACTIVE",
            },
            select: {
              id: true,
            },
          });

          if (!technician) {
            return NextResponse.json(
              {
                success: false,
                message: "Teknisi tidak ditemukan atau tidak aktif.",
              },
              { status: 400 },
            );
          }

          data.technicianId = technicianId;
        }
      }

      if (body.installationId !== undefined) {
        data.installationId =
          body.installationId === null ||
          body.installationId === ""
            ? null
            : Number(body.installationId);
      }

      if (body.type !== undefined) {
        if (
          !WORK_ORDER_TYPES.includes(
            body.type as (typeof WORK_ORDER_TYPES)[number],
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Jenis Work Order tidak valid.",
            },
            { status: 400 },
          );
        }

        data.type = body.type;
      }

      if (body.priority !== undefined) {
        if (
          !WORK_ORDER_PRIORITIES.includes(
            body.priority as (typeof WORK_ORDER_PRIORITIES)[number],
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Prioritas tidak valid.",
            },
            { status: 400 },
          );
        }

        data.priority = body.priority;
      }
    }

    if (body.status !== undefined) {
      if (
        !WORK_ORDER_STATUSES.includes(
          body.status as (typeof WORK_ORDER_STATUSES)[number],
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Status Work Order tidak valid.",
          },
          { status: 400 },
        );
      }

      data.status = body.status;

      if (body.status === "IN_PROGRESS" && !existing.startedAt) {
        data.startedAt = new Date();
      }

      if (
        body.status === "COMPLETED" &&
        !existing.completedAt
      ) {
        data.completedAt = new Date();
      }
    }

    if (body.scheduledAt !== undefined) {
      if (!body.scheduledAt) {
        data.scheduledAt = null;
      } else {
        const date = new Date(body.scheduledAt);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            {
              success: false,
              message: "Tanggal jadwal tidak valid.",
            },
            { status: 400 },
          );
        }

        data.scheduledAt = date;
      }
    }

    if (body.technicianNotes !== undefined) {
      data.technicianNotes =
        typeof body.technicianNotes === "string"
          ? body.technicianNotes.trim() || null
          : null;
    }

    if (body.completionNotes !== undefined) {
      data.completionNotes =
        typeof body.completionNotes === "string"
          ? body.completionNotes.trim() || null
          : null;
    }

    const updated = await prisma.workOrder.update({
      where: {
        id: workOrderId,
      },
      data,
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            name: true,
            phone: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        installation: {
          select: {
            id: true,
            installationCode: true,
          },
        },
        materials: {
          include: {
            item: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Work Order berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/work-orders/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui Work Order.",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login tidak ditemukan.",
        },
        { status: 401 },
      );
    }

    const isAdmin = ADMIN_ROLES.includes(
      user.role as (typeof ADMIN_ROLES)[number],
    );

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya Admin yang dapat menghapus Work Order.",
        },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const workOrderId = Number(id);

    if (!Number.isInteger(workOrderId) || workOrderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Work Order tidak valid.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.workOrder.findUnique({
      where: {
        id: workOrderId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Work Order tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    await prisma.workOrder.delete({
      where: {
        id: workOrderId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Work Order berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/work-orders/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus Work Order.",
      },
      { status: 500 },
    );
  }
}