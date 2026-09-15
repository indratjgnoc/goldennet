import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/audit";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"];

function decimal(value: unknown) {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        throw new Error("Jumlah harus lebih besar dari 0.");
    }

    return new Prisma.Decimal(number);
}

function serializeDecimal(value: Prisma.Decimal | null | undefined) {
    if (value === null || value === undefined) return null;
    return value.toString();
}

function generateTransactionCode() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const random = Math.floor(100000 + Math.random() * 900000);

    return `GOUT-${yyyy}${mm}${dd}-${random}`;
}

// ======================================================
// GET
// ======================================================

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 },
            );
        }

        if (!ALLOWED_ROLES.includes(user.role)) {
            return NextResponse.json(
                { message: "Kamu tidak memiliki akses." },
                { status: 403 },
            );
        }

        const { searchParams } = new URL(request.url);

        const page = Math.max(
            Number(searchParams.get("page") || "1"),
            1,
        );

        const limit = Math.min(
            Math.max(Number(searchParams.get("limit") || "10"), 1),
            100,
        );

        const search = searchParams.get("search")?.trim() || "";

        const where = search
            ? {
                OR: [
                    {
                        transactionCode: {
                            contains: search,
                        },
                    },
                    {
                        purpose: {
                            contains: search,
                        },
                    },
                    {
                        technician: {
                            name: {
                                contains: search,
                            },
                        },
                    },
                ],
            }
            : {};

        const [transactions, total] = await Promise.all([
            prisma.stockOut.findMany({
                where,
                include: {
                    issuedBy: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                        },
                    },
                    technician: {
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
                skip: (page - 1) * limit,
                take: limit,
            }),

            prisma.stockOut.count({
                where,
            }),
        ]);

        const data = transactions.map((transaction) => ({
            id: transaction.id,
            transactionCode: transaction.transactionCode,
            transactionDate: transaction.transactionDate,
            purpose: transaction.purpose,
            notes: transaction.notes,

            issuedBy: transaction.issuedBy,

            technician: transaction.technician,

            items: transaction.items.map((item) => ({
                id: item.id,
                itemId: item.itemId,
                quantity: serializeDecimal(item.quantity),
                item: item.item,
            })),

            totalItems: transaction.items.length,
            totalQuantity: transaction.items.reduce(
                (total, item) =>
                    total + Number(item.quantity),
                0,
            ),

            createdAt: transaction.createdAt,
        }));

        return NextResponse.json({
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET STOCK OUT ERROR:", error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Gagal mengambil transaksi barang keluar.",
            },
            { status: 500 },
        );
    }
}

// ======================================================
// POST
// ======================================================

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 },
            );
        }

        if (!ALLOWED_ROLES.includes(user.role)) {
            return NextResponse.json(
                { message: "Kamu tidak memiliki akses." },
                { status: 403 },
            );
        }

        const body = await request.json();

        const technicianId =
            body.technicianId === null ||
                body.technicianId === undefined ||
                body.technicianId === ""
                ? null
                : Number(body.technicianId);

        if (
            technicianId !== null &&
            (!Number.isInteger(technicianId) || technicianId <= 0)
        ) {
            return NextResponse.json(
                { message: "Teknisi tidak valid." },
                { status: 400 },
            );
        }

        if (!Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json(
                { message: "Minimal satu barang harus dipilih." },
                { status: 400 },
            );
        }

        const transactionDate = body.transactionDate
            ? new Date(body.transactionDate)
            : new Date();

        if (Number.isNaN(transactionDate.getTime())) {
            return NextResponse.json(
                { message: "Tanggal transaksi tidak valid." },
                { status: 400 },
            );
        }

        const purpose =
            typeof body.purpose === "string"
                ? body.purpose.trim()
                : null;

        const notes =
            typeof body.notes === "string"
                ? body.notes.trim()
                : null;

        // --------------------------------------------------
        // Normalisasi item
        // --------------------------------------------------

        const normalizedItems = body.items.map(
            (item: { itemId: unknown; quantity: unknown }) => ({
                itemId: Number(item.itemId),
                quantity: decimal(item.quantity),
            }),
        );

        // --------------------------------------------------
        // Cegah item yang sama masuk dua kali
        // --------------------------------------------------

        const itemIds = normalizedItems.map(
            (item: { itemId: number; quantity: Prisma.Decimal }) =>
                item.itemId,
        );

        if (new Set(itemIds).size !== itemIds.length) {
            return NextResponse.json(
                {
                    message:
                        "Barang yang sama tidak boleh dimasukkan dua kali.",
                },
                { status: 400 },
            );
        }

        // --------------------------------------------------
        // Validasi teknisi
        // --------------------------------------------------

        if (technicianId !== null) {
            const technician = await prisma.user.findFirst({
                where: {
                    id: technicianId,
                    role: "TEKNISI",
                    status: "ACTIVE",
                },
            });

            if (!technician) {
                return NextResponse.json(
                    {
                        message:
                            "Teknisi tidak ditemukan atau tidak aktif.",
                    },
                    { status: 400 },
                );
            }
        }

        // --------------------------------------------------
        // TRANSACTION
        // --------------------------------------------------

        const result = await prisma.$transaction(async (tx) => {
            const transactionCode =
                generateTransactionCode();

            const stockOut = await tx.stockOut.create({
                data: {
                    transactionCode,
                    issuedById: user.id,
                    technicianId,
                    transactionDate,
                    purpose,
                    notes,
                },
            });

            for (const line of normalizedItems) {
                if (
                    !Number.isInteger(line.itemId) ||
                    line.itemId <= 0
                ) {
                    throw new Error("ID barang tidak valid.");
                }

                // ------------------------------------------------
                // Atomic stock validation + decrement
                // ------------------------------------------------

                const updated = await tx.inventoryItem.updateMany({
                    where: {
                        id: line.itemId,
                        isActive: true,
                        stock: {
                            gte: line.quantity,
                        },
                    },
                    data: {
                        stock: {
                            decrement: line.quantity,
                        },
                    },
                });

                if (updated.count !== 1) {
                    const item = await tx.inventoryItem.findUnique({
                        where: {
                            id: line.itemId,
                        },
                        select: {
                            name: true,
                            stock: true,
                            isActive: true,
                        },
                    });

                    if (!item) {
                        throw new Error(
                            `Barang dengan ID ${line.itemId} tidak ditemukan.`,
                        );
                    }

                    if (!item.isActive) {
                        throw new Error(
                            `Barang ${item.name} sudah tidak aktif.`,
                        );
                    }

                    throw new Error(
                        `Stok ${item.name} tidak mencukupi. Stok tersedia: ${item.stock.toString()}.`,
                    );
                }

                await tx.stockOutItem.create({
                    data: {
                        stockOutId: stockOut.id,
                        itemId: line.itemId,
                        quantity: line.quantity,
                    },
                });
            }

            return tx.stockOut.findUniqueOrThrow({
                where: {
                    id: stockOut.id,
                },
                include: {
                    issuedBy: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                        },
                    },
                    technician: {
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
        });

        // --------------------------------------------------
        // AUDIT
        // --------------------------------------------------

        await createAuditLog({
            userId: user.id,
            action: "CREATE",
            entity: "StockOut",
            entityId: result.id,
        });

        return NextResponse.json(
            {
                message:
                    "Transaksi barang keluar berhasil dibuat.",
                data: {
                    id: result.id,
                    transactionCode:
                        result.transactionCode,
                    transactionDate:
                        result.transactionDate,
                    purpose: result.purpose,
                    notes: result.notes,
                    issuedBy: result.issuedBy,
                    technician: result.technician,
                    items: result.items.map((item) => ({
                        id: item.id,
                        itemId: item.itemId,
                        quantity:
                            item.quantity.toString(),
                        item: item.item,
                    })),
                },
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST STOCK OUT ERROR:", error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Gagal membuat transaksi barang keluar.",
            },
            { status: 500 },
        );
    }
}