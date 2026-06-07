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
    
    // Backgrounds
    content = content.replace(/bg-white/g, 'bg-white dark:bg-slate-900');
    content = content.replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-900\/50');
    content = content.replace(/bg-slate-100/g, 'bg-slate-100 dark:bg-slate-800');
    content = content.replace(/bg-indigo-50/g, 'bg-indigo-50 dark:bg-indigo-900\/30');
    
    // Text colors
    content = content.replace(/text-slate-900/g, 'text-slate-900 dark:text-slate-50');
    content = content.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-200');
    content = content.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-300');
    content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-400');
    content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
    
    // Borders
    content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-700');
    content = content.replace(/border-slate-300/g, 'border-slate-300 dark:border-slate-600');
    
    // Fix existing dark duplicates
    content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
    content = content.replace(/dark:text-slate-50 dark:text-slate-50/g, 'dark:text-slate-50');
    content = content.replace(/dark:border-slate-700 dark:border-slate-700/g, 'dark:border-slate-700');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Added dark mode classes.');
