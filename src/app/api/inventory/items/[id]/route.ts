import { NextResponse } from "next/server";
import { Prisma,InventoryUnit } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"];

function isAllowedRole(role: string) {
  return ALLOWED_ROLES.includes(role);
}

function parseId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function parseNonNegativeNumber(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}

/**
 * GET /api/inventory/items/[id]
 */
export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
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

    if (!isAllowedRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
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
          message: "ID barang tidak valid.",
        },
        { status: 400 },
      );
    }

    const item = await prisma.inventoryItem.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        stockInItems: {
          orderBy: {
            stockIn: {
              transactionDate: "desc",
            },
          },
          take: 10,
          include: {
            stockIn: {
              select: {
                id: true,
                transactionCode: true,
                transactionDate: true,
                supplier: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
        stockOutItems: {
          orderBy: {
            stockOut: {
              transactionDate: "desc",
            },
          },
          take: 10,
          include: {
            stockOut: {
              select: {
                id: true,
                transactionCode: true,
                transactionDate: true,
                purpose: true,
                technician: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        installationItems: {
          orderBy: {
            installation: {
              installationDate: "desc",
            },
          },
          take: 10,
          include: {
            installation: {
              select: {
                id: true,
                installationCode: true,
                installationDate: true,
                customer: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                technician: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
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

        stockIns: item.stockInItems.map((entry) => ({
          id: entry.id,
          quantity: Number(entry.quantity),
          unitPrice: Number(entry.unitPrice),
          subtotal: Number(entry.subtotal),
          transaction: entry.stockIn,
        })),

        stockOuts: item.stockOutItems.map((entry) => ({
          id: entry.id,
          quantity: Number(entry.quantity),
          transaction: entry.stockOut,
        })),

        installations: item.installationItems.map((entry) => ({
          id: entry.id,
          quantity: Number(entry.quantity),
          notes: entry.notes,
          installation: entry.installation,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/inventory/items/[id] ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail barang.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/inventory/items/[id]
 */
export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
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

    if (!isAllowedRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
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
          message: "ID barang tidak valid.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.inventoryItem.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const data: Prisma.InventoryItemUpdateInput = {};

    // ==========================================
    // CODE
    // ==========================================

    if (body.code !== undefined) {
      if (typeof body.code !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Kode barang tidak valid.",
          },
          { status: 400 },
        );
      }

      const code = body.code.trim().toUpperCase();

      if (code.length < 2 || code.length > 50) {
        return NextResponse.json(
          {
            success: false,
            message: "Kode barang harus 2-50 karakter.",
          },
          { status: 400 },
        );
      }

      data.code = code;
    }

    // ==========================================
    // NAME
    // ==========================================

    if (body.name !== undefined) {
      if (typeof body.name !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Nama barang tidak valid.",
          },
          { status: 400 },
        );
      }

      const name = body.name.trim();

      if (name.length < 2 || name.length > 150) {
        return NextResponse.json(
          {
            success: false,
            message: "Nama barang harus 2-150 karakter.",
          },
          { status: 400 },
        );
      }

      data.name = name;
    }

    // ==========================================
    // CATEGORY
    // ==========================================

    if (body.categoryId !== undefined) {
      const categoryId = Number(body.categoryId);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Kategori barang tidak valid.",
          },
          { status: 400 },
        );
      }

      const category =
        await prisma.inventoryCategory.findFirst({
          where: {
            id: categoryId,
            isActive: true,
          },
          select: {
            id: true,
          },
        });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Kategori tidak ditemukan atau tidak aktif.",
          },
          { status: 400 },
        );
      }

      data.category = {
        connect: {
          id: categoryId,
        },
      };
    }

    // ==========================================
    // DESCRIPTION
    // ==========================================

    if (body.description !== undefined) {
      if (
        body.description !== null &&
        typeof body.description !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Deskripsi tidak valid.",
          },
          { status: 400 },
        );
      }

      const description =
        typeof body.description === "string"
          ? body.description.trim()
          : null;

      if (
        description &&
        description.length > 1000
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Deskripsi maksimal 1000 karakter.",
          },
          { status: 400 },
        );
      }

      data.description = description;
    }

    // ==========================================
    // UNIT
    // ==========================================

    if (body.unit !== undefined) {
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

      data.unit =
        body.unit as InventoryUnit;
    }

    // ==========================================
    // MINIMUM STOCK
    // ==========================================

    if (body.minimumStock !== undefined) {
      const minimumStock =
        parseNonNegativeNumber(body.minimumStock);

      if (minimumStock === null) {
        return NextResponse.json(
          {
            success: false,
            message: "Minimum stok tidak valid.",
          },
          { status: 400 },
        );
      }

      data.minimumStock =
        new Prisma.Decimal(minimumStock);
    }

    // ==========================================
    // PURCHASE PRICE
    // ==========================================

    if (body.purchasePrice !== undefined) {
      const purchasePrice =
        parseNonNegativeNumber(body.purchasePrice);

      if (purchasePrice === null) {
        return NextResponse.json(
          {
            success: false,
            message: "Harga beli tidak valid.",
          },
          { status: 400 },
        );
      }

      data.purchasePrice =
        new Prisma.Decimal(purchasePrice);
    }

    // ==========================================
    // LOCATION
    // ==========================================

    if (body.location !== undefined) {
      if (
        body.location !== null &&
        typeof body.location !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Lokasi tidak valid.",
          },
          { status: 400 },
        );
      }

      const location =
        typeof body.location === "string"
          ? body.location.trim()
          : null;

      if (
        location &&
        location.length > 150
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Lokasi maksimal 150 karakter.",
          },
          { status: 400 },
        );
      }

      data.location = location;
    }

    // ==========================================
    // STATUS
    // ==========================================

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message: "Status barang tidak valid.",
          },
          { status: 400 },
        );
      }

      data.isActive = body.isActive;
    }

    // ==========================================
    // UPDATE
    // ==========================================

    const item = await prisma.inventoryItem.update({
      where: {
        id,
      },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Barang berhasil diperbarui.",
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
    });
  } catch (error) {
    console.error(
      "PATCH /api/inventory/items/[id] ERROR:",
      error,
    );

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
        message: "Gagal memperbarui barang.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/inventory/items/[id]
 *
 * Barang tidak benar-benar dihapus.
 * Kita gunakan soft delete agar histori transaksi
 * tetap aman.
 */
export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
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

    if (!isAllowedRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
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
          message: "ID barang tidak valid.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.inventoryItem.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (!existing.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang sudah berstatus nonaktif.",
        },
        { status: 400 },
      );
    }

    const item = await prisma.inventoryItem.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Barang berhasil dinonaktifkan.",
      data: {
        id: item.id,
        isActive: item.isActive,
      },
    });
  } catch (error) {
    console.error(
      "DELETE /api/inventory/items/[id] ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menonaktifkan barang.",
      },
      { status: 500 },
    );
  }
}