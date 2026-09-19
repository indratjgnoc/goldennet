import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const technicianIdParam = searchParams.get("technicianId");
    const search = searchParams.get("search")?.trim() || "";

    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(searchParams.get("limit") || "20", 10) || 20,
        1,
      ),
      100,
    );

    const isAdmin = ADMIN_ROLES.includes(
      user.role as (typeof ADMIN_ROLES)[number],
    );

    const where: Prisma.WorkOrderWhereInput = {};

    // Teknisi hanya boleh melihat WO miliknya.
    if (!isAdmin) {
      if (user.role !== "TEKNISI") {
        return NextResponse.json(
          {
            success: false,
            message: "Kamu tidak memiliki akses ke Work Order.",
          },
          { status: 403 },
        );
      }

      where.technicianId = user.id;
    } else if (technicianIdParam) {
      const technicianId = Number(technicianIdParam);

      if (!Number.isInteger(technicianId) || technicianId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "technicianId tidak valid.",
          },
          { status: 400 },
        );
      }

      where.technicianId = technicianId;
    }

    if (
      status &&
      WORK_ORDER_STATUSES.includes(
        status as (typeof WORK_ORDER_STATUSES)[number],
      )
    ) {
      where.status = status as (typeof WORK_ORDER_STATUSES)[number];
    }

    if (
      type &&
      WORK_ORDER_TYPES.includes(
        type as (typeof WORK_ORDER_TYPES)[number],
      )
    ) {
      where.type = type as (typeof WORK_ORDER_TYPES)[number];
    }

    if (
      priority &&
      WORK_ORDER_PRIORITIES.includes(
        priority as (typeof WORK_ORDER_PRIORITIES)[number],
      )
    ) {
      where.priority = priority as (typeof WORK_ORDER_PRIORITIES)[number];
    }

    if (search) {
      where.OR = [
        {
          workOrderCode: {
            contains: search,
          },
        },
        {
          title: {
            contains: search,
          },
        },
        {
          customer: {
            name: {
              contains: search,
            },
          },
        },
        {
          customer: {
            customerCode: {
              contains: search,
            },
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [workOrders, total] = await prisma.$transaction([
      prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          {
            priority: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              name: true,
              phone: true,
              address: true,
              status: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
          installation: {
            select: {
              id: true,
              installationCode: true,
              installationDate: true,
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
                },
              },
            },
          },
        },
      }),

      prisma.workOrder.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: workOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/work-orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data Work Order.",
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

export async function POST(request: Request) {
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
          message: "Hanya Admin yang dapat membuat Work Order.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const {
      customerId,
      technicianId,
      installationId,
      type,
      status,
      priority,
      title,
      description,
      scheduledAt,
      technicianNotes,
      completionNotes,
    } = body;

    const parsedCustomerId = Number(customerId);

    if (
      !Number.isInteger(parsedCustomerId) ||
      parsedCustomerId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer wajib dipilih.",
        },
        { status: 400 },
      );
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Judul Work Order wajib diisi.",
        },
        { status: 400 },
      );
    }

    const selectedType = type || "INSTALLATION";
    const selectedStatus = status || "OPEN";
    const selectedPriority = priority || "NORMAL";

    if (
      !WORK_ORDER_TYPES.includes(
        selectedType as (typeof WORK_ORDER_TYPES)[number],
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

    if (
      !WORK_ORDER_STATUSES.includes(
        selectedStatus as (typeof WORK_ORDER_STATUSES)[number],
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

    if (
      !WORK_ORDER_PRIORITIES.includes(
        selectedPriority as (typeof WORK_ORDER_PRIORITIES)[number],
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Prioritas Work Order tidak valid.",
        },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: parsedCustomerId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    let parsedTechnicianId: number | undefined;

    if (technicianId !== null && technicianId !== undefined && technicianId !== "") {
      parsedTechnicianId = Number(technicianId);

      if (
        !Number.isInteger(parsedTechnicianId) ||
        parsedTechnicianId <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Teknisi tidak valid.",
          },
          { status: 400 },
        );
      }

      const technician = await prisma.user.findFirst({
        where: {
          id: parsedTechnicianId,
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
    }

    let parsedInstallationId: number | undefined;

    if (
      installationId !== null &&
      installationId !== undefined &&
      installationId !== ""
    ) {
      parsedInstallationId = Number(installationId);

      if (
        !Number.isInteger(parsedInstallationId) ||
        parsedInstallationId <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Installation tidak valid.",
          },
          { status: 400 },
        );
      }

      const installation = await prisma.installation.findUnique({
        where: {
          id: parsedInstallationId,
        },
        select: {
          id: true,
          customerId: true,
        },
      });

      if (!installation) {
        return NextResponse.json(
          {
            success: false,
            message: "Installation tidak ditemukan.",
          },
          { status: 404 },
        );
      }

      if (installation.customerId !== parsedCustomerId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Installation tersebut bukan milik customer yang dipilih.",
          },
          { status: 400 },
        );
      }
    }

    let parsedScheduledAt: Date | undefined;

    if (scheduledAt) {
      const date = new Date(scheduledAt);

      if (Number.isNaN(date.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Tanggal jadwal tidak valid.",
          },
          { status: 400 },
        );
      }

      parsedScheduledAt = date;
    }

    const workOrderCode = await generateWorkOrderCode();

    const workOrder = await prisma.workOrder.create({
      data: {
        workOrderCode,
        customerId: parsedCustomerId,
        technicianId: parsedTechnicianId,
        installationId: parsedInstallationId,
        type: selectedType,
        status:
          parsedTechnicianId && selectedStatus === "OPEN"
            ? "ASSIGNED"
            : selectedStatus,
        priority: selectedPriority,
        title: title.trim(),
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
        scheduledAt: parsedScheduledAt,
        technicianNotes:
          typeof technicianNotes === "string"
            ? technicianNotes.trim() || null
            : null,
        completionNotes:
          typeof completionNotes === "string"
            ? completionNotes.trim() || null
            : null,
      },
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
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Work Order berhasil dibuat.",
        data: workOrder,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/work-orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat Work Order.",
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

async function generateWorkOrderCode() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  for (let attempt = 0; attempt < 10; attempt++) {
    const random = Math.floor(1000 + Math.random() * 9000);

    const code = `GWO-${year}${month}${day}-${random}`;

    const existing = await prisma.workOrder.findUnique({
      where: {
        workOrderCode: code,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Gagal membuat kode Work Order unik.");
}