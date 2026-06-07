/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ApiEndpoint, UserRole, SubscriptionTier } from "../types";
import { KeyRound, ShieldAlert, Zap, Layers, RefreshCw, Radio, CheckCircle, AlertTriangle, Play } from "lucide-react";

interface ApiGatewayProps {
  endpoints: ApiEndpoint[];
  userRole: UserRole;
  userTier: SubscriptionTier;
  onModifyEndpoint: (id: string, updatedParams: Partial<ApiEndpoint>) => void;
  triggerSystemAction: (category: string, details: string) => void;
  triggerSystemMessage: (title: string, msg: string, cat: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL") => void;
}

export default function ApiGateway({
  endpoints,
  userRole,
  userTier,
  onModifyEndpoint,
  triggerSystemAction,
  triggerSystemMessage,
}: ApiGatewayProps) {
  const [activeSessionApiToken, setActiveSessionApiToken] = useState("nexus_sk_live_9430fd839b20cc329ea1b");
  const [revealedToken, setRevealedToken] = useState(false);
  const [testEndpointId, setTestEndpointId] = useState("ep-1");
  const [testResults, setTestResults] = useState<{
    status: number;
    latency: number;
    payloadSize: string;
    payload: string;
  } | null>(null);
  const [isSimulatingTest, setIsSimulatingTest] = useState(false);

  // Checks for RBAC operations
  const isAdmin = userRole === UserRole.ADMIN;
  const isAuthorizedEditor = userRole === UserRole.ADMIN || userRole === UserRole.EDITOR;

  const handleRotateKey = () => {
    if (!isAdmin) {
      triggerSystemMessage("Access Restricted", "Administrative privileges (ADMIN Role) are required to rotate secure API secret hashes.", "CRITICAL");
      triggerSystemAction("SYSTEM", "Failed administrative key rotation attempt (RBAC blocked).");
      return;
    }

    const nextToken = "nexus_sk_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 10);
    setActiveSessionApiToken(nextToken);
    triggerSystemMessage("Keys Revoked & Rotated", "Successfully expired active API gateway master keys. All edge nodes are refreshed.", "SUCCESS");
    triggerSystemAction("API", "Manually rotated API Master gateway key hash.");
  };

  const handleTestPing = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingTest(true);
    setTestResults(null);

    const activeEp = endpoints.find((ep) => ep.id === testEndpointId) || endpoints[0];

    setTimeout(() => {
      setIsSimulatingTest(false);
      if (activeEp.status === "DOWN") {
        setTestResults({
          status: 503,
          latency: activeEp.avgLatencyMs + Math.floor(Math.random() * 50),
          payloadSize: "0 B",
          payload: JSON.stringify({ error: "SERVICE_UNAVAILABLE", state: "DOWN" }, null, 2),
        });
        triggerSystemMessage("Gateway Timeout", "Matched downstream endpoint reports DOWN status. Ingress blocked.", "CRITICAL");
      } else {
        setTestResults({
          status: activeEp.status === "DEGRADED" ? 200 : 200,
          latency: activeEp.avgLatencyMs + Math.floor(Math.random() * 20),
          payloadSize: "4.2 KB",
          payload: JSON.stringify(
            {
              status: "ok",
              api_route: activeEp.path,
              method: activeEp.method,
              subscription_tier_lock: activeEp.billingTier,
              node_health: activeEp.status,
              query_timestamps_utc: new Date().toISOString(),
              telemetries: {
                active_throttles_count: 0,
                accumulated_hits: activeEp.totalRequestsCount + 1,
                edge_host_id: "cluster_node_fra_10",
              },
            },
            null,
            2
          ),
        });
        triggerSystemMessage("Query Handshake Success", `Endpoint ${activeEp.path} returned status 200.`, "SUCCESS");
      }
      triggerSystemAction("API", `Triggered diagnostics loop on route endpoint ${activeEp.path}.`);
    }, 1200);
  };

  const handleFlushEndpointCaches = (id: string, path: string) => {
    if (!isAuthorizedEditor) {
      triggerSystemMessage("Action Blocked", "Editor or Administrative permissions are required to flush memory caches on routing endpoints.", "WARNING");
      return;
    }

    // Update endpoints count locally or reset latency
    onModifyEndpoint(id, { avgLatencyMs: Math.max(10, Math.floor(endpoints.find((ep) => ep.id === id)!.avgLatencyMs * 0.8)) });
    triggerSystemMessage("In-Memory Caches Flushed", `Routing caches for ${path} have been forcefully garbage collected.`, "SUCCESS");
    triggerSystemAction("API", `In-Memory cache flush processed for gateway route ${path}.`);
  };

  // SVG traffic render configuration
  const renderTrafficVolumeChart = () => {
    const historicalTraffic = [320, 420, 290, 580, 890, 1150, 940, 780, 1250, 1420, 1380, 1540];
    const maxVal = Math.max(...historicalTraffic);
    const range = maxVal;
    
    const width = 600;
    const height = 110;
    const padding = 10;

    const points = historicalTraffic.map((val, idx) => {
      const x = padding + (idx / (historicalTraffic.length - 1)) * (width - padding * 2);
      const y = height - padding - (val / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[120px] overflow-visible">
        <defs>
          <linearGradient id="api-grid-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
          </linearGradient>
        </defs>
        {/* Fill Area */}
        <path
          d={`M ${padding} ${height - padding} L ${points} L ${width - padding} ${height - padding} Z`}
          fill="url(#api-grid-gradient)"
        />
        {/* Plot line */}
        <polyline points={points} fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Markers */}
        {historicalTraffic.map((val, idx) => {
          const x = padding + (idx / (historicalTraffic.length - 1)) * (width - padding * 2);
          const y = height - padding - (val / range) * (height - padding * 2);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="3.5"
              fill="#f8fafc"
              stroke="#4f46e5"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div id="api-gateway-screen" className="space-y-6">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-slate-50 tracking-tight">API Management Gateway</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Gateway telemetry nodes, average in-flight latencies, cryptographic key rota, and sandbox diagnostics tools.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-lg text-xs flex items-center gap-2 font-mono">
            <span>Privilege tier:</span>
            <span className="text-emerald-600 font-bold uppercase">{userRole}</span>
          </div>
        </div>
      </div>

      {/* CORE FOUR STATISTICS WIDGET OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Average Global Latency</span>
            <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">24.2 ms</span>
            <span className="text-[9px] text-slate-400 font-sans block mt-1">Weighted endpoint averages</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-200/20">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Error Threshold Rate</span>
            <span className="text-xl font-mono font-bold text-red-600 text-red-600 mt-0.5 block">0.82%</span>
            <span className="text-[9px] text-slate-400 font-sans block mt-1">24h HTTP anomaly average</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 text-red-600 border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider block">Gateway Router State</span>
            <span className="text-xl font-mono font-bold text-emerald-600 mt-0.5 block">HEALTHY</span>
            <span className="text-[9px] text-slate-400 font-sans block mt-1">All ingress nodes synchronized</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Active Tunnels Count</span>
            <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{endpoints.length} Routes</span>
            <span className="text-[9px] text-slate-400 font-sans block mt-1">Registered routing tunnels</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* THREE SECTION SPLIT (CHART, TABLE, DIAGNOSTIC) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CENTRAL SYSTEM METRIC GRAPH + TABLE */}
        <div id="api-gateways-metric-graph" className="lg:col-span-8 space-y-6">
          {/* Traffic Volume chart bar card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-indigo-600" /> API Global Traffic Volume (Requests/Min)
            </h4>
            {renderTrafficVolumeChart()}
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono pt-3 border-t border-slate-200 dark:border-slate-700 mt-2">
              <span>08:00 AM UTC</span>
              <span>12:00 PM UTC</span>
              <span>04:00 PM UTC</span>
              <span>Active Peak: 1,540 req/min</span>
            </div>
          </div>

          {/* Endpoint telemetries list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-4 block">
              Global Endpoint Monitor
            </h4>
            <div id="endpoints-table" className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    <th className="py-2.5 pb-2">Method / Path</th>
                    <th className="py-2.5 pb-2">Rate limit tier</th>
                    <th className="py-2.5 pb-2">Latency (Avg)</th>
                    <th className="py-2.5 pb-2">Err Rate</th>
                    <th className="py-2.5 pb-2">Router Status</th>
                    <th className="py-2.5 pb-2 text-right">Audit Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/30 text-xs font-sans text-slate-700 dark:text-slate-300">
                  {endpoints.map((ep) => (
                    <tr id={`ep-row-${ep.id}`} key={ep.id} className="hover:bg-slate-50 dark:bg-slate-900/50">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mr-2 uppercase ${
                          ep.method === "GET"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200/30"
                            : ep.method === "POST"
                            ? "bg-sky-950/40 text-sky-450 text-sky-400 border border-sky-900/20"
                            : "bg-amber-950/30 text-orange-600 border border-amber-900/20"
                        }`}>
                          {ep.method}
                        </span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{ep.path}</span>
                      </td>
                      <td className="py-3">
                        <span className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono">
                          {ep.billingTier}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-500 dark:text-slate-400">{ep.avgLatencyMs} ms</td>
                      <td className="py-3 font-mono text-red-600 text-red-600">{ep.errorRatePercent.toFixed(2)}%</td>
                      <td className="py-3 font-sans">
                        {ep.status === "HEALTHY" && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-200/20 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" /> Healthy
                          </span>
                        )}
                        {ep.status === "DEGRADED" && (
                          <span className="text-[10px] text-orange-600 font-bold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" /> Degraded
                          </span>
                        )}
                        {ep.status === "DOWN" && (
                          <span className="text-[10px] text-red-600 font-bold bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            <ShieldAlert className="w-2.5 h-2.5 animate-bounce" /> Down
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          id={`flush-cache-${ep.id}`}
                          onClick={() => handleFlushEndpointCaches(ep.id, ep.path)}
                          className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded px-2.2 py-1 cursor-pointer transition-all"
                        >
                          Flush cache
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: KEY ROTATION & DIAGNOSTIC SANDBOX CONTROLLER (4 COLS) */}
        <div id="api-diagnostics-controller" className="lg:col-span-4 space-y-6">
          {/* Secret Credentials Token card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-indigo-600" /> Gateway Secret Credentials
            </h4>
            <p className="text-[10px] text-slate-400 font-sans mb-4 leading-relaxed">
              Active secure platform Bearer Secret. Share strictly with approved institutions and back-end proxies.
            </p>

            <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 p-3 rounded-lg mb-4">
              <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-mono">ACTIVE TOKEN</span>
              <div className="flex justify-between items-center mt-1">
                <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all truncate max-w-[210px]">
                  {revealedToken ? activeSessionApiToken : "••••••••••••••••••••••••••••••••••••"}
                </span>
                <button
                  id="toggle-reveal-token"
                  onClick={() => setRevealedToken(!revealedToken)}
                  className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 underline cursor-pointer pr-1"
                >
                  {revealedToken ? "Hide" : "Reveal"}
                </button>
              </div>
            </div>

            {/* Keys Rotation controls */}
            <button
              id="rotate-master-key-btn"
              onClick={handleRotateKey}
              className={`w-full font-bold uppercase text-[10px] font-sans tracking-wider text-center py-2.5 rounded transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isAdmin
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-slate-200/50"
                  : "bg-slate-50 dark:bg-slate-900/50 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700 text-slate-400"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAdmin ? "" : "opacity-40"}`} />
              <span>Rotate Master secret key</span>
            </button>
            {!isAdmin && (
              <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg mt-3 text-[10px] text-orange-600/90 font-mono leading-relaxed">
                👮 ROLE NOTICE: Access to administrative gateway rotation requires <b>ADMIN</b> profile privileges. Switch profile role above to use.
              </div>
            )}
          </div>

          {/* Diagnostics Ping Sandbox simulator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Play className="w-4 h-4 text-indigo-600 animate-pulse" /> Diagnostics Query Sandbox
            </h4>
            <p className="text-[10px] text-slate-400 font-sans mb-4 leading-relaxed">
              Formulate a GET/POST handshake on endpoints directly from the console to verify response schemas.
            </p>

            <form onSubmit={handleTestPing} className="space-y-3.5">
              <div>
                <label className="block text-[9px] text-slate-400 uppercase font-mono mb-1">Select Route Target</label>
                <select
                  id="select-api-ep-test"
                  value={testEndpointId}
                  onChange={(e) => setTestEndpointId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded px-2 py-2 text-xs font-sans text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  {endpoints.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      {ep.method} {ep.path} ({ep.status})
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="ping-test-submit"
                type="submit"
                disabled={isSimulatingTest}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 dark:text-slate-50 font-bold text-[10px] font-sans uppercase tracking-wider py-2.5 rounded cursor-pointer transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
              >
                {isSimulatingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Ping handshaking...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Trigger ping handshake</span>
                  </>
                )}
              </button>
            </form>

            {/* Test Results Output Box */}
            {testResults && (
              <div id="diagnostics-sandbox-results" className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 animate-fade-in">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>SSL Handshake Verified</span>
                  <span className={testResults.status === 200 ? "text-emerald-600 text-emerald-600 font-semibold" : "text-red-600 text-red-600 font-semibold"}>
                    Status: {testResults.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Latency: {testResults.latency}ms</span>
                  <span>Size: {testResults.payloadSize}</span>
                </div>
                <pre className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg p-3 font-mono text-[9px] text-emerald-600/90 max-h-[160px] overflow-y-auto leading-relaxed select-all">
                  {testResults.payload}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
