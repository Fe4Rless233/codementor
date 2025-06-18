import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { neo4jService } from '@/lib/neo4j'
import { getAuthUser } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const skillProgress = await prisma.skillProgress.findMany({
      where: { userId: user.id },
      orderBy: { xp: 'desc' },
    })

    const skillRecommendations = await neo4jService.getSkillRecommendations(user.id)

    return NextResponse.json({ skillProgress, skillRecommendations })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}