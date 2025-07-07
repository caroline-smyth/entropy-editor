"use client";
import { useRef, useEffect } from "react";
import { useState } from "react";
import SubmitButton from "@/components/ui/SubmitButton";

interface AnalysisResult {
  totalBits: number;
  avgBits: number;
  tokenCount: number;
  text: string;
}

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze text');
      }
      
      // The API already returns parsed analysis data!
      if (!data.analysis) {
        throw new Error('No analysis data received from API');
      }
      
      setResult(data.analysis);
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  
  useEffect(() => {
    adjustHeight();
  }, []);
  
  return (
    <div className="flex flex-col items-center min-h-screen pt-48 gap-8 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold text-center">Entropy Editor</h1>
      
      <textarea 
        ref={textareaRef}
        className="min-w-[25rem] max-w-2xl min-h-[1.5rem] p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-hidden"
        placeholder="Start typing here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onInput={adjustHeight}
        rows={1}
      />
      
      <div className="text-center">
        <SubmitButton 
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting || !text.trim()}
        >
          Analyze Text
        </SubmitButton>
      </div>
      
      {error && (
        <div className="text-red-500 text-center max-w-2xl">
          {error}
        </div>
      )}
      
      {result && (
        <div className="max-w-2xl w-full p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Entropy Analysis Results</h2>
          <div className="space-y-2">
            <p><strong>Total Information Content:</strong> {result.totalBits.toFixed(2)} bits</p>
            <p><strong>Average per Token:</strong> {result.avgBits.toFixed(2)} bits</p>
            <p><strong>Total Tokens:</strong> {result.tokenCount}</p>
            <p><strong>Character Count:</strong> {result.text.length}</p>
          </div>
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-sm text-gray-600 mb-2">Original Text:</p>
            <p className="text-sm">{result.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}