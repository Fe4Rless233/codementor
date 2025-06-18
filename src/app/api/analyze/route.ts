import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/lib/gemini'
import { prisma } from '@/lib/prisma'
import { neo4jService } from '@/lib/neo4j'
import { getAuthUser } from '@/lib/utils' // Assuming a utility to get authenticated user

export async function POST(req: NextRequest) {
  try {
    const { code, language, title, submissionId } = await req.json()
    const user = await getAuthUser(req) // Implement this utility

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const analysisResult = await geminiService.analyzeCode(code, language)

    let codeSubmission;
    if (submissionId) {
      // Update existing submission
      codeSubmission = await prisma.codeSubmission.update({
        where: { id: submissionId },
        data: {
          code,
          language,
          complexity: analysisResult.complexity,
          quality: analysisResult.overall_quality,
          maintainability: analysisResult.maintainability,
          performance: analysisResult.performance,
          feedback: analysisResult,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new submission
      codeSubmission = await prisma.codeSubmission.create({
        data: {
          userId: user.id,
          title: title || 'Untitled Submission',
          code,
          language,
          complexity: analysisResult.complexity,
          quality: analysisResult.overall_quality,
          maintainability: analysisResult.maintainability,
          performance: analysisResult.performance,
          feedback: analysisResult,
        },
      });
    }

    // Update skill progression based on analysis
    for (const skillName of analysisResult.skills_demonstrated || []) {
      await prisma.skillProgress.upsert({
        where: {
          userId_skillName: { userId: user.id, skillName },
        },
        update: {
          xp: { increment: 10 }, // Example XP gain
          level: { increment: 1 }, // Simple level increment, can be more complex
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          skillName,
          xp: 10,
          level: 1,
        },
      });
      await neo4jService.createSkillRelationship(user.id, skillName, 1); // Update Neo4j
    }

    return NextResponse.json({ analysis: analysisResult, submission: codeSubmission })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}