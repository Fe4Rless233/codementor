'use client'

import { useRef, useEffect, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCodeAnalysis } from '@/hooks/useCodeAnalysis'
import toast from 'react-hot-toast'

interface CodeEditorProps {
  initialCode?: string
  language?: string
  onCodeChange?: (code: string) => void
  collaborationId?: string
}

export default function CodeEditor({
  initialCode = '',
  language = 'javascript',
  onCodeChange,
  collaborationId
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const editorRef = useRef<any>(null)
  const { analyzeCode, analysis, loading } = useCodeAnalysis()

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      folding: true,
      lineNumbers: 'on',
      automaticLayout: true
    })

    // Add custom theme
    monaco.editor.defineTheme('codementor-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'F97583' },
        { token: 'string', foreground: '9ECBFF' },
        { token: 'number', foreground: '79B8FF' }
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#F0F6FC',
        'editorLineNumber.foreground': '#6E7681',
        'editor.selectionBackground': '#264F78',
        'editor.lineHighlightBackground': '#161B22'
      }
    })

    monaco.editor.setTheme('codementor-theme')
  }

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      await analyzeCode(code, language)
      toast.success('Code analysis complete!')
    } catch (error) {
      toast.error('Failed to analyze code')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/code/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          collaborationId,
          title: 'Untitled Project'
        })
      })

      if (!response.ok) throw new Error('Failed to save')
      
      toast.success('Code saved successfully!')
    } catch (error) {
      toast.error('Failed to save code')
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-4">
          <select
            value={language}
            className="px-3 py-1 border rounded-md text-sm"
            disabled // For now, language is fixed
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            size="sm"
            onClick={handleAnalyze}
            loading={isAnalyzing}
          >
            Analyze Code
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: false,
            formatOnPaste: true,
            formatOnType: true
          }}
        />
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="border-t bg-white p-4 max-h-60 overflow-y-auto">
          <h3 className="font-semibold mb-2">Analysis Results</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-primary-600">
                {analysis.overall_quality}/10
              </div>
              <div className="text-sm text-gray-600">Quality</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-secondary-600">
                {analysis.complexity}/10
              </div>
              <div className="text-sm text-gray-600">Complexity</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {analysis.maintainability}/10
              </div>
              <div className="text-sm text-gray-600">Maintainability</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analysis.performance}/10
              </div>
              <div className="text-sm text-gray-600">Performance</div>
            </Card>
          </div>

          {analysis.issues && analysis.issues.length > 0 && (
            <div className="space-y-2">
              {analysis.issues.map((issue: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border-l-4 ${
                    issue.type === 'error' ? 'border-red-500 bg-red-50' :
                    issue.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="font-medium">{issue.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {issue.description}
                  </div>
                  {issue.line && (
                    <div className="text-xs text-gray-500 mt-1">
                      Line {issue.line}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}