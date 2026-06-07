import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath: string) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // SVG colors
    content = content.replace(/stroke="#18181b"/g, 'stroke="#e2e8f0"');
    content = content.replace(/stroke="#09090b"/g, 'stroke="#cbd5e1"');
    content = content.replace(/fill="#09090b"/g, 'fill="#f8fafc"');
    
    // Changing the default chart line to indigo
    content = content.replace(/#10b981/g, '#4f46e5');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Fixed SVG colors.');
