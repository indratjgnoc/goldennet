import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login tidak ditemukan.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;
    const workOrderId = Number(id);

    if (!Number.isInteger(workOrderId) || workOrderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID Work Order tidak valid.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const itemId = Number(body.itemId);
    const quantity = new Prisma.Decimal(body.quantity);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang/material tidak valid.",
        },
        { status: 400 },
      );
    }

    if (quantity.lte(0)) {
      return NextResponse.json(
        {
          success: false,
          message: "Jumlah material harus lebih dari 0.",
        },
        { status: 400 },
      );
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: {
        id: workOrderId,
      },
      select: {
        id: true,
        workOrderCode: true,
        status: true,
        technicianId: true,
      },
    });

    if (!workOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Work Order tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const isAdmin =
      user.role === "SUPER_ADMIN" ||
      user.role === "ADMIN";

    const isAssignedTechnician =
      user.role === "TEKNISI" &&
      workOrder.technicianId === user.id;

    if (!isAdmin && !isAssignedTechnician) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kamu tidak memiliki akses ke Work Order ini.",
        },
        { status: 403 },
      );
    }

    if (
      workOrder.status === "COMPLETED" ||
      workOrder.status === "CANCELLED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Material tidak dapat ditambahkan pada Work Order yang sudah selesai atau dibatalkan.",
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: {
          id: itemId,
        },
        select: {
          id: true,
          name: true,
          code: true,
          unit: true,
          stock: true,
        },
      });

      if (!item) {
        throw new Error("ITEM_NOT_FOUND");
      }

      /*
       * Kurangi stok secara atomik.
       * Jika stok berubah sebelum transaksi ini selesai,
       * updateMany tetap memastikan stok tidak menjadi minus.
       */
      const stockUpdate = await tx.inventoryItem.updateMany({
        where: {
          id: itemId,
          stock: {
            gte: quantity,
          },
        },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      if (stockUpdate.count !== 1) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      /*
       * Jika material yang sama sudah ada pada WO,
       * jumlahnya digabung.
       */
      const existingMaterial =
        await tx.workOrderMaterial.findFirst({
          where: {
            workOrderId,
            itemId,
          },
        });

      let material;

      if (existingMaterial) {
        material = await tx.workOrderMaterial.update({
          where: {
            id: existingMaterial.id,
          },
          data: {
            quantity: {
              increment: quantity,
            },
            notes:
              body.notes !== undefined
                ? body.notes || null
                : existingMaterial.notes,
          },
          include: {
            item: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
              },
            },
          },
        });
      } else {
        material = await tx.workOrderMaterial.create({
          data: {
            workOrderId,
            itemId,
            quantity,
            notes: body.notes || null,
          },
          include: {
            item: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
              },
            },
          },
        });
      }

      return material;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Material berhasil ditambahkan ke Work Order.",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/work-orders/[id]/materials error:",
      error,
    );

    if (
      error instanceof Error &&
      error.message === "ITEM_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang/material tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_STOCK"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Stok material tidak mencukupi.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan material.",
      },
      { status: 500 },
    );
  }
}