/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, AuditLogEntry, ExportHistoryItem, SubscriptionTier } from "../types";
import { TrendingUp, CreditCard, RefreshCw, Cpu, Activity, ArrowRight, ShieldCheck, Download, ExternalLink, HardDrive } from "lucide-react";
import TiltCard from "./TiltCard";

interface DashboardScreenProps {
  user: UserProfile;
  auditLogs: AuditLogEntry[];
  recentExports: ExportHistoryItem[];
  onSetScreen: (screen: any) => void;
  triggerSystemMessage: (title: string, msg: string, cat: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL") => void;
  triggerSystemAction: (category: string, details: string) => void;
  onOpenCheckout: () => void;
}

export default function DashboardScreen({
  user,
  auditLogs,
  recentExports,
  onSetScreen,
  triggerSystemMessage,
  triggerSystemAction,
  onOpenCheckout,
}: DashboardScreenProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Extract recent activities for the logger
  const recentActivities = auditLogs.slice(0, 5);

  // SVG Chart data
  const chartValues = [450000, 482000, 465000, 521000, 612000, 584000, 695000, 742000, 721000, 812000, 894000, 942000];
  const chartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const minVal = Math.min(...chartValues);
  const maxVal = Math.max(...chartValues);
  const range = maxVal - minVal;

  const width = 600;
  const height = 150;
  const padding = 10;

  const points = chartValues.map((val, idx) => {
    const x = padding + (idx / (chartValues.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
    return { x, y, value: val };
  });

  const pathData = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div id="dashboard-main-screen" className="space-y-6">
      {/* 1. GREETING HEADER WITH LEVEL UPGRADE PROMPT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-zinc-950/40 shadow-xl shadow-black/5 border border-white/40 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <span className="text-[10px] font-bold tracking-widest text-indigo-500 font-mono uppercase bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/30 dark:border-indigo-500/20 px-2.5 py-0.5 rounded-full mb-2 inline-block shadow-sm">
            ACTIVE SESSION
          </span>
          <h2 className="text-2xl font-display tracking-tight text-zinc-900 dark:text-zinc-50 font-bold">
            Good morning, {user.name.split(" ")[0]}.
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Your telemetry pipelines are operational. Clearance level <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">{user.role}</span> with <span className="text-indigo-500 font-semibold">{user.tier}</span> capabilities.
          </p>
        </div>

        {/* Upgrade alert widget if not Enterprise */}
        {user.tier !== SubscriptionTier.ENTERPRISE && (
          <button
            id="quick-billing-upgrade-banner"
            onClick={onOpenCheckout}
            className="relative z-10 bg-zinc-900 dark:bg-zinc-100 hover:scale-105 text-white dark:text-zinc-900 text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 self-start md:self-center font-display"
          >
            <CreditCard className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
            <span>Manage subscription</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>

      {/* 2. CORE FOUR METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total portfolio value */}
        <TiltCard>
        <div id="dashboard-metric-portfolio" className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-lg shadow-black/5 border border-white/50 dark:border-white/5 rounded-3xl p-5 flex items-center justify-between h-full">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Total Portfolio Value</span>
            <span className="text-2xl font-display font-semibold text-zinc-800 dark:text-zinc-200 mt-1.5 block tracking-tight">$942,050.00</span>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" /> +12.4% this quarter
            </span>
          </div>
          <div className="p-3 bg-white/80 dark:bg-zinc-800/80 rounded-2xl shadow-sm border border-white/50 dark:border-white/10">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
        </div>
        </TiltCard>

        {/* Active API Connections */}
        <TiltCard>
        <div id="dashboard-metric-connections" className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-lg shadow-black/5 border border-white/50 dark:border-white/5 rounded-3xl p-5 flex items-center justify-between h-full">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Active Connections</span>
            <span className="text-lg font-display font-semibold text-zinc-800 dark:text-zinc-200 mt-1.5 block tracking-tight">5 Secure Nodes</span>
            <span className="text-[10px] text-zinc-400 block mt-1 font-mono uppercase tracking-wider">
              {user.tier === SubscriptionTier.FREE ? "Throttled" : "Edge priority"}
            </span>
          </div>
          <div className="p-3 bg-white/80 dark:bg-zinc-800/80 rounded-2xl shadow-sm border border-white/50 dark:border-white/10">
            <HardDrive className="w-5 h-5 text-indigo-500" />
          </div>
        </div>
        </TiltCard>

        {/* Data refresh rate */}
        <TiltCard>
        <div id="dashboard-metric-refresh" className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-lg shadow-black/5 border border-white/50 dark:border-white/5 rounded-3xl p-5 flex items-center justify-between h-full">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Data Refresh Rate</span>
            <span className="text-xl font-display font-semibold text-zinc-800 dark:text-zinc-200 mt-1.5 block tracking-tight">5 seconds</span>
            <button
              id="set-refresh-interval-lnk"
              onClick={() => onSetScreen("SETTINGS")}
              className="text-[10px] text-indigo-500 hover:text-indigo-600 block mt-1 text-left cursor-pointer font-bold tracking-tight"
            >
              Configure frequency &rarr;
            </button>
          </div>
          <div className="p-3 bg-white/80 dark:bg-zinc-800/80 rounded-2xl shadow-sm border border-white/50 dark:border-white/10">
            <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
        </div>
        </TiltCard>

        {/* Market sentiment aggregate */}
        <TiltCard>
        <div id="dashboard-metric-sentiment" className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-lg shadow-black/5 border border-white/50 dark:border-white/5 rounded-3xl p-5 flex items-center justify-between h-full">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Market Sentiment</span>
            <span className="text-xl font-display font-semibold text-emerald-500 mt-1.5 block uppercase tracking-tight">BULLISH</span>
            <span className="text-[10px] text-zinc-400 block mt-1">Aggregated leverage indexes</span>
          </div>
          <div className="p-3 bg-white/80 dark:bg-zinc-800/80 rounded-2xl shadow-sm border border-white/50 dark:border-white/10">
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        </TiltCard>
      </div>

      {/* 3. PERFORMANCE CHART AND HEALTH SECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Portfolio performance interactive chart (8 Cols) */}
        <div id="dashboard-chart-card" className="lg:col-span-8 bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 rounded-3xl p-6 backdrop-blur-2xl space-y-4 relative overflow-hidden shadow-xl shadow-black/5">
          <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[100%] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" /> Portfolio Performance Index
              </h3>
              <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                Weighted aggregate evaluation curves across standard equity and cryptographic positions.
              </p>
            </div>

            <div className="text-right">
              {hoverIndex !== null ? (
                <div>
                  <span className="text-[8px] text-zinc-500 font-mono block tracking-widest">SPOT AUDIT</span>
                  <span className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">${chartValues[hoverIndex].toLocaleString()}</span>
                </div>
              ) : (
                <div>
                  <span className="text-[8px] text-zinc-500 font-mono block tracking-widest">NET RETURNS</span>
                  <span className="text-sm font-mono font-bold text-emerald-500 tracking-tight">+109.33%</span>
                </div>
              )}
            </div>
          </div>

          {/* SVG WAVE CHART */}
          <div className="relative py-2 z-10">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[160px] overflow-visible">
              <defs>
                <linearGradient id="chart-fill-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid guide rule */}
              <line x1="10" y1={height / 2} x2={width - 10} y2={height / 2} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="3 3" />
              <line x1="10" y1={height - padding} x2={width - 10} y2={height - padding} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />

              {/* Main curve area */}
              <path
                d={`M ${points[0].x} ${height - padding} L ${pathData} L ${points[points.length - 1].x} ${height - padding} Z`}
                fill="url(#chart-fill-grad)"
              />

              {/* Curve string */}
              <path d={pathData} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Interactive Tooltip controllers */}
              {points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoverIndex === idx ? "6" : "3"}
                  fill={hoverIndex === idx ? "#6366f1" : "transparent"}
                  stroke={hoverIndex === idx ? "#fff" : "#6366f1"}
                  strokeWidth="2"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className="cursor-pointer transition-all duration-200"
                />
              ))}
            </svg>

            {/* Months Row */}
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono px-3 mt-4">
              {chartMonths.map((m, i) => (
                <span key={i} className={hoverIndex === i ? "text-zinc-900 dark:text-zinc-200 font-semibold" : ""}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* System node health indicators widget (4 Cols) */}
        <div id="dashboard-health-card" className="lg:col-span-4 bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 rounded-3xl p-6 space-y-5 backdrop-blur-2xl shadow-xl shadow-black/5 relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/10 blur-[40px] pointer-events-none"></div>

          <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2 relative z-10">
            <Cpu className="w-4 h-4 text-emerald-500 animate-pulse" /> Edge Node Status
          </h4>

          <div id="system-health-bars" className="space-y-5 pt-1 relative z-10">
            {/* CPU utilization */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-sans">
                <span className="text-zinc-600 dark:text-zinc-400">Router Core</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-mono font-semibold text-[10px]">14%</span>
              </div>
              <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[14%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>

            {/* Ingress DB synchronizer */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-sans">
                <span className="text-zinc-600 dark:text-zinc-400">Redis Shard</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-mono font-semibold text-[10px]">31%</span>
              </div>
              <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[31%] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
              </div>
            </div>

            {/* API Traffic Throttling */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-sans">
                <span className="text-zinc-600 dark:text-zinc-400">Queue Backpressure</span>
                <span className="text-rose-500 font-mono font-bold text-[10px]">82%</span>
              </div>
              <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[82%] rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 rounded-2xl p-4 flex items-start gap-3 relative z-10 backdrop-blur-md">
             <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
             <div>
               <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-none">Security handshakes complete</h5>
               <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                 Two-Factor policy, SSL checks and JWT configurations are up-to-date and encrypted on the cloud shard.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* 4. LIVE AUDIT ACTIVITY LEDGER & DOWNLOADS CENTRE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        {/* Live user/system activity timeline (8 Cols) */}
        <div id="dashboard-activity-feed" className="lg:col-span-8 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-black/5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400">
                System Audit Trace Ledger
              </h4>
            </div>
            <button
              id="goto-audit-logs"
              onClick={() => onSetScreen("SETTINGS")}
              className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
            >
              <span>View full log</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div id="recent-audits-timeline" className="space-y-3">
            {recentActivities.map((log) => (
              <div id={`log-item-dash-${log.id}`} key={log.id} className="p-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm border border-white/50 dark:border-white/5 rounded-2xl flex items-start justify-between gap-4 transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80">
                <div className="flex gap-3.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-2 shadow-[0_0_8px_currentColor] ${
                    log.status === "SUCCESS"
                      ? "bg-emerald-500 text-emerald-500"
                      : log.status === "WARNING"
                      ? "bg-amber-500 text-amber-500"
                      : "bg-rose-500 text-rose-500"
                  }`}></span>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tracking-wide">
                      {log.action}
                    </h5>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{log.details}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {log.category}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono tracking-tight">
                        {log.userName} • {log.ipAddress}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-zinc-400 font-mono tracking-widest shrink-0 mt-1">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent compiled report index (4 Cols) */}
        <div id="dashboard-recent-downloads" className="lg:col-span-4 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl p-6 space-y-5 shadow-xl shadow-black/5">
          <div>
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400">
              Generated Reports
            </h4>
          </div>

          <div id="exports-list-dash" className="space-y-3 pt-1">
            {recentExports.slice(0, 3).map((exp) => (
              <div id={`dash-export-card-${exp.id}`} key={exp.id} className="p-3.5 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm border border-white/50 dark:border-white/5 rounded-2xl flex items-center justify-between gap-3">
                <div className="truncate pr-1">
                  <span className="text-[11px] font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                    {exp.fileName}
                  </span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                      {exp.format}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {exp.size}
                    </span>
                  </div>
                </div>

                <button
                  id={`dash-download-exp-${exp.id}`}
                  disabled={exp.status !== "COMPLETED"}
                  onClick={() => triggerSystemMessage("Download Hooked", `Initiating file secure transfer: ${exp.fileName}`, "SUCCESS")}
                  className="p-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              id="dashboard-open-reports"
              onClick={() => onSetScreen("REPORTS")}
              className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 font-bold py-3 pt-3.5 mt-2 rounded-2xl text-[11px] uppercase tracking-widest font-sans transition-all text-center cursor-pointer shadow-md inline-block"
            >
              Export new report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
