import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { UserRole } from '@prisma/client';

const MANAGE_ROLES: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN'
] as const;

const READ_ROLES: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'TEKNISI',
    'CUSTOMER_SERVICE',
    'FINANCE',
] as const;

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !READ_ROLES.includes(user.role)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search")?.trim() || "";
        const status = searchParams.get("status") || "ALL";

        const where: {
            isActive?: boolean;
            OR?: Array<{
                name?: { contains: string };
                code?: { contains: string };
                address?: { contains: string };
                phone?: { contains: string };
                email?: { contains: string };
            }>;
        } = {};

        if (status === "ACTIVE") {
            where.isActive = true;
        }

        if (status === "INACTIVE") {
            where.isActive = false;
        }

        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                    },
                },
                {
                    code: {
                        contains: search,
                    },
                },
                {
                    address: {
                        contains: search,
                    },
                },
                {
                    phone: {
                        contains: search,
                    },
                },
                {
                    email: {
                        contains: search,
                    },
                },
            ];
        }

        const branches = await prisma.branch.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: {
                        customers: true,
                        coverageAreas: true,
                        registrations: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: branches,
        });
    } catch (error) {
        console.error("GET /api/branches ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Gagal mengambil data branch.",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !MANAGE_ROLES.includes(user.role)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Anda tidak memiliki izin untuk menambahkan branch.",
                },
                { status: 403 },
            );
        }

        const body = await request.json();

        const name = String(body.name ?? "").trim();
        const code = String(body.code ?? "").trim().toUpperCase();
        const address = String(body.address ?? "").trim();
        const phone = String(body.phone ?? "").trim();
        const email = String(body.email ?? "").trim();

        const latitude =
            body.latitude === null ||
                body.latitude === undefined ||
                body.latitude === ""
                ? null
                : Number(body.latitude);

        const longitude =
            body.longitude === null ||
                body.longitude === undefined ||
                body.longitude === ""
                ? null
                : Number(body.longitude);

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nama branch wajib diisi.",
                },
                { status: 400 },
            );
        }

        if (!code) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Kode branch wajib diisi.",
                },
                { status: 400 },
            );
        }

        if (!address) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Alamat branch wajib diisi.",
                },
                { status: 400 },
            );
        }

        if (
            latitude !== null &&
            (Number.isNaN(latitude) || latitude < -90 || latitude > 90)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Latitude tidak valid.",
                },
                { status: 400 },
            );
        }

        if (
            longitude !== null &&
            (Number.isNaN(longitude) || longitude < -180 || longitude > 180)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Longitude tidak valid.",
                },
                { status: 400 },
            );
        }

        const existing = await prisma.branch.findUnique({
            where: {
                code,
            },
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Kode branch "${code}" sudah digunakan.`,
                },
                { status: 409 },
            );
        }

        const branch = await prisma.branch.create({
            data: {
                name,
                code,
                address,
                phone: phone || null,
                email: email || null,
                latitude,
                longitude,
                isActive: true,
            },
        });

        await createAuditLog({
            userId: user.id,
            action: "CREATE",
            entity: "Branch",
            entityId: branch.id,
            description: `Membuat branch ${branch.name} (${branch.code})`,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Branch berhasil dibuat.",
                data: branch,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("POST /api/branches ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Gagal membuat branch.",
            },
            { status: 500 },
        );
    }
}
