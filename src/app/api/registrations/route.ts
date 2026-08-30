import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateRegistrationCode() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  const random = Math.floor(
    1000 + Math.random() * 9000,
  );

  return `GNET-REG-${year}${month}${day}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      packageId,
      coverageId,
      name,
      phone,
      email,
      address,
      notes,
    } = body;

    // ==========================================
    // VALIDASI DASAR
    // ==========================================

    if (!packageId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Paket internet wajib dipilih.',
        },
        { status: 400 },
      );
    }

    if (!coverageId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Area pemasangan wajib dipilih.',
        },
        { status: 400 },
      );
    }

    if (
      !name ||
      typeof name !== 'string' ||
      name.trim().length < 3
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nama minimal 3 karakter.',
        },
        { status: 400 },
      );
    }

    if (
      !phone ||
      typeof phone !== 'string' ||
      phone.trim().length < 10
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nomor WhatsApp tidak valid.',
        },
        { status: 400 },
      );
    }

    if (
      !email ||
      typeof email !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email wajib diisi.',
        },
        { status: 400 },
      );
    }

    if (
      !address ||
      typeof address !== 'string' ||
      address.trim().length < 10
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Alamat pemasangan minimal 10 karakter.',
        },
        { status: 400 },
      );
    }

    // ==========================================
    // CEK PAKET
    // ==========================================

    const internetPackage =
      await prisma.internetPackage.findFirst({
        where: {
          id: Number(packageId),
          isActive: true,
        },
      });

    if (!internetPackage) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Paket internet tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    // ==========================================
    // CEK COVERAGE
    // ==========================================

    const coverage =
      await prisma.coverageArea.findFirst({
        where: {
          id: Number(coverageId),
          isActive: true,
          branch: {
            isActive: true,
          },
        },
        include: {
          branch: true,
        },
      });

    if (!coverage) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Area pemasangan belum tersedia.',
        },
        { status: 404 },
      );
    }

    // ==========================================
    // GENERATE REGISTRATION CODE
    // ==========================================

    let registrationCode =
      generateRegistrationCode();

    let existing =
      await prisma.registration.findUnique({
        where: {
          registrationCode,
        },
      });

    while (existing) {
      registrationCode =
        generateRegistrationCode();

      existing =
        await prisma.registration.findUnique({
          where: {
            registrationCode,
          },
        });
    }

    // ==========================================
    // SIMPAN PENDAFTARAN
    // ==========================================

    const registration =
      await prisma.registration.create({
        data: {
          registrationCode,

          name: name.trim(),

          phone: phone.trim(),

          email: email.trim().toLowerCase(),

          address: address.trim(),

          notes:
            typeof notes === 'string'
              ? notes.trim() || null
              : null,

          status: 'PENDING',

          packageId:
            internetPackage.id,

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

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        message:
          'Pendaftaran berhasil dikirim.',

        data: {
          ...registration,

          package: {
            ...registration.package,

            price: Number(
              registration.package.price,
            ),
          },
        },
      },
      { status: 201 },
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
      { status: 500 },
    );
  }
}