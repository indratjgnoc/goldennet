import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/audit";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

type StockInItemInput = {
  itemId?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
};

type StockInRequest = {
  supplierId?: unknown;
  transactionDate?: unknown;
  notes?: unknown;
  items?: unknown;
};

function isAllowedRole(role: string) {
  return ALLOWED_ROLES.includes(
    role as (typeof ALLOWED_ROLES)[number],
  );
}

function parsePositiveInteger(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parsePositiveDecimal(value: unknown): Prisma.Decimal | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const normalized = String(value).trim();

  if (!normalized) {
    return null;
  }

  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return null;
  }

  try {
    return new Prisma.Decimal(normalized);
  } catch {
    return null;
  }
}

function parseNonNegativeDecimal(
  value: unknown,
): Prisma.Decimal | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const normalized = String(value).trim();

  if (!normalized) {
    return null;
  }

  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return null;
  }

  try {
    return new Prisma.Decimal(normalized);
  } catch {
    return null;
  }
}

function parseTransactionDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") {
    return new Date();
  }

  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function generateTransactionCode() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const random = Math.floor(
    100000 + Math.random() * 900000,
  );

  return `GIN-${year}${month}${day}-${random}`;
}

/**
 * GET /api/inventory/stock-in
 *
 * Mengambil daftar transaksi Barang Masuk.
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
          message: "Kamu tidak memiliki akses ke Barang Masuk.",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() ?? "";
    const supplierIdParam = searchParams.get("supplierId");
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = Math.max(
      Number(pageParam) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(Number(limitParam) || 20, 1),
      100,
    );

    const skip = (page - 1) * limit;

    const supplierId = supplierIdParam
      ? parsePositiveInteger(supplierIdParam)
      : null;

    const where: Prisma.StockInWhereInput = {
      ...(supplierId
        ? {
            supplierId,
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                transactionCode: {
                  contains: search,
                },
              },
              {
                supplier: {
                  name: {
                    contains: search,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [transactions, total] = await prisma.$transaction([
      prisma.stockIn.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          receivedBy: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          items: {
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
        orderBy: {
          transactionDate: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.stockIn.count({
        where,
      }),
    ]);

    const serializedTransactions = transactions.map(
      (transaction) => ({
        id: transaction.id,
        transactionCode: transaction.transactionCode,
        transactionDate: transaction.transactionDate,
        notes: transaction.notes,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,

        supplier: transaction.supplier,

        receivedBy: transaction.receivedBy,

        items: transaction.items.map((item) => ({
          id: item.id,
          itemId: item.itemId,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          subtotal: item.subtotal.toString(),
          item: item.item,
        })),

        totalAmount: transaction.items
          .reduce(
            (total, item) =>
              total.plus(item.subtotal),
            new Prisma.Decimal(0),
          )
          .toString(),
      }),
    );

    return NextResponse.json({
      success: true,
      data: serializedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET STOCK IN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data Barang Masuk.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/inventory/stock-in
 *
 * Membuat transaksi Barang Masuk dan otomatis
 * menambahkan stok barang.
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
          message: "Kamu tidak memiliki akses untuk mencatat Barang Masuk.",
        },
        { status: 403 },
      );
    }

    let body: StockInRequest;

    try {
      body = (await request.json()) as StockInRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Format request tidak valid.",
        },
        { status: 400 },
      );
    }

    const supplierId = parsePositiveInteger(body.supplierId);

    if (!supplierId) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier wajib dipilih.",
        },
        { status: 400 },
      );
    }

    const transactionDate = parseTransactionDate(
      body.transactionDate,
    );

    if (!transactionDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal transaksi tidak valid.",
        },
        { status: 400 },
      );
    }

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim()
        : "";

    if (notes.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Catatan maksimal 1000 karakter.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.items)) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimal harus ada satu barang.",
        },
        { status: 400 },
      );
    }

    if (body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimal harus ada satu barang.",
        },
        { status: 400 },
      );
    }

    if (body.items.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Maksimal 100 baris barang per transaksi.",
        },
        { status: 400 },
      );
    }

    /**
     * Normalisasi item terlebih dahulu.
     *
     * Kalau frontend mengirim item yang sama dua kali,
     * kita tolak supaya stok tidak membingungkan.
     */
    const normalizedItems: {
      itemId: number;
      quantity: Prisma.Decimal;
      unitPrice: Prisma.Decimal;
    }[] = [];

    const itemIds = new Set<number>();

    for (const rawItem of body.items as StockInItemInput[]) {
      const itemId = parsePositiveInteger(rawItem.itemId);
      const quantity = parsePositiveDecimal(rawItem.quantity);
      const unitPrice = parseNonNegativeDecimal(
        rawItem.unitPrice,
      );

      if (!itemId) {
        return NextResponse.json(
          {
            success: false,
            message: "ID barang tidak valid.",
          },
          { status: 400 },
        );
      }

      if (!quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Quantity barang ID ${itemId} harus lebih dari 0.`,
          },
          { status: 400 },
        );
      }

      if (!unitPrice) {
        return NextResponse.json(
          {
            success: false,
            message: `Harga beli barang ID ${itemId} tidak valid.`,
          },
          { status: 400 },
        );
      }

      if (itemIds.has(itemId)) {
        return NextResponse.json(
          {
            success: false,
            message: `Barang ID ${itemId} tidak boleh muncul lebih dari sekali.`,
          },
          { status: 400 },
        );
      }

      itemIds.add(itemId);

      normalizedItems.push({
        itemId,
        quantity,
        unitPrice,
      });
    }

    /**
     * Validasi supplier sebelum transaksi.
     */
    const supplier = await prisma.inventorySupplier.findUnique({
      where: {
        id: supplierId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (!supplier.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier tersebut sudah tidak aktif.",
        },
        { status: 400 },
      );
    }

    /**
     * Ambil seluruh barang sekaligus.
     */
    const inventoryItems =
      await prisma.inventoryItem.findMany({
        where: {
          id: {
            in: normalizedItems.map(
              (item) => item.itemId,
            ),
          },
        },
        select: {
          id: true,
          code: true,
          name: true,
          unit: true,
          stock: true,
          isActive: true,
        },
      });

    if (
      inventoryItems.length !== normalizedItems.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ada barang yang tidak ditemukan atau sudah tidak tersedia.",
        },
        { status: 404 },
      );
    }

    const itemMap = new Map(
      inventoryItems.map((item) => [
        item.id,
        item,
      ]),
    );

    for (const inputItem of normalizedItems) {
      const item = itemMap.get(inputItem.itemId);

      if (!item) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Barang yang dipilih tidak ditemukan.",
          },
          { status: 404 },
        );
      }

      if (!item.isActive) {
        return NextResponse.json(
          {
            success: false,
            message: `Barang "${item.name}" sudah tidak aktif.`,
          },
          { status: 400 },
        );
      }
    }

    /**
     * Generate transaction code.
     *
     * Tetap dicek ke database karena field
     * transactionCode memiliki UNIQUE constraint.
     */
    let transactionCode = "";
    let transactionCreated = false;

    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateTransactionCode();

      const existing =
        await prisma.stockIn.findUnique({
          where: {
            transactionCode: candidate,
          },
          select: {
            id: true,
          },
        });

      if (!existing) {
        transactionCode = candidate;
        transactionCreated = true;
        break;
      }
    }

    if (!transactionCreated) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal membuat nomor transaksi. Silakan coba lagi.",
        },
        { status: 500 },
      );
    }

    /**
     * SEMUA perubahan database dilakukan dalam
     * satu transaction.
     *
     * Jika salah satu proses gagal:
     * - StockIn tidak dibuat
     * - StockInItem tidak dibuat
     * - stok tidak berubah
     */
    const result = await prisma.$transaction(
      async (tx) => {
        const stockIn = await tx.stockIn.create({
          data: {
            transactionCode,
            supplierId,
            receivedById: user.id,
            transactionDate,
            notes: notes || null,
          },
        });

        for (const inputItem of normalizedItems) {
          const item =
            itemMap.get(inputItem.itemId);

          if (!item) {
            throw new Error(
              "Barang tidak ditemukan.",
            );
          }

          const subtotal =
            inputItem.quantity.mul(
              inputItem.unitPrice,
            );

          await tx.stockInItem.create({
            data: {
              stockInId: stockIn.id,
              itemId: inputItem.itemId,
              quantity: inputItem.quantity,
              unitPrice: inputItem.unitPrice,
              subtotal,
            },
          });

          await tx.inventoryItem.update({
            where: {
              id: inputItem.itemId,
            },
            data: {
              stock: {
                increment: inputItem.quantity,
              },

              /**
               * Harga beli terakhir disimpan sebagai
               * purchasePrice barang.
               */
              purchasePrice:
                inputItem.unitPrice,
            },
          });
        }

        return tx.stockIn.findUniqueOrThrow({
          where: {
            id: stockIn.id,
          },
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            receivedBy: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            items: {
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
        });
      },
    );

    /**
     * Audit dilakukan setelah transaksi database
     * berhasil.
     */
    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "StockIn",
      entityId: result.id,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Transaksi Barang Masuk berhasil disimpan.",
        data: {
          id: result.id,
          transactionCode:
            result.transactionCode,
          transactionDate:
            result.transactionDate,
          notes: result.notes,
          supplier: result.supplier,
          receivedBy: result.receivedBy,
          items: result.items.map((item) => ({
            id: item.id,
            itemId: item.itemId,
            quantity:
              item.quantity.toString(),
            unitPrice:
              item.unitPrice.toString(),
            subtotal:
              item.subtotal.toString(),
            item: item.item,
          })),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST STOCK IN ERROR:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Nomor transaksi sudah digunakan. Silakan coba lagi.",
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal menyimpan transaksi Barang Masuk.",
      },
      { status: 500 },
    );
  }
}