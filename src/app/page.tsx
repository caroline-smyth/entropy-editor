"use client";
import Image from "next/image";
import { useRef, useEffect } from "react";
import { useState } from "react";
import SubmitButton from "@/components/ui/SubmitButton";

export default function Home() {

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Your submit logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      console.log("Submitted!");
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
        onInput={adjustHeight}
        rows={1}
      />
      <div className="text-center">
      <SubmitButton 
        onClick={handleSubmit}
        isLoading={isSubmitting}
      >
        Analyze Text
      </SubmitButton>
    </div>
    </div>
  );
}
