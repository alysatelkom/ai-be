import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const filterInstrument = searchParams.get("instrument") || ""

    const whereClause: any = {
      userId: session.user.id,
    }

    if (filterInstrument) {
      whereClause.instrumentName = {
        contains: filterInstrument,
      }
    }

    const calculations = await prisma.calculationHistory.findMany({
      where: whereClause,
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    return NextResponse.json(calculations)
  } catch (error) {
    console.error("Error fetching calculations:", error)
    return NextResponse.json(
      { error: "Failed to fetch calculations" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      instrumentName,
      measuredQuantity,
      instrumentType,
      measurementRange,
      components,
      results,
    } = body

    const calculation = await prisma.calculationHistory.create({
      data: {
        instrumentName,
        measuredQuantity,
        instrumentType,
        measurementRange,
        components,
        results,
        userId: session.user.id,
      },
    })

    return NextResponse.json(calculation, { status: 201 })
  } catch (error) {
    console.error("Error creating calculation:", error)
    return NextResponse.json(
      { error: "Failed to create calculation" },
      { status: 500 }
    )
  }
}
