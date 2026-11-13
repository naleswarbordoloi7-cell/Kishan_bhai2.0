
import fs from 'fs';
import path from 'path';

const filePath = '/src/components/speech/FieldVoiceBar.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// A very simple search for calls to functions that look like state setters or props
// outside of common React blocks. This is not perfect but can help.

const lines = content.split('\n');
let inFunction = false;
let inEffect = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('useEffect') || line.includes('useCallback') || line.includes('useMemo')) {
     // skip block
  }
  
  // Look for direct calls to props or setters in the component body
  if (line.match(/^(on|set)[A-Z].*\(.*\);?$/) && !line.includes('useState') && !line.includes('useRef')) {
    console.log(`Potential bad call at line ${i + 1}: ${line}`);
  }
}
