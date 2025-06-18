// src/app/editor/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CodeEditor from '@/components/editor/CodeEditor'; // Your CodeEditor component
import AnalysisPanel from '@/components/editor/AnalysisPanel'; // Your AnalysisPanel component
import CollaborationPanel from '@/components/editor/CollaborationPanel'; // Your CollaborationPanel component
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'; // Assuming you have a resizable layout component
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Assuming you have tabs component
import { Loader2, Zap, Users } from 'lucide-react'; // Icons

export default function EditorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState<string>(`// Welcome to CodeMentor!
// Start coding here, or load a collaboration session.

function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));

// Click 'Analyze Code' to get AI feedback!
`);
  const [language, setLanguage] = useState<string>('javascript'); // Default language
  const [activePanel, setActivePanel] = useState<'analysis' | 'collaboration'>('analysis');

  // State to pass to AnalysisPanel, typically coming from a useCodeAnalysis hook
  // For simplicity, this data will be managed within CodeEditor and passed up/down
  const [analysisResult, setAnalysisResult] = useState<any>(null); // Stores the AI analysis result
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Collaboration session details from URL or created
  const collaborationId = searchParams.get('collaborationId'); // Get collaboration ID from URL

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Handle initial code loading for a collaboration session (if any)
  useEffect(() => {
    const fetchCollaborationCode = async () => {
      if (collaborationId && user) {
        setAnalysisLoading(true); // Re-using analysisLoading for general data fetching
        try {
          const response = await fetch(`/api/collaboration?id=${collaborationId}`);
          if (!response.ok) throw new Error('Failed to load collaboration session');
          const data = await response.json();
          // Assuming the collaboration object directly contains code and language
          if (data.collaboration?.code) {
            setCode(data.collaboration.code);
            setLanguage(data.collaboration.language || 'javascript'); // Set language if available
            setActivePanel('collaboration'); // Automatically switch to collaboration panel
            toast.success(`Joined collaboration: ${data.collaboration.title}`);
          }
        } catch (error: any) {
          console.error('Error fetching collaboration code:', error);
          setAnalysisError(error.message || 'Failed to load collaboration');
          toast.error(error.message || 'Failed to load collaboration session.');
        } finally {
          setAnalysisLoading(false);
        }
      }
    };

    if (!authLoading && user) {
      fetchCollaborationCode();
    }
  }, [collaborationId, user, authLoading]); // Depend on collaborationId and user to fetch data

  // Function to receive analysis results from CodeEditor
  const handleAnalysisComplete = (result: any, loadingStatus: boolean, errorStatus: string | null) => {
    setAnalysisResult(result);
    setAnalysisLoading(loadingStatus);
    setAnalysisError(errorStatus);
  };

  if (authLoading || (collaborationId && analysisLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Assuming Header and Sidebar are managed by a higher-level layout */}
      {/* For a standalone editor page, you might include a simplified header here */}

      <ResizablePanelGroup direction="horizontal">
        {/* Code Editor Panel */}
        <ResizablePanel defaultSize={65} minSize={30}>
          <div className="h-full bg-gray-800 text-white flex flex-col">
            <CodeEditor
              initialCode={code}
              language={language}
              onCodeChange={setCode} // Allows editor to update code state
              collaborationId={collaborationId || undefined} // Pass collaboration ID if available
              onAnalysisComplete={handleAnalysisComplete} // Callback for analysis results
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-gray-300 hover:bg-gray-400 w-2" />

        {/* Info/Collaboration Panel */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="h-full flex flex-col">
            <Tabs value={activePanel} onValueChange={(value: 'analysis' | 'collaboration') => setActivePanel(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis">
                  <Zap className="h-4 w-4 mr-2" /> AI Analysis
                </TabsTrigger>
                <TabsTrigger value="collaboration" disabled={!collaborationId}>
                  <Users className="h-4 w-4 mr-2" /> Collaboration
                  {/* Optionally show active participants count */}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="analysis" className="h-[calc(100vh-100px)] overflow-y-auto"> {/* Adjust height based on header/tabs */}
                <AnalysisPanel
                  analysis={analysisResult}
                  loading={analysisLoading}
                  error={analysisError}
                />
              </TabsContent>
              <TabsContent value="collaboration" className="h-[calc(100vh-100px)] overflow-y-auto">
                {collaborationId ? (
                  <CollaborationPanel
                    collaborationId={collaborationId}
                    initialCode={code} // Pass current code to collaboration if needed
                    language={language}
                  />
                ) : (
                  <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                    <Users className="h-12 w-12 mb-4 text-gray-400" />
                    <p className="text-lg font-semibold mb-2">Join or Start a Collaboration</p>
                    <p className="text-sm max-w-sm">
                      Share your code and collaborate in real-time. Start a new session from the Dashboard or join via a shared link.
                    </p>
                    <Button onClick={() => router.push('/collaborate/new')} className="mt-4">
                      Create New Session
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}