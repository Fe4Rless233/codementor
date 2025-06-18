'use client'

import { useState, useCallback } from 'react'
import { AnalysisResult } from '@/types'
import toast from 'react-hot-toast'

interface UseCodeAnalysisResult {
  analysis: any | null
  loading: boolean
  error: string | null
  analyzeCode: (code: string, language: string, submissionId?: string) => Promise<void>
}

export function useCodeAnalysis(): UseCodeAnalysisResult {
  const [analysis, setAnalysis] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeCode = useCallback(async (code: string, language: string, submissionId?: string) => {
    setLoading(true)
    setError(null)
    setAnalysis(null)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language, submissionId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze code')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      toast.success('Code analyzed successfully!')
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Error analyzing code.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { analysis, loading, error, analyzeCode }
}