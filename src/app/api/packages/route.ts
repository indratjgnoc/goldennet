import { NextResponse } from 'next/server';

import { internetPackages } from '@/data/packages';

/**
 * @swagger
 * /api/packages:
 *   get:
 *     summary: Mendapatkan daftar paket internet
 *     tags:
 *       - Packages
 *     responses:
 *       200:
 *         description: Daftar paket internet
 */

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Daftar paket internet berhasil diambil.',
    data: internetPackages,
  });
}