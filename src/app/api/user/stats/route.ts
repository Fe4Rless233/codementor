import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totalSubmissions = await prisma.codeSubmission.count({
      where: { userId: user.id },
    })

    const avgQualityResult = await prisma.codeSubmission.aggregate({
      where: { userId: user.id },
      _avg: { quality: true },
    })
    const averageQuality = avgQualityResult._avg.quality ? parseFloat(avgQualityResult._avg.quality.toFixed(1)) : 0;

    const skillsLearned = await prisma.skillProgress.count({
      where: { userId: user.id, level: { gt: 0 } },
    })

    // TODO: Implement streak logic based on daily submissions
    const streak = 0; 

    return NextResponse.json({
      totalSubmissions,
      averageQuality,
      skillsLearned,
      streak,
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
