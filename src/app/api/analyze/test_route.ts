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
    const scriptPath = path.join(process.cwd(), 'simple_entropy_test.py');
    
    // Create a promise to handle the Python process
    const result = await new Promise<{ totalBits: number; avgBits: number; tokenCount: number }>((resolve, reject) => {
      // Try different Python commands for cross-platform compatibility
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
      const pythonProcess = spawn(pythonCommand, [scriptPath]);
      
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
          console.log('Python stdout:', stdout); // Debug log
          const lines = stdout.trim().split('\n');
          const totalBitsLine = lines.find(line => line.includes('Total bits:'));
          const avgBitsLine = lines.find(line => line.includes('Bits per token:'));
          const tokenCountLine = lines.find(line => line.includes('Total tokens:'));
          
          console.log('Found lines:', { totalBitsLine, avgBitsLine, tokenCountLine }); // Debug log
          
          if (!totalBitsLine || !avgBitsLine || !tokenCountLine) {
            reject(new Error('Could not parse Python output'));
            return;
          }
          
          const totalBits = parseFloat(totalBitsLine.split(':')[1].trim());
          const avgBits = parseFloat(avgBitsLine.split(':')[1].trim());
          const tokenCount = parseFloat(tokenCountLine.split(':')[1].trim());
          
          console.log('Parsed values:', { totalBits, avgBits, tokenCount }); // Debug log
          
          resolve({ totalBits, avgBits, tokenCount });
        } catch (error) {
          reject(new Error(`Failed to parse output: ${error}`));
        }
      });
    });

    return NextResponse.json({
      success: true,
      analysis: {
        totalBits: result.totalBits,
        avgBits: result.avgBits,
        tokenCount: result.tokenCount,
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