import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
)

export class Neo4jService {
  async createUserNode(userId: string, userData: any) {
    const session = driver.session()
    try {
      await session.run(
        'CREATE (u:User {id: $userId, email: $email, username: $username, createdAt: datetime()})',
        { userId, ...userData }
      )
    } finally {
      await session.close()
    }
  }

  async createSkillRelationship(userId: string, skillName: string, level: number) {
    const session = driver.session()
    try {
      await session.run(`
        MATCH (u:User {id: $userId})
        MERGE (s:Skill {name: $skillName})
        MERGE (u)-[r:HAS_SKILL]->(s)
        SET r.level = $level, r.updatedAt = datetime()
      `, { userId, skillName, level })
    } finally {
      await session.close()
    }
  }

  async getSkillRecommendations(userId: string) {
    const session = driver.session()
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)
        MATCH (other:User)-[:HAS_SKILL]->(s)
        MATCH (other)-[:HAS_SKILL]->(recommended:Skill)
        WHERE NOT (u)-[:HAS_SKILL]->(recommended)
        RETURN recommended.name as skill, count(*) as strength
        ORDER BY strength DESC
        LIMIT 5
      `, { userId })
      
      return result.records.map(record => ({
        skill: record.get('skill'),
        strength: record.get('strength').toNumber()
      }))
    } finally {
      await session.close()
    }
  }

  async close() {
    await driver.close()
  }
}

export const neo4jService = new Neo4jService()
