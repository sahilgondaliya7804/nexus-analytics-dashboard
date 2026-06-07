/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Terminal, RefreshCw } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div id="loading-skeleton-screen" className="min-h-screen bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Upper header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4 h-12">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700 animate-pulse"></div>
          <div className="h-4 w-32 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-16 h-7 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
          <div className="w-24 h-7 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Main dashboard wireframe mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-8">
        {/* Sidebar placeholder */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 pr-4">
              <div className="w-8 h-8 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0"></div>
              <div className="h-3 w-full bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"></div>
            </div>
          ))}
        </div>

        {/* Central main workspace placeholder */}
        <div className="lg:col-span-9 space-y-6">
          {/* Statistics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
                <div className="h-2.5 w-1/2 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
                <div className="h-6 w-3/4 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
                <div className="h-2 w-1/3 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Interactive Chart placeholder details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.005] border border-emerald-200/[0.003] rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-center">
              <div className="space-y-2 w-1/3">
                <div className="h-3.5 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse w-full"></div>
                <div className="h-2 w-1/2 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
              </div>
              <div className="h-5 w-24 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
            </div>

            {/* Simulated wave wireframe */}
            <div className="h-[120px] flex items-end gap-3.5 border-b border-slate-200 dark:border-slate-700 pb-2">
              {[...Array(12)].map((_, idx) => {
                const heights = ["18%", "24%", "15%", "41%", "62%", "81%", "65%", "48%", "89%", "95%", "90%", "100%"];
                return (
                  <div
                  key={idx}
                  style={{ height: heights[idx] }}
                  className="bg-slate-50 dark:bg-slate-900/50 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:bg-slate-900/50 rounded-t w-full transition-all animate-pulse duration-1000"
                ></div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <div className="h-2 w-12 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
              <div className="h-2 w-12 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
              <div className="h-2 w-12 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer loading tracker */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 font-mono border-t border-slate-200 dark:border-slate-700 pt-4 h-12 gap-3">
        <span className="flex items-center gap-1.5 uppercase font-semibold">
          <Terminal className="w-4 h-4 text-indigo-600 animate-pulse" /> Loading ingress cluster nodes...
        </span>
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" /> SYS_RETRIEVAL_SEQ_04
        </span>
      </div>
    </div>
  );
}
