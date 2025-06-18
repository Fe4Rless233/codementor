import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { title, description, code, language } = await req.json()
    const user = await getAuthUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collaboration = await prisma.collaboration.create({
      data: {
        title,
        description,
        code,
        language,
        createdBy: user.id,
      },
    })

    return NextResponse.json({ collaboration })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collaborations = await prisma.collaboration.findMany({
      where: {
        OR: [
          { createdBy: user.id },
          // Potentially add where participants include user.id for future many-to-many
        ],
      },
      include: {
        creator: {
          select: { username: true, avatar: true },
        },
        messages: {
            include: { user: { select: { username: true, avatar: true } } },
            orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ collaborations })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}