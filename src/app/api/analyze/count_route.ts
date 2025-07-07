import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Path to your Python script
    const scriptPath = path.join(process.cwd(), 'lightweight_entropy.py');
    
    // Create a promise to handle the Python process
    const result = await new Promise<{ wordCount: number; sentenceCount: number; uniqueWords: number; entropyScore: number }>((resolve, reject) => {
      const pythonProcess = spawn('python3', [scriptPath]);
      
      let stdout = '';
      let stderr = '';
      
      // Send the text to the Python script via stdin
      pythonProcess.stdin.write(text);
      pythonProcess.stdin.end();
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${stderr}`));
          return;
        }
        
        try {
          // Parse the output from your Python script
          const lines = stdout.trim().split('\n');
          const wordCountLine = lines.find(line => line.includes('Word count:'));
          const sentenceCountLine = lines.find(line => line.includes('Sentence count:'));
          const uniqueWordsLine = lines.find(line => line.includes('Unique words:'));
          const entropyLine = lines.find(line => line.includes('Entropy score:'));
          
          if (!wordCountLine || !sentenceCountLine || !uniqueWordsLine || !entropyLine) {
            reject(new Error('Could not parse Python output'));
            return;
          }
          
          const wordCount = parseInt(wordCountLine.split(':')[1].trim());
          const sentenceCount = parseInt(sentenceCountLine.split(':')[1].trim());
          const uniqueWords = parseInt(uniqueWordsLine.split(':')[1].trim());
          const entropyScore = parseFloat(entropyLine.split(':')[1].trim());
          
          resolve({ wordCount, sentenceCount, uniqueWords, entropyScore });
        } catch (error) {
          reject(new Error(`Failed to parse output: ${error}`));
        }
      });
    });

    return NextResponse.json({
      success: true,
      analysis: {
        wordCount: result.wordCount,
        sentenceCount: result.sentenceCount,
        uniqueWords: result.uniqueWords,
        entropyScore: result.entropyScore,
        text: text
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}