/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Hammer, RefreshCw, LifeBuoy, Terminal, AlertTriangle, ArrowRight } from "lucide-react";

interface MaintenanceScreenProps {
  onDisableMaintenance: () => void;
  triggerSystemMessage: (title: string, msg: string, cat: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL") => void;
}

export default function MaintenanceScreen({
  onDisableMaintenance,
  triggerSystemMessage,
}: MaintenanceScreenProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<"IDLE" | "SUCCESS" | "FAIL">("IDLE");

  const handleRetryConnection = () => {
    setIsRetrying(true);
    setRetryResult("IDLE");
    setTimeout(() => {
      setIsRetrying(false);
      setRetryResult("SUCCESS");
      triggerSystemMessage("Subsystem Available", "All local database caches and edge API proxy routers are running normal.", "SUCCESS");
    }, 1500);
  };

  return (
    <div id="maintenance-panel" className="min-h-screen bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-500/[0.015] border border-amber-500/[0.01] rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-rose-500/[0.01] border border-rose-500/[0.01] rounded-full blur-2xl pointer-events-none"></div>

      <div
        id="maintenance-card"
        className="w-full max-w-lg bg-white dark:bg-slate-900 shadow-sm border border-amber-500/20 rounded-2xl p-6 sm:p-10 backdrop-blur-md shadow-2xl relative z-10 text-center space-y-6"
      >
        {/* Core Animated warning tag */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-orange-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-orange-600 font-mono uppercase bg-amber-950/40 border border-amber-900/30 px-2.5 py-0.5 rounded-full mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span> SYSTEM_MAINTENANCE_LOCKED_503
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-sans text-slate-900 dark:text-slate-50 tracking-tight">
            Subsystem Sync Interrupted
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-2 max-w-sm leading-relaxed">
            The active database shard in Frankfurt (node_cluster_fra_10) is currently parsing an automated pipeline build or structural schema migration. API routers are temporarily restricted.
          </p>
        </div>

        {/* Informational Diagnostic state rows */}
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-left font-mono text-xs text-slate-400 space-y-2">
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
            <span>DOWNSTREAM NODE ID</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono">cluster_node_fra_10</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
            <span>IN-FLIGHT BUILD VERSION</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono">v4.42.1 (esbuild compilation)</span>
          </div>
          <div className="flex justify-between">
            <span>ESTIMATED ONLINE ETA</span>
            <span className="text-orange-600 font-bold">14 mins UTC</span>
          </div>
        </div>

        {/* Retry/Resume controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            id="retry-connection-ping"
            disabled={isRetrying}
            onClick={handleRetryConnection}
            className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-700 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 transition-all cursor-pointer disabled:opacity-40"
          >
            {isRetrying ? (
              <RefreshCw className="w-4 h-4 text-orange-600 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            )}
            <span>{isRetrying ? "Retrying nodes..." : "Handshake Downstream"}</span>
          </button>

          <button
            id="direct-override-console"
            onClick={onDisableMaintenance}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
          >
            <span>Bypass Interruption</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {retryResult === "SUCCESS" && (
          <div className="bg-emerald-500/10 border border-emerald-200/20 text-emerald-600 p-3 rounded-lg text-xs leading-normal font-sans">
            ✔ Handshake successful. Ingress routers are responding with status <b>200 OK</b> on standard loopbacks. Press 'Bypass Interruption' to access dashboards.
          </div>
        )}

        {/* Support helper */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 font-sans gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[10px]">
            <Terminal className="w-3.5 h-3.5 text-slate-400" /> SYS_HANDSHAKE_LOG_PENDING
          </span>
          <button
            id="open-support-ticket"
            onClick={() => triggerSystemMessage("Support Ticket Dispatched", "Your active system traceback has been routed to engineering nodes.", "INFO")}
            className="flex items-center gap-1 hover:text-slate-900 dark:text-slate-50 underline cursor-pointer transition-colors"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-orange-600" />
            <span>Launch emergency developer chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
