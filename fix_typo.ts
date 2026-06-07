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
    content = content.replace(/text-slate-9000/g, 'text-slate-400');
    content = content.replace(/shadow-zinc-950\/50/g, 'shadow-slate-300/80');
    content = content.replace(/border-zinc-300/g, 'border-indigo-600');
    content = content.replace(/focus:border-zinc-600/g, 'focus:border-indigo-600');
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Fixed text-slate-9000 typo and others.');
