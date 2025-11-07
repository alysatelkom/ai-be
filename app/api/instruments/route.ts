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

    const instruments = await prisma.instrument.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        measurementQuantities: {
          include: {
            ranges: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(instruments)
  } catch (error) {
    console.error("Error fetching instruments:", error)
    return NextResponse.json(
      { error: "Failed to fetch instruments" },
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
    const { name, brand, type, serialNumber, measurementQuantities } = body

    const instrument = await prisma.instrument.create({
      data: {
        name,
        brand,
        type,
        serialNumber,
        userId: session.user.id,
        measurementQuantities: {
          create: measurementQuantities.map((mq: any) => ({
            measuredQuantity: mq.measuredQuantity,
            instrumentType: mq.instrumentType,
            ranges: {
              create: mq.ranges.map((range: any) => ({
                minRange: range.minRange,
                maxRange: range.maxRange,
                unit: range.unit,
                cmc: range.cmc,
                drift: range.drift,
                calibrationUncertainty: range.calibrationUncertainty,
              })),
            },
          })),
        },
      },
      include: {
        measurementQuantities: {
          include: {
            ranges: true,
          },
        },
      },
    })

    return NextResponse.json(instrument, { status: 201 })
  } catch (error) {
    console.error("Error creating instrument:", error)
    return NextResponse.json(
      { error: "Failed to create instrument" },
      { status: 500 }
    )
  }
}
