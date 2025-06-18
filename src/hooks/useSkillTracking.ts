'use client'

import { useState, useEffect, useCallback } from 'react'
import { SkillProgress } from '@/types'
import toast from 'react-hot-toast'

interface UseSkillTrackingResult {
  skills: SkillProgress[]
  recommendations: { skill: string; strength: number }[]
  loading: boolean
  error: string | null
  fetchSkills: () => Promise<void>
}

export function useSkillTracking(): UseSkillTrackingResult {
  const [skills, setSkills] = useState<SkillProgress[]>([])
  const [recommendations, setRecommendations] = useState<{ skill: string; strength: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSkills = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/skills')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch skills')
      }
      const data = await response.json()
      setSkills(data.skillProgress)
      setRecommendations(data.skillRecommendations)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Error fetching skills.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  return { skills, recommendations, loading, error, fetchSkills }
}
