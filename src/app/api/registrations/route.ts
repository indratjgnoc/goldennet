import { randomInt } from 'node:crypto';

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface RegistrationRequest {
  packageId?: unknown;
  coverageId?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  address?: unknown;
  notes?: unknown;
}

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 20;
const MAX_EMAIL_LENGTH = 254;
const MAX_ADDRESS_LENGTH = 500;
const MAX_NOTES_LENGTH = 1000;

const MAX_CODE_GENERATION_ATTEMPTS = 5;

/**
 * Mengubah nilai menjadi integer positif.
 *
 * Kita menerima number maupun string angka karena
 * nilai dari form frontend terkadang dikirim sebagai string.
 */
function parsePositiveInteger(
  value: unknown,
): number | null {
  if (
    typeof value !== 'number' &&
    typeof value !== 'string'
  ) {
    return null;
  }

  const normalized =
    typeof value === 'string'
      ? value.trim()
      : value;

  if (
    normalized === '' ||
    normalized === null
  ) {
    return null;
  }

  const parsed = Number(normalized);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
}

/**
 * Generate kode pendaftaran yang sulit ditebak.
 *
 * Contoh:
 * GNET-REG-20260909-483721
 */
function generateRegistrationCode() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  const random = randomInt(
    100000,
    1000000,
  );

  return `GNET-REG-${year}${month}${day}-${random}`;
}

/**
 * Validasi email dasar.
 */
function isValidEmail(
  email: string,
) {
  if (email.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

/**
 * Validasi nomor telepon / WhatsApp.
 *
 * Mengizinkan:
 * 081234567890
 * +6281234567890
 * 6281234567890
 *
 * Spasi, tanda kurung, dan tanda hubung
 * dibersihkan terlebih dahulu.
 */
function normalizePhone(
  phone: string,
) {
  return phone
    .trim()
    .replace(/[\s()-]/g, '');
}

function isValidPhone(
  phone: string,
) {
  const normalized =
    normalizePhone(phone);

  return /^\+?[0-9]{10,15}$/.test(
    normalized,
  );
}

/**
 * @swagger
 * /api/registrations:
 *   post:
 *     summary: Membuat pendaftaran pelanggan baru
 *     tags:
 *       - Registrations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageId
 *               - coverageId
 *               - name
 *               - phone
 *               - email
 *               - address
 *             properties:
 *               packageId:
 *                 type: integer
 *                 example: 1
 *               coverageId:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Indra Wahidin
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *               email:
 *                 type: string
 *                 example: indra@example.com
 *               address:
 *                 type: string
 *                 example: Jl. Contoh No. 123, Biaro
 *               notes:
 *                 type: string
 *                 example: Mohon dihubungi sebelum survey
 *     responses:
 *       201:
 *         description: Pendaftaran berhasil dibuat
 *       400:
 *         description: Data request tidak valid
 *       404:
 *         description: Paket atau coverage tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */

/**
 * POST /api/registrations
 *
 * Endpoint publik untuk calon pelanggan.
 *
 * Keamanan:
 * - Tidak menerima branchId dari client.
 * - Tidak menerima status dari client.
 * - packageId diverifikasi ke database.
 * - coverageId diverifikasi ke database.
 * - branchId diambil dari coverage yang tervalidasi.
 * - Prisma digunakan untuk query database.
 */
export async function POST(
  request: Request,
) {
  try {
    // ==========================================
    // PARSE JSON
    // ==========================================

    let body: RegistrationRequest;

    try {
      body =
        (await request.json()) as RegistrationRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            'Format request JSON tidak valid.',
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Format data pendaftaran tidak valid.',
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================
    // VALIDASI ID
    // ==========================================

    const packageId =
      parsePositiveInteger(
        body.packageId,
      );

    const coverageId =
      parsePositiveInteger(
        body.coverageId,
      );

    if (!packageId) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Paket internet wajib dipilih.',
        },
        {
          status: 400,
        },
      );
    }

    if (!coverageId) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Area pemasangan wajib dipilih.',
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================
    // VALIDASI NAMA
    // ==========================================

    if (
      typeof body.name !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nama wajib diisi dengan format teks.',
        },
        {
          status: 400,
        },
      );
    }

    const name =
      body.name.trim();

    if (name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nama minimal 3 karakter.',
        },
        {
          status: 400,
        },
      );
    }

    if (
      name.length >
      MAX_NAME_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Nama maksimal ${MAX_NAME_LENGTH} karakter.`,
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================
    // VALIDASI NOMOR TELEPON
    // ==========================================

    if (
      typeof body.phone !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nomor WhatsApp wajib diisi.',
        },
        {
          status: 400,
        },
      );
    }

    const phone =
      normalizePhone(body.phone);

    if (
      phone.length >
      MAX_PHONE_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nomor WhatsApp terlalu panjang.',
        },
        {
          status: 400,
        },
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nomor WhatsApp tidak valid.',
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================
    // VALIDASI EMAIL
    // ==========================================

    if (
      typeof body.email !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Email wajib diisi.',
        },
        {
          status: 400,
        },
      );
    }

    const email =
      body.email
        .trim()
        .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Email wajib diisi.',
        },
        {
          status: 400,
        },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Format email tidak valid.',
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================
    // VALIDASI ALAMAT
    // ==========================================

    if (
      typeof body.address !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Alamat pemasangan wajib diisi.',
        },
        {
          status: 400,
        },
      );
    }

    const address =
      body.address.trim();

    if (address.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Alamat pemasangan minimal 10 karakter.',
        },
        {
          status: 400,
        },
      );
    }

    if (
      address.length >
      MAX_ADDRESS_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Alamat maksimal ${MAX_ADDRESS_LENGTH} karakter.`,
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================
    // VALIDASI NOTES
    // ==========================================

    let notes: string | null = null;

    if (
      body.notes !== undefined &&
      body.notes !== null
    ) {
      if (
        typeof body.notes !== 'string'
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Catatan harus berupa teks.',
          },
          {
            status: 400,
          },
        );
      }

      const normalizedNotes =
        body.notes.trim();

      if (
        normalizedNotes.length >
        MAX_NOTES_LENGTH
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Catatan maksimal ${MAX_NOTES_LENGTH} karakter.`,
          },
          {
            status: 400,
          },
        );
      }

      notes =
        normalizedNotes || null;
    }

    // ==========================================
    // CEK PAKET & COVERAGE
    // ==========================================

    const [
      internetPackage,
      coverage,
    ] = await Promise.all([
      prisma.internetPackage.findFirst({
        where: {
          id: packageId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          speed: true,
          price: true,
        },
      }),

      prisma.coverageArea.findFirst({
        where: {
          id: coverageId,
          isActive: true,
          branch: {
            isActive: true,
          },
        },
        select: {
          id: true,
          name: true,
          branchId: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
    ]);

    // ==========================================
    // VALIDASI PAKET
    // ==========================================

    if (!internetPackage) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Paket internet tidak ditemukan atau tidak aktif.',
        },
        {
          status: 404,
        },
      );
    }

    // ==========================================
    // VALIDASI COVERAGE
    // ==========================================

    if (!coverage) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Area pemasangan belum tersedia.',
        },
        {
          status: 404,
        },
      );
    }

    // ==========================================
    // BUAT PENDAFTARAN
    // ==========================================

    let registration = null;

    for (
      let attempt = 0;
      attempt <
      MAX_CODE_GENERATION_ATTEMPTS;
      attempt++
    ) {
      const registrationCode =
        generateRegistrationCode();

      const existing =
        await prisma.registration.findUnique(
          {
            where: {
              registrationCode,
            },
            select: {
              id: true,
            },
          },
        );

      if (existing) {
        continue;
      }

      try {
        registration =
          await prisma.registration.create({
            data: {
              registrationCode,

              name,

              phone,

              email,

              address,

              notes,

              /*
               * Status selalu ditentukan server.
               *
               * Client tidak bisa mengirim:
               * APPROVED
               * COMPLETED
               * REJECTED
               * dll.
               */
              status: 'PENDING',

              /*
               * packageId berasal dari paket
               * yang sudah diverifikasi.
               */
              packageId:
                internetPackage.id,

              /*
               * branchId TIDAK diambil dari
               * request client.
               *
               * Branch ditentukan berdasarkan
               * coverage yang sudah diverifikasi.
               */
              branchId:
                coverage.branchId,
            },

            select: {
              id: true,
              registrationCode: true,
              name: true,
              phone: true,
              email: true,
              address: true,
              notes: true,
              status: true,

              package: {
                select: {
                  id: true,
                  name: true,
                  speed: true,
                  price: true,
                },
              },

              branch: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },

              createdAt: true,
            },
          });

        break;
      } catch (error) {
        /*
         * Kalau terjadi collision pada unique
         * registrationCode, coba generate kode
         * baru.
         */
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'P2002'
        ) {
          continue;
        }

        throw error;
      }
    }

    // ==========================================
    // GAGAL GENERATE CODE
    // ==========================================

    if (!registration) {
      console.error(
        'REGISTRATION CODE GENERATION FAILED',
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Gagal membuat kode pendaftaran. Silakan coba lagi.',
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message:
          'Pendaftaran berhasil dikirim.',

        data: {
          id: registration.id,

          registrationCode:
            registration.registrationCode,

          name: registration.name,

          phone: registration.phone,

          email: registration.email,

          address: registration.address,

          notes: registration.notes,

          status: registration.status,

          package: {
            id:
              registration.package.id,

            name:
              registration.package.name,

            speed:
              registration.package.speed,

            price: Number(
              registration.package.price,
            ),
          },

          branch:
            registration.branch,

          createdAt:
            registration.createdAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      'POST /api/registrations error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Terjadi kesalahan pada server.',
      },
      {
        status: 500,
      },
    );
  }
}