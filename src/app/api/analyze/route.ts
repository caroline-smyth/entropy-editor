import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Debug: Log the exact text being sent
    console.log('Text being sent to Python:', JSON.stringify(text));
    console.log('Text length:', text.length);
    console.log('Text character codes (first 20):', text.slice(0, 20).split('').map((c: string) => c.charCodeAt(0)));

    const scriptPath = path.join(process.cwd(), 'entropy.py');
    
    const result = await new Promise<{ totalBits: number; avgBits: number; tokenCount: number }>((resolve, reject) => {
      // Try multiple Python commands
      const pythonCommands = ['python3', 'python', 'py'];
      let commandIndex = 0;
      
      function tryNextCommand() {
        if (commandIndex >= pythonCommands.length) {
          reject(new Error('No Python interpreter found'));
          return;
        }
        
        const pythonCommand = pythonCommands[commandIndex];
        console.log(`Trying Python command: ${pythonCommand}`);
        
        const pythonProcess = spawn(pythonCommand, [scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString('utf8');
        });
        
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString('utf8');
        });
        
        pythonProcess.on('error', (error) => {
          console.log(`Command ${pythonCommand} failed:`, error.message);
          commandIndex++;
          tryNextCommand();
        });
        
        pythonProcess.on('close', (code) => {
          console.log(`Python process closed with code: ${code}`);
          console.log('STDOUT:', stdout);
          console.log('STDERR:', stderr);
          
          if (code !== 0) {
            console.log(`Command ${pythonCommand} failed with code ${code}`);
            commandIndex++;
            tryNextCommand();
            return;
          }
          
          try {
            // Parse the output from your Python script
            const lines = stdout.trim().split('\n');
            console.log('Python output lines:', lines);
            
            const totalBitsLine = lines.find(line => line.includes('Total bits:'));
            const avgBitsLine = lines.find(line => line.includes('Bits per token:'));
            const tokenCountLine = lines.find(line => line.includes('Total tokens:'));
            
            if (!totalBitsLine || !avgBitsLine || !tokenCountLine) {
              reject(new Error(`Could not parse Python output. Lines: ${JSON.stringify(lines)}`));
              return;
            }
            
            const totalBits = parseFloat(totalBitsLine.split(':')[1].trim());
            const avgBits = parseFloat(avgBitsLine.split(':')[1].trim());
            const tokenCount = parseFloat(tokenCountLine.split(':')[1].trim());
            
            console.log('Parsed results:', { totalBits, avgBits, tokenCount });
            resolve({ totalBits, avgBits, tokenCount });
          } catch (error) {
            reject(new Error(`Failed to parse output: ${error}`));
          }
        });
        
        // Send the text with explicit UTF-8 encoding
        try {
          pythonProcess.stdin.write(text, 'utf8');
          pythonProcess.stdin.end();
        } catch (error) {
          reject(new Error(`Failed to write to Python stdin: ${error}`));
        }
      }
      
      tryNextCommand();
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
      { error: `Failed to analyze text: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}