import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  // Backgrounds
  { regex: /bg-black/g, replace: 'bg-slate-50' },
  { regex: /bg-zinc-950\/[0-9]+/g, replace: 'bg-white' },
  { regex: /bg-zinc-950/g, replace: 'bg-white shadow-sm' },
  { regex: /bg-zinc-952/g, replace: 'bg-white shadow-sm' },
  { regex: /bg-zinc-900\/[0-9]+/g, replace: 'bg-slate-50' },
  { regex: /bg-zinc-902\/[0-9]+/g, replace: 'bg-slate-50' },
  { regex: /bg-zinc-900/g, replace: 'bg-slate-50' },
  { regex: /bg-zinc-902/g, replace: 'bg-slate-50' },
  { regex: /bg-zinc-850/g, replace: 'bg-slate-100' },
  { regex: /bg-zinc-800/g, replace: 'bg-slate-200' },
  { regex: /bg-zinc-100 hover:bg-white text-zinc-950/g, replace: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  { regex: /bg-zinc-100 hover:bg-slate-900 text-zinc-950/g, replace: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  { regex: /text-zinc-950 hover:bg-white/g, replace: 'text-white hover:bg-indigo-700' },
  { regex: /bg-zinc-105/g, replace: 'bg-indigo-600' },
  { regex: /bg-zinc-100 text-zinc-950/g, replace: 'bg-indigo-600 text-white' },
  { regex: /bg-zinc-100/g, replace: 'bg-indigo-600' },
  { regex: /hover:bg-white/g, replace: 'hover:bg-slate-50' },
  
  // Borders
  { regex: /border-zinc-900\/[0-9]+/g, replace: 'border-slate-200' },
  { regex: /border-zinc-900/g, replace: 'border-slate-200' },
  { regex: /border-zinc-850/g, replace: 'border-slate-200' },
  { regex: /border-zinc-800/g, replace: 'border-slate-300' },
  { regex: /border-zinc-700/g, replace: 'border-slate-300' },

  // Texts
  { regex: /text-zinc-50/g, replace: 'text-slate-900' },
  { regex: /text-zinc-100/g, replace: 'text-slate-900' },
  { regex: /text-zinc-150/g, replace: 'text-slate-900' },
  { regex: /text-zinc-200/g, replace: 'text-slate-800' },
  { regex: /text-zinc-250/g, replace: 'text-slate-800' },
  { regex: /text-zinc-300/g, replace: 'text-slate-700' },
  { regex: /text-zinc-305/g, replace: 'text-slate-700' },
  { regex: /text-zinc-350/g, replace: 'text-slate-600' },
  { regex: /text-zinc-400/g, replace: 'text-slate-500' },
  { regex: /text-zinc-440/g, replace: 'text-slate-500' },
  { regex: /text-zinc-450/g, replace: 'text-slate-500' },
  { regex: /text-zinc-455/g, replace: 'text-slate-500' },
  { regex: /text-zinc-500/g, replace: 'text-slate-400' },
  { regex: /text-zinc-550/g, replace: 'text-slate-400' },
  { regex: /text-zinc-600/g, replace: 'text-slate-400' },
  { regex: /text-zinc-650/g, replace: 'text-slate-400' },
  { regex: /text-zinc-700/g, replace: 'text-slate-300' },
  { regex: /text-zinc-950/g, replace: 'text-white' }, // generally in primary buttons
  
  // Hover & states text
  { regex: /hover:text-white/g, replace: 'hover:text-slate-900' },
  { regex: /text-white/g, replace: 'text-slate-900' }, 
  
  // Accents (Emerald -> Indigo for non-money, Emerald for money/success)
  // Let's use emerald-600 for positive money trends, indigo-600 for primary app accents
  { regex: /text-emerald-400/g, replace: 'text-emerald-600' },
  { regex: /text-emerald-450/g, replace: 'text-emerald-600' }, // trending
  { regex: /bg-emerald-500/g, replace: 'bg-emerald-500' }, // keep for positive pulses
  { regex: /text-emerald-500/g, replace: 'text-indigo-600' }, // icons
  { regex: /border-emerald-500/g, replace: 'border-emerald-200' },
  { regex: /border-emerald-900/g, replace: 'border-emerald-200' },
  { regex: /bg-emerald-950\/[0-9]+/g, replace: 'bg-emerald-50' },
  
  // Accent colors like amber and rose
  { regex: /text-rose-400/g, replace: 'text-red-600' },
  { regex: /text-rose-450/g, replace: 'text-red-600' },
  { regex: /text-rose-455/g, replace: 'text-red-600' },
  { regex: /bg-rose-950\/20/g, replace: 'bg-red-50' },
  { regex: /bg-rose-950\/25/g, replace: 'bg-red-50' },
  { regex: /bg-rose-950\/40/g, replace: 'bg-red-100' },
  { regex: /border-rose-900\/30/g, replace: 'border-red-200' },

  { regex: /text-amber-400/g, replace: 'text-orange-600' },
  { regex: /text-amber-500/g, replace: 'text-orange-600' },

  // Shadows
  { regex: /shadow-zinc-950\/20/g, replace: 'shadow-slate-200/50' },
  { regex: /shadow-zinc-950\/10/g, replace: 'shadow-slate-200/50' },

];

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');

    // First do manual targeted fixes
    content = content.replace(/bg-zinc-100 hover:bg-white text-zinc-950/g, 'bg-indigo-600 hover:bg-indigo-700 text-white');
    content = content.replace(/bg-zinc-100 text-zinc-950/g, 'bg-indigo-600 text-white');
    content = content.replace(/bg-zinc-900 hover:bg-zinc-850 text-zinc-100/g, 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200');
    
    replacements.forEach(r => {
      content = content.replace(r.regex, r.replace);
    });

    // Fix up overzealous replacements
    content = content.replace(/bg-indigo-600 hover:bg-indigo-700 text-slate-900/g, 'bg-indigo-600 hover:bg-indigo-700 text-white');
    content = content.replace(/bg-indigo-600 text-slate-900/g, 'bg-indigo-600 text-white');
    
    // Fix "shadow-sm shadow-sm"
    content = content.replace(/shadow-sm shadow-sm/g, 'shadow-sm');
    
    // Convert lucide icon classes text-emerald-500 -> text-indigo-600 inside icons
    // The previous pass already replaced text-emerald-500 with text-indigo-600 so it should be fine.

    // Force logo icon color to be indigo
    content = content.replace(/Terminal className="w-[^"]+ text-emerald-600"/g, (match) => match.replace('text-emerald-600', 'text-indigo-600'));
    content = content.replace(/Terminal className="w-[^"]+ text-indigo-600"/g, (match) => match.replace('text-indigo-600', 'text-indigo-600')); // ensuring it

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Theme applied successfully.');
