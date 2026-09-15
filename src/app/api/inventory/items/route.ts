import { NextResponse } from "next/server";
import { Prisma,InventoryUnit } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"];

function isAllowedRole(role: string) {
  return ALLOWED_ROLES.includes(role);
}

function parsePositiveInteger(value: unknown) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
}

function parseNonNegativeNumber(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}

/**
 * GET /api/inventory/items
 *
 * Query:
 * ?search=
 * ?status=all|active|inactive
 * ?categoryId=
 */
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

    if (!isAllowedRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu tidak memiliki akses ke modul barang.",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status") ?? "all";
    const categoryId = searchParams.get("categoryId");

    const parsedCategoryId = categoryId
      ? parsePositiveInteger(categoryId)
      : null;

    const where: Prisma.InventoryItemWhereInput = {};

    if (search) {
      where.OR = [
        {
          code: {
            contains: search,
          },
        },
        {
          name: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
        {
          location: {
            contains: search,
          },
        },
      ];
    }

    if (status === "active") {
      where.isActive = true;
    }

    if (status === "inactive") {
      where.isActive = false;
    }

    if (parsedCategoryId) {
      where.categoryId = parsedCategoryId;
    }

    const [items, total, active, inactive, categories] =
      await Promise.all([
        prisma.inventoryItem.findMany({
          where,
          orderBy: [
            {
              isActive: "desc",
            },
            {
              name: "asc",
            },
          ],
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),

        prisma.inventoryItem.count(),

        prisma.inventoryItem.count({
          where: {
            isActive: true,
          },
        }),

        prisma.inventoryItem.count({
          where: {
            isActive: false,
          },
        }),

        prisma.inventoryCategory.findMany({
          where: {
            isActive: true,
          },
          orderBy: {
            name: "asc",
          },
          select: {
            id: true,
            name: true,
          },
        }),
      ]);

    return NextResponse.json(
      {
        success: true,
        data: items.map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          categoryId: item.categoryId,
          category: item.category,
          unit: item.unit,
          stock: Number(item.stock),
          minimumStock: Number(item.minimumStock),
          purchasePrice: Number(item.purchasePrice),
          location: item.location,
          isActive: item.isActive,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        categories,
        stats: {
          total,
          active,
          inactive,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/inventory/items ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data barang.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * POST /api/inventory/items
 *
 * Membuat master barang baru.
 *
 * Stock awal selalu 0.
 * Stok bertambah melalui transaksi Barang Masuk.
 */
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

    if (!isAllowedRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Kamu tidak memiliki akses untuk membuat barang.",
        },
        { status: 403 },
      );
    }

    let body: {
      code?: unknown;
      name?: unknown;
      description?: unknown;
      categoryId?: unknown;
      unit?: unknown;
      minimumStock?: unknown;
      purchasePrice?: unknown;
      location?: unknown;
      isActive?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Format JSON tidak valid.",
        },
        { status: 400 },
      );
    }

    // ==========================================
    // CODE
    // ==========================================

    if (typeof body.code !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Kode barang wajib diisi.",
        },
        { status: 400 },
      );
    }

    const code = body.code.trim().toUpperCase();

    if (code.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode barang minimal 2 karakter.",
        },
        { status: 400 },
      );
    }

    if (code.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode barang maksimal 50 karakter.",
        },
        { status: 400 },
      );
    }

    // ==========================================
    // NAME
    // ==========================================

    if (typeof body.name !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Nama barang wajib diisi.",
        },
        { status: 400 },
      );
    }

    const name = body.name.trim();

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama barang minimal 2 karakter.",
        },
        { status: 400 },
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama barang maksimal 150 karakter.",
        },
        { status: 400 },
      );
    }

    // ==========================================
    // CATEGORY
    // ==========================================

    const categoryId = parsePositiveInteger(body.categoryId);

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori barang wajib dipilih.",
        },
        { status: 400 },
      );
    }

    const category = await prisma.inventoryCategory.findFirst({
      where: {
        id: categoryId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori barang tidak ditemukan atau tidak aktif.",
        },
        { status: 400 },
      );
    }

    // ==========================================
    // UNIT
    // ==========================================

    const allowedUnits = [
      "PCS",
      "UNIT",
      "METER",
      "BOX",
      "ROLL",
      "SET",
      "PACK",
    ];

    if (
      typeof body.unit !== "string" ||
      !allowedUnits.includes(body.unit)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Satuan barang tidak valid.",
        },
        { status: 400 },
      );
    }

const unit = body.unit as InventoryUnit;
    // ==========================================
    // DESCRIPTION
    // ==========================================

    let description: string | null = null;

    if (typeof body.description === "string") {
      description = body.description.trim() || null;

      if (description && description.length > 1000) {
        return NextResponse.json(
          {
            success: false,
            message: "Deskripsi maksimal 1000 karakter.",
          },
          { status: 400 },
        );
      }
    }

    // ==========================================
    // MINIMUM STOCK
    // ==========================================

    const minimumStock =
      body.minimumStock === undefined ||
      body.minimumStock === ""
        ? 0
        : parseNonNegativeNumber(body.minimumStock);

    if (minimumStock === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum stok tidak valid.",
        },
        { status: 400 },
      );
    }

    // ==========================================
    // PURCHASE PRICE
    // ==========================================

    const purchasePrice =
      body.purchasePrice === undefined ||
      body.purchasePrice === ""
        ? 0
        : parseNonNegativeNumber(body.purchasePrice);

    if (purchasePrice === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Harga beli tidak valid.",
        },
        { status: 400 },
      );
    }

    // ==========================================
    // LOCATION
    // ==========================================

    let location: string | null = null;

    if (typeof body.location === "string") {
      location = body.location.trim() || null;

      if (location && location.length > 150) {
        return NextResponse.json(
          {
            success: false,
            message: "Lokasi penyimpanan maksimal 150 karakter.",
          },
          { status: 400 },
        );
      }
    }

    // ==========================================
    // ACTIVE STATUS
    // ==========================================

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    // ==========================================
    // DUPLICATE CODE
    // ==========================================

    const existing = await prisma.inventoryItem.findUnique({
      where: {
        code,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Kode barang "${code}" sudah digunakan.`,
        },
        { status: 409 },
      );
    }

    // ==========================================
    // CREATE
    // ==========================================

    const item = await prisma.inventoryItem.create({
      data: {
        code,
        name,
        description,
        categoryId,
        unit,
        stock: new Prisma.Decimal(0),
        minimumStock: new Prisma.Decimal(minimumStock),
        purchasePrice: new Prisma.Decimal(purchasePrice),
        location,
        isActive,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Barang berhasil ditambahkan.",
        data: {
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          categoryId: item.categoryId,
          category: item.category,
          unit: item.unit,
          stock: Number(item.stock),
          minimumStock: Number(item.minimumStock),
          purchasePrice: Number(item.purchasePrice),
          location: item.location,
          isActive: item.isActive,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/inventory/items ERROR:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode barang sudah digunakan.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan barang.",
      },
      {
        status: 500,
      },
    );
  }
}