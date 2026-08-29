import { NextResponse } from 'next/server';

interface RegistrationRequest {
  packageId?: number;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

/**
 * @swagger
 * /api/registrations:
 *   post:
 *     summary: Mengirim pendaftaran pemasangan internet
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
 *               - name
 *               - phone
 *               - email
 *               - address
 *             properties:
 *               packageId:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: Indra
 *               phone:
 *                 type: string
 *                 example: 081234567890
 *               email:
 *                 type: string
 *                 example: indra@example.com
 *               address:
 *                 type: string
 *                 example: Biaro, Bukittinggi
 *               notes:
 *                 type: string
 *                 example: Rumah berada dekat masjid
 *     responses:
 *       201:
 *         description: Pendaftaran berhasil
 *       400:
 *         description: Data tidak lengkap
 */

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as RegistrationRequest;

    const {
      packageId,
      name,
      phone,
      email,
      address,
      notes,
    } = body;

    if (
      !packageId ||
      !name ||
      !phone ||
      !email ||
      !address
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Data pendaftaran belum lengkap.',
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Database belum digunakan.
     *
     * Untuk sementara data hanya diterima API.
     *
     * Tahap berikutnya:
     * INSERT ke database.
     */

    const registration = {
      id: `REG-${Date.now()}`,
      packageId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      notes: notes?.trim() ?? '',
      status: 'pending',
      createdAt:
        new Date().toISOString(),
    };

    console.log(
      'NEW REGISTRATION:',
      registration,
    );

    return NextResponse.json(
      {
        success: true,
        message:
          'Pendaftaran berhasil diterima.',
        data: registration,
      },
      {
        status: 201,
      },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          'Format request tidak valid.',
      },
      {
        status: 400,
      },
    );
  }
}