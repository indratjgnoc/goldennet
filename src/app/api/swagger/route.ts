import { NextResponse } from 'next/server';

const swaggerDocument = {
  openapi: '3.0.0',

  info: {
    title: 'Golden Net API',
    version: '1.0.0',
    description:
      'API untuk website dan sistem informasi Golden Net.',
  },

  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],

  tags: [
    {
      name: 'Packages',
      description:
        'API paket internet',
    },
    {
      name: 'Coverage',
      description:
        'API pengecekan coverage',
    },
    {
      name: 'Registrations',
      description:
        'API pendaftaran pelanggan',
    },
  ],

  paths: {
    '/api/packages': {
      get: {
        tags: ['Packages'],
        summary:
          'Mendapatkan daftar paket internet',

        responses: {
          '200': {
            description:
              'Daftar paket berhasil diambil.',
          },
        },
      },
    },

    '/api/coverage': {
      post: {
        tags: ['Coverage'],
        summary:
          'Memeriksa ketersediaan coverage',

        requestBody: {
          required: true,

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CoverageRequest',
              },
            },
          },
        },

        responses: {
          '200': {
            description:
              'Hasil pengecekan coverage.',
          },

          '400': {
            description:
              'Data tidak lengkap.',
          },
        },
      },
    },

    '/api/registrations': {
      post: {
        tags: ['Registrations'],
        summary:
          'Mengirim pendaftaran pemasangan',

        requestBody: {
          required: true,

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegistrationRequest',
              },
            },
          },
        },

        responses: {
          '201': {
            description:
              'Pendaftaran berhasil.',
          },

          '400': {
            description:
              'Data tidak lengkap.',
          },
        },
      },
    },
  },

  components: {
    schemas: {
      CoverageRequest: {
        type: 'object',

        required: [
          'area',
          'address',
        ],

        properties: {
          area: {
            type: 'string',
            example: 'Biaro',
          },

          address: {
            type: 'string',
            example:
              'Jl. Contoh No. 123, Biaro',
          },
        },
      },

      RegistrationRequest: {
        type: 'object',

        required: [
          'packageId',
          'name',
          'phone',
          'email',
          'address',
        ],

        properties: {
          packageId: {
            type: 'integer',
            example: 2,
          },

          name: {
            type: 'string',
            example: 'Indra',
          },

          phone: {
            type: 'string',
            example: '081234567890',
          },

          email: {
            type: 'string',
            format: 'email',
            example:
              'indra@example.com',
          },

          address: {
            type: 'string',
            example:
              'Biaro, Bukittinggi',
          },

          notes: {
            type: 'string',
            example:
              'Rumah dekat masjid',
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(
    swaggerDocument,
  );
}