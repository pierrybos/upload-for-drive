// app/api/program-parts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();

    const parts = await prisma.programPart.findMany();
console.log(parts);

    return NextResponse.json(parts);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const { name, institutionSlug } = data;

    if (!name || !institutionSlug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const institution = await prisma.institution.findFirst({
      where: {
        slug: institutionSlug,
        users: {
          some: {
            email: session.user.email,
            role: "admin",
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found or user is not admin" },
        { status: 404 }
      );
    }

    const part = await prisma.programPart.create({
      data: {
        name,
        institution: {
          connect: {
            id: institution.id,
          },
        },
      },
    });

    return NextResponse.json(part);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const { id, name, institutionSlug, isActive } = data;

    if (!id || !name || !institutionSlug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const institution = await prisma.institution.findFirst({
      where: {
        slug: institutionSlug,
        users: {
          some: {
            email: session.user.email,
            role: "admin",
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found or user is not admin" },
        { status: 404 }
      );
    }

    const part = await prisma.programPart.update({
      where: { id },
      data: {
        name,
        institution: {
          connect: {
            id: institution.id,
          },
        },
        isActive,
      },
    });

    return NextResponse.json(part);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const { id, institutionSlug } = data;

    if (!id || !institutionSlug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const institution = await prisma.institution.findFirst({
      where: {
        slug: institutionSlug,
        users: {
          some: {
            email: session.user.email,
            role: "admin",
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found or user is not admin" },
        { status: 404 }
      );
    }

    await prisma.programPart.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Parte do programa removida com sucesso." });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
