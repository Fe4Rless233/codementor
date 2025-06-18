import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recentSubmissions = await prisma.codeSubmission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentCollaborations = await prisma.collaboration.findMany({
      where: { createdBy: user.id }, // Simple check, expand for true participation
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentSkillUpdates = await prisma.skillProgress.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    // Combine and sort activities by creation/update time
    const activity = [
      ...recentSubmissions.map(s => ({
        type: 'submission',
        title: `Submitted "${s.title}"`,
        description: `Received ${s.quality}/10 quality score`,
        time: s.createdAt.toISOString(),
        icon: '📝',
      })),
      ...recentCollaborations.map(c => ({
        type: 'collaboration',
        title: `Started collaboration "${c.title}"`,
        description: c.description,
        time: c.createdAt.toISOString(),
        icon: '👥',
      })),
      ...recentSkillUpdates.map(s => ({
        type: 'skill',
        title: `Leveled up in ${s.skillName}`,
        description: `Reached level ${s.level} in ${s.skillName}`,
        time: s.updatedAt.toISOString(),
        icon: '🚀',
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10); // Limit to 10 recent activities

    return NextResponse.json({ activity })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}