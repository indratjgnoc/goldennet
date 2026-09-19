import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{
    id: string;
    materialId: string;
  }>;
};

export async function DELETE(
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

    const { id, materialId } = await params;

    const workOrderId = Number(id);
    const workOrderMaterialId = Number(materialId);

    if (
      !Number.isInteger(workOrderId) ||
      !Number.isInteger(workOrderMaterialId) ||
      workOrderId <= 0 ||
      workOrderMaterialId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ID material tidak valid.",
        },
        { status: 400 },
      );
    }

    const workOrder =
      await prisma.workOrder.findUnique({
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
            "Material tidak dapat dihapus dari Work Order yang sudah selesai atau dibatalkan.",
        },
        { status: 400 },
      );
    }

    const deletedMaterial =
      await prisma.$transaction(async (tx) => {
        const material =
          await tx.workOrderMaterial.findFirst({
            where: {
              id: workOrderMaterialId,
              workOrderId,
            },
            select: {
              id: true,
              itemId: true,
              quantity: true,
              item: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  unit: true,
                },
              },
            },
          });

        if (!material) {
          throw new Error("MATERIAL_NOT_FOUND");
        }

        /*
         * Kembalikan stok material.
         */
        await tx.inventoryItem.update({
          where: {
            id: material.itemId,
          },
          data: {
            stock: {
              increment: material.quantity,
            },
          },
        });

        await tx.workOrderMaterial.delete({
          where: {
            id: material.id,
          },
        });

        return material;
      });

    return NextResponse.json({
      success: true,
      message: "Material berhasil dihapus dan stok dikembalikan.",
      data: deletedMaterial,
    });
  } catch (error) {
    console.error(
      "DELETE /api/work-orders/[id]/materials/[materialId] error:",
      error,
    );

    if (
      error instanceof Error &&
      error.message === "MATERIAL_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Material Work Order tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus material.",
      },
      { status: 500 },
    );
  }
}