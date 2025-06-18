import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  async analyzeCode(code: string, language: string) {
    const prompt = `
    Analyze the following ${language} code and provide detailed feedback:

    \`\`\`${language}
    ${code}
    \`\`\`

    Please provide analysis in the following JSON format:
    {
      "overall_quality": number (1-10),
      "complexity": number (1-10),
      "maintainability": number (1-10),
      "performance": number (1-10),
      "issues": [
        {
          "type": "error|warning|suggestion|info",
          "title": "Issue title",
          "description": "Detailed description",
          "line": number (optional),
          "severity": number (1-10)
        }
      ],
      "suggestions": [
        {
          "title": "Improvement title",
          "description": "How to improve",
          "example": "Code example (optional)"
        }
      ],
      "skills_demonstrated": ["skill1", "skill2"],
      "skills_to_improve": ["skill1", "skill2"],
      "learning_path": "Next steps for improvement"
    }

    Focus on:
    - Code quality and best practices
    - Performance optimizations
    - Security vulnerabilities
    - Design patterns
    - Error handling
    - Code readability and maintainability
    `;

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }

  async generateLearningPath(userSkills: any[], targetSkills: string[]) {
    const prompt = `
    Based on the user's current skills and target skills, generate a personalized learning path:

    Current Skills:
    ${JSON.stringify(userSkills, null, 2)}

    Target Skills:
    ${JSON.stringify(targetSkills)}

    Generate a learning path in JSON format:
    {
      "path": [
        {
          "skill": "skill_name",
          "priority": number (1-10),
          "estimated_time": "time estimate",
          "prerequisites": ["skill1", "skill2"],
          "resources": [
            {
              "type": "tutorial|project|practice",
              "title": "Resource title",
              "description": "Description",
              "difficulty": "beginner|intermediate|advanced"
            }
          ]
        }
      ],
      "timeline": "Overall timeline estimate",
      "milestones": ["milestone1", "milestone2"]
    }
    `;

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }

  async explainCodeConcept(code: string, concept: string) {
    const prompt = `
    Explain the following programming concept in the context of this code:

    Concept: ${concept}
    
    Code:
    \`\`\`
    ${code}
    \`\`\`

    Provide a clear, educational explanation that helps the user understand:
    1. What the concept is
    2. How it's demonstrated in the code
    3. Why it's important
    4. Best practices related to this concept
    5. Common mistakes to avoid

    Keep the explanation beginner-friendly but comprehensive.
    `;

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
