import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import {
    requireRole,
} from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit-log';

const USER_ROLES = [
    'SUPER_ADMIN',
    'ADMIN',
    'TEKNISI',
    'CUSTOMER_SERVICE',
    'FINANCE',
] as const;

const USER_STATUSES = [
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
] as const;

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

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

function parseUserId(value: string) {
    const id = Number(value);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {
        return null;
    }

    return id;
}

/**
 * GET /api/users/[id]
 *
 * Melihat detail user.
 *
 * Akses:
 * - SUPER_ADMIN
 * - ADMIN
 */
export async function GET(
    request: Request,
    context: RouteContext,
) {
    try {
        await requireRole([
            'SUPER_ADMIN',
            'ADMIN',
        ]);

        const { id: idParam } =
            await context.params;

        const userId =
            parseUserId(idParam);

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'ID user tidak valid.',
                },
                {
                    status: 400,
                },
            );
        }

        const user =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    role: true,
                    status: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'User tidak ditemukan.',
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message:
                'Detail user berhasil diambil.',
            data: user,
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
                {
                    status: 401,
                },
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
                {
                    status: 403,
                },
            );
        }

        console.error(
            'GET /api/users/[id] error:',
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

/**
 * PATCH /api/users/[id]
 *
 * Mengubah data user.
 *
 * Field yang dapat diubah:
 * - name
 * - username
 * - email
 * - password
 * - role
 * - status
 *
 * Akses:
 * - SUPER_ADMIN
 * - ADMIN
 */
export async function PATCH(
    request: Request,
    context: RouteContext,
) {
    try {
        const currentUser =
            await requireRole([
                'SUPER_ADMIN',
                'ADMIN',
            ]);

        const { id: idParam } =
            await context.params;

        const userId =
            parseUserId(idParam);

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'ID user tidak valid.',
                },
                {
                    status: 400,
                },
            );
        }

        const targetUser =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    role: true,
                    status: true,
                },
            });

        if (!targetUser) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'User tidak ditemukan.',
                },
                {
                    status: 404,
                },
            );
        }

        const body = await request.json();

        // =====================================================
        // Ambil input
        // =====================================================

        const hasName =
            Object.prototype.hasOwnProperty.call(
                body,
                'name',
            );

        const hasUsername =
            Object.prototype.hasOwnProperty.call(
                body,
                'username',
            );

        const hasEmail =
            Object.prototype.hasOwnProperty.call(
                body,
                'email',
            );

        const hasPassword =
            Object.prototype.hasOwnProperty.call(
                body,
                'password',
            );

        const hasRole =
            Object.prototype.hasOwnProperty.call(
                body,
                'role',
            );

        const hasStatus =
            Object.prototype.hasOwnProperty.call(
                body,
                'status',
            );

        // =====================================================
        // Tidak ada field
        // =====================================================

        if (
            !hasName &&
            !hasUsername &&
            !hasEmail &&
            !hasPassword &&
            !hasRole &&
            !hasStatus
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Tidak ada data yang diperbarui.',
                },
                {
                    status: 400,
                },
            );
        }

        // =====================================================
        // Nilai baru
        // =====================================================

        let name: string | undefined;
        let username: string | undefined;
        let email: string | null | undefined;
        let password: string | undefined;
        let role: string | undefined;
        let status: string | undefined;

        if (hasName) {
            if (
                typeof body.name !== 'string'
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Nama harus berupa teks.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            name = body.name.trim();

            if (!name) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Nama tidak boleh kosong.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (name.length > 100) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Nama maksimal 100 karakter.',
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        if (hasUsername) {
            if (
                typeof body.username !== 'string'
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Username harus berupa teks.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            username =
                body.username.trim();

            if (hasUsername) {
                if (
                    typeof body.username !== 'string'
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                'Username harus berupa teks.',
                        },
                        {
                            status: 400,
                        },
                    );
                }

                const newUsername =
                    body.username.trim();

                if (
                    newUsername.length < 3 ||
                    newUsername.length > 50
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                'Username harus 3-50 karakter.',
                        },
                        {
                            status: 400,
                        },
                    );
                }

                const usernamePattern =
                    /^[a-zA-Z0-9._-]+$/;

                if (
                    !usernamePattern.test(
                        newUsername,
                    )
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                'Username hanya boleh menggunakan huruf, angka, titik, underscore, dan tanda hubung.',
                        },
                        {
                            status: 400,
                        },
                    );
                }

                username = newUsername;
            }
        }

        if (hasEmail) {
            if (
                body.email !== null &&
                typeof body.email !== 'string'
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Email harus berupa teks atau null.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            email =
                typeof body.email === 'string'
                    ? body.email
                        .trim()
                        .toLowerCase()
                    : null;

            if (email && email.length > 150) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Email maksimal 150 karakter.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (email) {
                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (
                    !emailPattern.test(email)
                ) {
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
            }
        }

        if (hasPassword) {
            if (
                typeof body.password !== 'string'
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Password harus berupa teks.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            const newPassword =
                body.password;

            if (newPassword.length < 8) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Password minimal 8 karakter.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (newPassword.length > 128) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Password maksimal 128 karakter.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            password = newPassword;
        }

        if (hasRole) {
            if (
                typeof body.role !== 'string'
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Role harus berupa teks.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            role =
                body.role
                    .trim()
                    .toUpperCase();

            if (
                !USER_ROLES.includes(
                    role as (typeof USER_ROLES)[number],
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Role user tidak valid.',
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        if (hasStatus) {
            if (
                typeof body.status !== 'string'
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Status harus berupa teks.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            status =
                body.status
                    .trim()
                    .toUpperCase();

            if (
                !USER_STATUSES.includes(
                    status as (typeof USER_STATUSES)[number],
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Status user tidak valid.',
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        // =====================================================
        // Proteksi SUPER_ADMIN
        // =====================================================

        if (
            currentUser.role === 'ADMIN' &&
            targetUser.role === 'SUPER_ADMIN'
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'ADMIN tidak memiliki izin mengubah SUPER_ADMIN.',
                },
                {
                    status: 403,
                },
            );
        }

        if (
            currentUser.role === 'ADMIN' &&
            role === 'SUPER_ADMIN'
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'ADMIN tidak dapat memberikan role SUPER_ADMIN.',
                },
                {
                    status: 403,
                },
            );
        }

        // =====================================================
        // User tidak boleh mengubah role dirinya sendiri
        // menjadi SUPER_ADMIN melalui endpoint ini.
        // =====================================================

        if (
            currentUser.id === targetUser.id &&
            role === 'SUPER_ADMIN'
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Perubahan role tersebut tidak diizinkan.',
                },
                {
                    status: 403,
                },
            );
        }

        // =====================================================
        // Proteksi agar tidak menghilangkan satu-satunya
        // SUPER_ADMIN secara tidak sengaja.
        // =====================================================

        if (
            targetUser.role === 'SUPER_ADMIN' &&
            currentUser.role === 'SUPER_ADMIN' &&
            (
                role !== undefined &&
                role !== 'SUPER_ADMIN'
            )
        ) {
            const totalSuperAdmin =
                await prisma.user.count({
                    where: {
                        role: 'SUPER_ADMIN',
                        status: 'ACTIVE',
                    },
                });

            if (totalSuperAdmin <= 1) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Tidak dapat mengubah role satu-satunya SUPER_ADMIN aktif.',
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        // =====================================================
        // Proteksi status diri sendiri
        // =====================================================

        if (
            currentUser.id === targetUser.id &&
            status &&
            status !== 'ACTIVE'
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Anda tidak dapat menonaktifkan atau menangguhkan akun sendiri.',
                },
                {
                    status: 403,
                },
            );
        }

        // =====================================================
        // Cek username duplikat
        // =====================================================

        if (
            username &&
            username !== targetUser.username
        ) {
            const duplicateUsername =
                await prisma.user.findFirst({
                    where: {
                        username,
                        NOT: {
                            id: userId,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

            if (duplicateUsername) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Username sudah digunakan.',
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        // =====================================================
        // Cek email duplikat
        // =====================================================

        if (
            email !== undefined &&
            email !== targetUser.email
        ) {
            if (email) {
                const duplicateEmail =
                    await prisma.user.findFirst({
                        where: {
                            email,
                            NOT: {
                                id: userId,
                            },
                        },
                        select: {
                            id: true,
                        },
                    });

                if (duplicateEmail) {
                    return NextResponse.json(
                        {
                            success: false,
                            message:
                                'Email sudah digunakan.',
                        },
                        {
                            status: 409,
                        },
                    );
                }
            }
        }

        // =====================================================
        // Siapkan data update
        // =====================================================

        const updateData: {
            name?: string;
            username?: string;
            email?: string | null;
            passwordHash?: string;
            role?:
            | 'SUPER_ADMIN'
            | 'ADMIN'
            | 'TEKNISI'
            | 'CUSTOMER_SERVICE'
            | 'FINANCE';
            status?:
            | 'ACTIVE'
            | 'INACTIVE'
            | 'SUSPENDED';
        } = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (username !== undefined) {
            updateData.username = username;
        }

        if (email !== undefined) {
            updateData.email = email;
        }

        if (password !== undefined) {
            updateData.passwordHash =
                await hashPassword(password);
        }

        if (role !== undefined) {
            updateData.role =
                role as
                | 'SUPER_ADMIN'
                | 'ADMIN'
                | 'TEKNISI'
                | 'CUSTOMER_SERVICE'
                | 'FINANCE';
        }

        if (status !== undefined) {
            updateData.status =
                status as
                | 'ACTIVE'
                | 'INACTIVE'
                | 'SUSPENDED';
        }

        // =====================================================
        // Update database
        // =====================================================

        const updatedUser =
            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    role: true,
                    status: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        // =====================================================
        // Audit log
        // =====================================================

        const changes: string[] = [];

        if (name !== undefined) {
            changes.push('nama');
        }

        if (username !== undefined) {
            changes.push('username');
        }

        if (email !== undefined) {
            changes.push('email');
        }

        if (password !== undefined) {
            changes.push('password');
        }

        if (role !== undefined) {
            changes.push('role');
        }

        if (status !== undefined) {
            changes.push('status');
        }

        await createAuditLog({
            userId: currentUser.id,
            action:
                status !== undefined &&
                    status !== targetUser.status
                    ? 'CHANGE_USER_STATUS'
                    : 'UPDATE_USER',
            entity: 'User',
            entityId: userId,
            description:
                `User ${targetUser.username} diperbarui oleh ${currentUser.username}. Field: ${changes.join(', ')}.`,
            ipAddress: getClientIp(request),
            userAgent:
                request.headers.get(
                    'user-agent',
                ),
        });

        return NextResponse.json({
            success: true,
            message:
                'User berhasil diperbarui.',
            data: updatedUser,
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
                {
                    status: 401,
                },
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
                {
                    status: 403,
                },
            );
        }

        console.error(
            'PATCH /api/users/[id] error:',
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

/**
 * DELETE /api/users/[id]
 *
 * Soft delete:
 * User tidak dihapus dari database.
 * Status diubah menjadi INACTIVE.
 *
 * Akses:
 * - SUPER_ADMIN
 * - ADMIN
 */
export async function DELETE(
    request: Request,
    context: RouteContext,
) {
    try {
        const currentUser =
            await requireRole([
                'SUPER_ADMIN',
                'ADMIN',
            ]);

        const { id: idParam } =
            await context.params;

        const userId =
            parseUserId(idParam);

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'ID user tidak valid.',
                },
                {
                    status: 400,
                },
            );
        }

        if (
            currentUser.id === userId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Anda tidak dapat menonaktifkan akun sendiri.',
                },
                {
                    status: 403,
                },
            );
        }

        const targetUser =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    username: true,
                    role: true,
                    status: true,
                },
            });

        if (!targetUser) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'User tidak ditemukan.',
                },
                {
                    status: 404,
                },
            );
        }

        // ADMIN tidak boleh menonaktifkan SUPER_ADMIN
        if (
            currentUser.role === 'ADMIN' &&
            targetUser.role === 'SUPER_ADMIN'
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'ADMIN tidak memiliki izin menonaktifkan SUPER_ADMIN.',
                },
                {
                    status: 403,
                },
            );
        }

        // Lindungi satu-satunya SUPER_ADMIN aktif
        if (
            targetUser.role === 'SUPER_ADMIN' &&
            targetUser.status === 'ACTIVE'
        ) {
            const totalSuperAdmin =
                await prisma.user.count({
                    where: {
                        role: 'SUPER_ADMIN',
                        status: 'ACTIVE',
                    },
                });

            if (totalSuperAdmin <= 1) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Tidak dapat menonaktifkan satu-satunya SUPER_ADMIN aktif.',
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        // Jika sudah inactive
        if (
            targetUser.status === 'INACTIVE'
        ) {
            return NextResponse.json({
                success: true,
                message:
                    'User sudah dalam status INACTIVE.',
            });
        }

        const updatedUser =
            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    status: 'INACTIVE',
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    role: true,
                    status: true,
                },
            });

        await createAuditLog({
            userId: currentUser.id,
            action: 'DELETE_USER',
            entity: 'User',
            entityId: userId,
            description:
                `User ${targetUser.username} dinonaktifkan oleh ${currentUser.username}.`,
            ipAddress: getClientIp(request),
            userAgent:
                request.headers.get(
                    'user-agent',
                ),
        });

        return NextResponse.json({
            success: true,
            message:
                'User berhasil dinonaktifkan.',
            data: updatedUser,
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
                {
                    status: 401,
                },
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
                {
                    status: 403,
                },
            );
        }

        console.error(
            'DELETE /api/users/[id] error:',
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