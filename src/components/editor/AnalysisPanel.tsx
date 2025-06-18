// src/components/editor/AnalysisPanel.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AnalysisResult, AnalysisIssue, AnalysisSuggestion } from '@/types'; // Import your analysis types
import { ChevronDown, ChevronUp, AlertCircle, XCircle, Lightbulb, Info } from 'lucide-react'; // Icons for issues
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisPanelProps {
  /**
   * The analysis result object received from the AI.
   */
  analysis: AnalysisResult | null;
  /**
   * If true, indicates that analysis is currently in progress.
   */
  loading?: boolean;
  /**
   * An error message if analysis failed.
   */
  error?: string | null;
}

export default function AnalysisPanel({ analysis, loading, error }: AnalysisPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    metrics: true,
    issues: true,
    suggestions: true,
    skills: true,
    learningPath: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p>Analyzing code, please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <XCircle className="h-10 w-10 mx-auto mb-4" />
        <p>Error during analysis: {error}</p>
        <p className="text-sm text-gray-500 mt-2">Please try again or check your code for basic syntax errors.</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Lightbulb className="h-10 w-10 mx-auto mb-4" />
        <p>No analysis results to display yet.</p>
        <p className="text-sm mt-2">Submit your code for AI-powered feedback!</p>
      </div>
    );
  }

  const getIssueIcon = (type: AnalysisIssue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />;
    }
  };

  const getIssueBorderColor = (type: AnalysisIssue['type']) => {
    switch (type) {
      case 'error': return 'border-red-500';
      case 'warning': return 'border-yellow-500';
      case 'suggestion': return 'border-blue-500';
      case 'info': return 'border-gray-300';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="bg-gray-50 border-l border-gray-200 h-full overflow-y-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Analysis Report</h2>

      {/* Overall Metrics */}
      <Card className="p-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('metrics')}>
          <h3 className="text-lg font-semibold text-gray-800">Overall Metrics</h3>
          {expandedSections.metrics ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        <AnimatePresence>
          {expandedSections.metrics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 grid grid-cols-2 gap-4"
            >
              {[
                { label: 'Quality', value: analysis.overall_quality, color: 'text-primary-600' },
                { label: 'Complexity', value: analysis.complexity, color: 'text-secondary-600' },
                { label: 'Maintainability', value: analysis.maintainability, color: 'text-green-600' },
                { label: 'Performance', value: analysis.performance, color: 'text-orange-600' },
              ].map((metric) => (
                <div key={metric.label}>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}/10</p>
                  <ProgressBar value={metric.value} max={10} className="h-2 mt-1" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Issues */}
      {analysis.issues && analysis.issues.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('issues')}>
            <h3 className="text-lg font-semibold text-gray-800">Identified Issues ({analysis.issues.length})</h3>
            {expandedSections.issues ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <AnimatePresence>
            {expandedSections.issues && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-3"
              >
                {analysis.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`flex items-start p-3 rounded-md border-l-4 ${getIssueBorderColor(issue.type)} bg-white shadow-sm`}
                  >
                    <div className="mr-3 mt-1">
                      {getIssueIcon(issue.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {issue.title} {issue.line && <span className="text-gray-500 font-normal text-xs">(Line: {issue.line})</span>}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                      {issue.severity > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Severity: {issue.severity}/10</p>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('suggestions')}>
            <h3 className="text-lg font-semibold text-gray-800">Suggestions for Improvement ({analysis.suggestions.length})</h3>
            {expandedSections.suggestions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <AnimatePresence>
            {expandedSections.suggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-3"
              >
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 rounded-md border border-gray-200 bg-white shadow-sm">
                    <p className="font-medium text-gray-900 flex items-center">
                        <Lightbulb className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                        {suggestion.title}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{suggestion.description}</p>
                    {suggestion.example && (
                      <pre className="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-x-auto">
                        <code>{suggestion.example}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Skills Demonstrated & To Improve */}
      {(analysis.skills_demonstrated?.length > 0 || analysis.skills_to_improve?.length > 0) && (
        <Card className="p-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('skills')}>
            <h3 className="text-lg font-semibold text-gray-800">Skills Overview</h3>
            {expandedSections.skills ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <AnimatePresence>
            {expandedSections.skills && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-3"
              >
                {analysis.skills_demonstrated && analysis.skills_demonstrated.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Skills Demonstrated:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills_demonstrated.map((skill, index) => (
                        <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.skills_to_improve && analysis.skills_to_improve.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Skills to Improve:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills_to_improve.map((skill, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Learning Path Summary */}
      {analysis.learning_path && (
        <Card className="p-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('learningPath')}>
            <h3 className="text-lg font-semibold text-gray-800">Suggested Learning Path</h3>
            {expandedSections.learningPath ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <AnimatePresence>
            {expandedSections.learningPath && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-gray-700 text-sm leading-relaxed"
              >
                <p>{analysis.learning_path}</p>
                <p className="mt-2 text-xs text-gray-500">
                  (This is a summary. More detailed learning paths are available on your dashboard.)
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
}