import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit-log';

function getClientIp(request: Request) {
  return (
    request.headers
      .get('x-forwarded-for')
      ?.split(',')[0]
      .trim() ||
    request.headers.get('x-real-ip') ||
    null
  );
}

function cleanString(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

function generateInstallationCode() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const random = Math.floor(
    100000 + Math.random() * 900000,
  );

  return `GINST-${year}${month}${day}-${random}`;
}

/**
 * GET /api/inventory/installations
 *
 * Daftar riwayat pemasangan.
 *
 * Akses:
 * - SUPER_ADMIN
 * - ADMIN
 */
export async function GET(request: Request) {
  try {
    await requireRole([
      'SUPER_ADMIN',
      'ADMIN',
    ]);

    const { searchParams } = new URL(
      request.url,
    );

    const search = cleanString(
      searchParams.get('search'),
    );

    const installations =
      await prisma.installation.findMany({
        where: search
          ? {
              OR: [
                {
                  installationCode: {
                    contains: search,
                  },
                },
                {
                  address: {
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
                {
                  technician: {
                    name: {
                      contains: search,
                    },
                  },
                },
              ],
            }
          : undefined,

        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              name: true,
              phone: true,
              address: true,
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
            orderBy: {
              id: 'asc',
            },
          },
        },

        orderBy: {
          installationDate: 'desc',
        },
      });

    const data = installations.map(
      (installation) => ({
        ...installation,

        items: installation.items.map(
          (line) => ({
            ...line,
            quantity: line.quantity.toString(),
          }),
        ),
      }),
    );

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'UNAUTHORIZED'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda belum login.',
        },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === 'FORBIDDEN'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Anda tidak memiliki akses.',
        },
        { status: 403 },
      );
    }

    console.error(
      'GET /api/inventory/installations error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal mengambil data pemasangan.',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/inventory/installations
 *
 * Membuat pemasangan baru sekaligus
 * mengurangi stok material.
 */
export async function POST(request: Request) {
  try {
    const currentUser =
      await requireRole([
        'SUPER_ADMIN',
        'ADMIN',
      ]);

    const body = await request.json();

    const customerId = Number(
      body.customerId,
    );

    const technicianId = Number(
      body.technicianId,
    );

    const address = cleanString(
      body.address,
    );

    const notes = cleanString(
      body.notes,
    );

    const installationDate =
      body.installationDate
        ? new Date(body.installationDate)
        : new Date();

    const rawItems = Array.isArray(
      body.items,
    )
      ? body.items
      : [];

    // =========================================
    // VALIDASI DASAR
    // =========================================

    if (
      !Number.isInteger(customerId) ||
      customerId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Customer tidak valid.',
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(technicianId) ||
      technicianId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Teknisi tidak valid.',
        },
        { status: 400 },
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Alamat pemasangan wajib diisi.',
        },
        { status: 400 },
      );
    }

    if (
      Number.isNaN(
        installationDate.getTime(),
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Tanggal pemasangan tidak valid.',
        },
        { status: 400 },
      );
    }

    if (rawItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Minimal satu material harus dipilih.',
        },
        { status: 400 },
      );
    }

    // =========================================
    // NORMALISASI MATERIAL
    // =========================================

    const normalizedItems: Array<{
      itemId: number;
      quantity: Prisma.Decimal;
      notes: string | null;
    }> = [];

    const usedItemIds = new Set<number>();

    for (const rawItem of rawItems) {
      const itemId = Number(
        rawItem?.itemId,
      );

      const quantity = new Prisma.Decimal(
        rawItem?.quantity ?? 0,
      );

      const itemNotes =
        cleanString(rawItem?.notes) ||
        null;

      if (
        !Number.isInteger(itemId) ||
        itemId <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Material tidak valid.',
          },
          { status: 400 },
        );
      }

      if (quantity.lte(0)) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Jumlah material harus lebih dari 0.',
          },
          { status: 400 },
        );
      }

      if (usedItemIds.has(itemId)) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Material yang sama tidak boleh dimasukkan dua kali.',
          },
          { status: 400 },
        );
      }

      usedItemIds.add(itemId);

      normalizedItems.push({
        itemId,
        quantity,
        notes: itemNotes,
      });
    }

    // =========================================
    // VALIDASI CUSTOMER
    // =========================================

    const customer =
      await prisma.customer.findUnique({
        where: {
          id: customerId,
        },
        select: {
          id: true,
          customerCode: true,
          name: true,
          address: true,
          status: true,
        },
      });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Customer tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    // =========================================
    // VALIDASI TEKNISI
    // =========================================

    const technician =
      await prisma.user.findUnique({
        where: {
          id: technicianId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          status: true,
        },
      });

    if (!technician) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Teknisi tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    if (technician.role !== 'TEKNISI') {
      return NextResponse.json(
        {
          success: false,
          message:
            'User yang dipilih bukan teknisi.',
        },
        { status: 400 },
      );
    }

    if (technician.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          message:
            'Teknisi sedang tidak aktif.',
        },
        { status: 400 },
      );
    }

    // =========================================
    // TRANSACTION
    // =========================================

    const result =
      await prisma.$transaction(
        async (tx) => {
          // -------------------------------------
          // Ambil semua material
          // -------------------------------------

          const itemIds =
            normalizedItems.map(
              (item) => item.itemId,
            );

          const inventoryItems =
            await tx.inventoryItem.findMany({
              where: {
                id: {
                  in: itemIds,
                },
                isActive: true,
              },
              select: {
                id: true,
                code: true,
                name: true,
                unit: true,
                stock: true,
              },
            });

          if (
            inventoryItems.length !==
            itemIds.length
          ) {
            throw new Error(
              'Salah satu material tidak ditemukan atau tidak aktif.',
            );
          }

          // -------------------------------------
          // Validasi stok terlebih dahulu
          // -------------------------------------

          for (const line of normalizedItems) {
            const item =
              inventoryItems.find(
                (inventoryItem) =>
                  inventoryItem.id ===
                  line.itemId,
              );

            if (!item) {
              throw new Error(
                'Material tidak ditemukan.',
              );
            }

            if (
              item.stock.lt(
                line.quantity,
              )
            ) {
              throw new Error(
                `Stok ${item.name} tidak mencukupi. Stok tersedia: ${item.stock.toString()} ${item.unit}.`,
              );
            }
          }

          // -------------------------------------
          // Generate kode unik
          // -------------------------------------

          let installationCode =
            generateInstallationCode();

          let existing =
            await tx.installation.findUnique({
              where: {
                installationCode,
              },
              select: {
                id: true,
              },
            });

          while (existing) {
            installationCode =
              generateInstallationCode();

            existing =
              await tx.installation.findUnique({
                where: {
                  installationCode,
                },
                select: {
                  id: true,
                },
              });
          }

          // -------------------------------------
          // Create installation
          // -------------------------------------

          const installation =
            await tx.installation.create({
              data: {
                installationCode,
                customerId,
                technicianId,
                installationDate,
                address,
                notes: notes || null,
              },
            });

          // -------------------------------------
          // Create material lines
          // -------------------------------------

          for (const line of normalizedItems) {
            await tx.installationItem.create({
              data: {
                installationId:
                  installation.id,
                itemId: line.itemId,
                quantity: line.quantity,
                notes: line.notes,
              },
            });

            // -----------------------------------
            // Kurangi stok secara atomic
            // -----------------------------------

            const updated =
              await tx.inventoryItem.updateMany({
                where: {
                  id: line.itemId,
                  isActive: true,
                  stock: {
                    gte: line.quantity,
                  },
                },
                data: {
                  stock: {
                    decrement:
                      line.quantity,
                  },
                },
              });

            if (updated.count !== 1) {
              throw new Error(
                'Stok berubah sebelum transaksi selesai. Silakan coba lagi.',
              );
            }
          }

          // -------------------------------------
          // Return complete data
          // -------------------------------------

          return tx.installation.findUnique({
            where: {
              id: installation.id,
            },

            include: {
              customer: {
                select: {
                  id: true,
                  customerCode: true,
                  name: true,
                  phone: true,
                  address: true,
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
        },
      );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Pemasangan gagal dibuat.',
        },
        { status: 500 },
      );
    }

    // =========================================
    // AUDIT LOG
    // =========================================

    await createAuditLog({
      userId: currentUser.id,
      action: 'CREATE_INSTALLATION',
      entity: 'Installation',
      entityId: result.id,
      description:
        `Pemasangan ${result.installationCode} dibuat untuk customer ${result.customer.customerCode} - ${result.customer.name}.`,
      ipAddress: getClientIp(request),
      userAgent:
        request.headers.get('user-agent'),
    });

    // =========================================
    // RESPONSE
    // =========================================

    return NextResponse.json(
      {
        success: true,
        message:
          'Pemasangan berhasil dibuat dan stok material telah diperbarui.',
        data: {
          ...result,

          items: result.items.map(
            (item) => ({
              ...item,
              quantity:
                item.quantity.toString(),
            }),
          ),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'UNAUTHORIZED'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda belum login.',
        },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === 'FORBIDDEN'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Anda tidak memiliki akses.',
        },
        { status: 403 },
      );
    }

    if (error instanceof Error) {
      const knownMessages = [
        'Customer tidak ditemukan.',
        'Teknisi tidak ditemukan.',
        'User yang dipilih bukan teknisi.',
        'Teknisi sedang tidak aktif.',
        'Salah satu material tidak ditemukan atau tidak aktif.',
        'Material tidak ditemukan.',
        'Stok berubah sebelum transaksi selesai. Silakan coba lagi.',
      ];

      const isKnownError =
        knownMessages.some(
          (message) =>
            error.message === message,
        ) ||
        error.message.startsWith(
          'Stok ',
        );

      if (isKnownError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 400 },
        );
      }
    }

    console.error(
      'POST /api/inventory/installations error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal membuat pemasangan.',
      },
      { status: 500 },
    );
  }
}