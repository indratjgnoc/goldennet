import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

const VIEW_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'CUSTOMER_SERVICE',
  'TEKNISI',
];

const MANAGE_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'CUSTOMER_SERVICE',
  'TEKNISI',
];

const VALID_STATUSES = [
  'PENDING',
  'SURVEY',
  'APPROVED',
  'INSTALLATION',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
] as const;

type RegistrationStatus =
  (typeof VALID_STATUSES)[number];

/**
 * Aturan perpindahan status.
 *
 * Kita tidak membolehkan frontend
 * mengubah status secara sembarangan.
 */
const STATUS_TRANSITIONS: Record<
  RegistrationStatus,
  RegistrationStatus[]
> = {
  PENDING: [
    'SURVEY',
    'CANCELLED',
  ],

  SURVEY: [
    'APPROVED',
    'REJECTED',
    'CANCELLED',
  ],

  APPROVED: [
    'INSTALLATION',
    'CANCELLED',
  ],

  INSTALLATION: [
    'COMPLETED',
    'CANCELLED',
  ],

  COMPLETED: [],

  REJECTED: [],

  CANCELLED: [],
};

function parseId(value: string) {
  const id = Number(value);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return id;
}

/**
 * GET /api/registrations/[id]
 */
export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized.',
      },
      { status: 401 },
    );
  }

  if (!VIEW_ROLES.includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        message:
          'Anda tidak memiliki akses.',
      },
      { status: 403 },
    );
  }

  const { id: idParam } =
    await context.params;

  const id = parseId(idParam);

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        message:
          'ID pendaftaran tidak valid.',
      },
      { status: 400 },
    );
  }

  try {
    const registration =
      await prisma.registration.findUnique({
        where: {
          id,
        },

        include: {
          package: {
            select: {
              id: true,
              name: true,
              code: true,
              speed: true,
              price: true,
              description: true,
              isPopular: true,
              isActive: true,
            },
          },

          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              address: true,
              phone: true,
              email: true,
            },
          },

          customer: {
            select: {
              id: true,
              customerCode: true,
              name: true,
              phone: true,
              email: true,
              address: true,
              status: true,
              branch: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      });

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Pendaftaran tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
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

        customerId:
          registration.customerId,

        package: registration.package
          ? {
              ...registration.package,
              price: Number(
                registration.package.price,
              ),
            }
          : null,

        branch: registration.branch,

        customer:
          registration.customer,

        createdAt:
          registration.createdAt.toISOString(),

        updatedAt:
          registration.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error(
      'GET /api/registrations/[id] error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal mengambil detail pendaftaran.',
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/registrations/[id]
 *
 * Saat ini fokus pada perubahan status.
 */
export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized.',
      },
      { status: 401 },
    );
  }

  if (!MANAGE_ROLES.includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        message:
          'Anda tidak memiliki akses untuk mengubah pendaftaran.',
      },
      { status: 403 },
    );
  }

  const { id: idParam } =
    await context.params;

  const id = parseId(idParam);

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        message:
          'ID pendaftaran tidak valid.',
      },
      { status: 400 },
    );
  }

  try {
    const registration =
      await prisma.registration.findUnique({
        where: {
          id,
        },
      });

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Pendaftaran tidak ditemukan.',
        },
        { status: 404 },
      );
    }

    let body: {
      status?: unknown;
    };

    try {
      body =
        (await request.json()) as {
          status?: unknown;
        };
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            'Format request JSON tidak valid.',
        },
        { status: 400 },
      );
    }

    if (
      typeof body.status !== 'string' ||
      !VALID_STATUSES.includes(
        body.status as RegistrationStatus,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Status pendaftaran tidak valid.',
        },
        { status: 400 },
      );
    }

    const newStatus =
      body.status as RegistrationStatus;

    const currentStatus =
      registration.status as RegistrationStatus;

    if (
      currentStatus === newStatus
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Status pendaftaran sudah berada pada status tersebut.',
        },
        { status: 400 },
      );
    }

    const allowedTransitions =
      STATUS_TRANSITIONS[currentStatus];

    if (
      !allowedTransitions.includes(
        newStatus,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Perubahan status dari ${currentStatus} ke ${newStatus} tidak diperbolehkan.`,
        },
        { status: 400 },
      );
    }

    /*
     * Untuk tahap pertama:
     *
     * SUPER_ADMIN / ADMIN dapat melakukan
     * seluruh transisi yang valid.
     *
     * CUSTOMER_SERVICE:
     * - PENDING -> SURVEY
     * - PENDING -> CANCELLED
     * - SURVEY -> REJECTED
     * - SURVEY -> CANCELLED
     *
     * TEKNISI:
     * - SURVEY -> APPROVED
     * - APPROVED -> INSTALLATION
     * - INSTALLATION -> COMPLETED
     * - INSTALLATION -> CANCELLED
     */
    if (
      user.role === 'CUSTOMER_SERVICE'
    ) {
      const allowedForCS = [
        'PENDING:SURVEY',
        'PENDING:CANCELLED',
        'SURVEY:REJECTED',
        'SURVEY:CANCELLED',
      ];

      const key =
        `${currentStatus}:${newStatus}`;

      if (!allowedForCS.includes(key)) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Customer Service tidak memiliki izin untuk perubahan status tersebut.',
          },
          { status: 403 },
        );
      }
    }

    if (user.role === 'TEKNISI') {
      const allowedForTechnician = [
        'SURVEY:APPROVED',
        'APPROVED:INSTALLATION',
        'INSTALLATION:COMPLETED',
        'INSTALLATION:CANCELLED',
      ];

      const key =
        `${currentStatus}:${newStatus}`;

      if (
        !allowedForTechnician.includes(
          key,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Teknisi tidak memiliki izin untuk perubahan status tersebut.',
          },
          { status: 403 },
        );
      }
    }

    const updated =
      await prisma.registration.update({
        where: {
          id,
        },

        data: {
          status: newStatus,
        },

        include: {
          package: {
            select: {
              id: true,
              name: true,
              code: true,
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

          customer: {
            select: {
              id: true,
              customerCode: true,
              name: true,
              status: true,
            },
          },
        },
      });

    await createAuditLog({
      userId: user.id,
      action: 'STATUS_CHANGE',
      entity: 'Registration',
      entityId: updated.id,
      description:
        `Status pendaftaran ${updated.registrationCode} berubah dari ${currentStatus} menjadi ${newStatus}.`,
    });

    return NextResponse.json({
      success: true,
      message:
        'Status pendaftaran berhasil diperbarui.',
      data: {
        id: updated.id,
        registrationCode:
          updated.registrationCode,
        status: updated.status,
        customerId:
          updated.customerId,

        package: updated.package
          ? {
              ...updated.package,
              price: Number(
                updated.package.price,
              ),
            }
          : null,

        branch: updated.branch,

        customer:
          updated.customer,

        updatedAt:
          updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error(
      'PATCH /api/registrations/[id] error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal memperbarui pendaftaran.',
      },
      { status: 500 },
    );
  }
}