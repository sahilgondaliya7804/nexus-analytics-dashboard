/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserRole, SubscriptionTier, ActiveSession } from "../types";
import { Shield, ShieldAlert, Cpu, Eye, EyeOff, Key, Monitor, RefreshCw, Smartphone, LogOut } from "lucide-react";

interface SettingsScreenProps {
  userRole: UserRole;
  userTier: SubscriptionTier;
  activeSessions: ActiveSession[];
  onConfigChange: (newRole: UserRole, newTier: SubscriptionTier) => void;
  triggerSystemMessage: (title: string, msg: string, cat: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL") => void;
  triggerSystemAction: (category: string, details: string) => void;
  onLogoutSession: (id: string) => void;
  isMaintenanceMode: boolean;
  onToggleMaintenance: () => void;
  ambientGlow: boolean;
  onToggleAmbientGlow: () => void;
}

export default function SettingsScreen({
  userRole,
  userTier,
  activeSessions,
  onConfigChange,
  triggerSystemMessage,
  triggerSystemAction,
  onLogoutSession,
  isMaintenanceMode,
  onToggleMaintenance,
  ambientGlow,
  onToggleAmbientGlow,
}: SettingsScreenProps) {
  const [dataRefreshInterval, setDataRefreshInterval] = useState("5s");
  const [selectedLanguage, setSelectedLanguage] = useState("ENGLISH_US");
  const [isTwoFactorActive, setIsTwoFactorActive] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [isEntering2FA, setIsEntering2FA] = useState(false);

  const handleUpdateRole = (role: UserRole) => {
    onConfigChange(role, userTier);
    triggerSystemMessage("RBAC Privilege Altered", `Your active identity has been remapped to the ${role} profile. Checked layouts are updated.`, "INFO");
    triggerSystemAction("SYSTEM", `Modified role-based authentication context context to ${role}.`);
  };

  const handleUpdateTier = (tier: SubscriptionTier) => {
    onConfigChange(userRole, tier);
    triggerSystemMessage("Subscription Modified", `Simulated Stripe billing reconfigured subscription tier to level ${tier}.`, "SUCCESS");
    triggerSystemAction("BILLING", `Billing model downgraded/upgraded locally to level ${tier}.`);
  };

  const handleToggle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTwoFactorActive) {
      setIsTwoFactorActive(false);
      triggerSystemMessage("2FA Disabled", "Multi-factor authentication was revoked on master profile.", "WARNING");
      triggerSystemAction("SYSTEM", "Revoked Two-Factor enforcement settings.");
    } else {
      setIsEntering2FA(true);
    }
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorToken.length < 4) {
      triggerSystemMessage("Validation Failed", "Verification hashes must be at least 4 digits.", "CRITICAL");
      return;
    }
    setIsTwoFactorActive(true);
    setIsEntering2FA(false);
    setTwoFactorToken("");
    triggerSystemMessage("MFA Confirmed", "Two-Factor authentication securely initialized on cloud vault.", "SUCCESS");
    triggerSystemAction("SYSTEM", "Activated Two-Factor multi-factor on master profile.");
  };

  return (
    <div id="settings-screen" className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-zinc-50 tracking-tight">System Administration</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-1">
            Manage active developer RBAC privileges, General data sync thresholds, active sessions, and multi-factor security rules.
          </p>
        </div>
      </div>

      {/* THREE PANEL GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DEVELOPER TESTING SANDBOX WORKSPACE OVERRIDES (8 COLS) */}
        <div id="settings-workbench" className="lg:col-span-8 space-y-6">
          {/* User Profile & Theme Panel */}
          <div className="bg-white/60 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl rounded-3xl p-6 flex flex-col sm:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-sm font-bold font-sans text-zinc-900 dark:text-zinc-50 tracking-tight mb-5">
                User Profile
              </h3>
              <div className="flex items-center gap-5">
                <div className="w-[72px] h-[72px] rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-display">NX</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-display">Nexus Admin</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">admin@nexus-system.dev</p>
                  <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border border-indigo-200/50 dark:border-indigo-800/50">
                    {userRole}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="w-px bg-zinc-200/50 dark:bg-zinc-800/50 hidden sm:block"></div>
            
            <div className="flex-1">
              <h3 className="text-sm font-bold font-sans text-zinc-900 dark:text-zinc-50 tracking-tight mb-4">
                Application Theme
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                Toggle between Light and Dark interface modes.
              </p>
              <button
                onClick={() => {
                  document.documentElement.classList.toggle('dark');
                  const isDark = document.documentElement.classList.contains('dark');
                  triggerSystemMessage("Theme Changed", `Application is now in ${isDark ? 'Dark' : 'Light'} mode.`, "INFO");
                }}
                className="w-full sm:w-auto bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-zinc-700 dark:text-zinc-300 shadow-sm text-xs font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer font-sans"
              >
                Toggle Dark Theme
              </button>
            </div>
          </div>

          {/* Quick RBAC Sandbox panel */}
          <div className="bg-white/60 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 border border-emerald-200/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest font-mono">
                Developer Sandbox Suite
              </span>
              <span className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border border-zinc-200/50 dark:border-zinc-800/50 px-2.5 py-1 rounded-md text-[10px] uppercase font-mono tracking-widest hidden sm:inline-block">
                Instant UI reactivity test tool
              </span>
            </div>

            <h3 className="text-sm font-bold font-sans text-zinc-900 dark:text-zinc-50 tracking-tight mb-2 relative z-10">
              Interactive RBAC & Subscription overrides
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-sans mb-6 leading-relaxed relative z-10">
              Test multi-tenancy access levels! Toggle client-side subscription plans and user roles in real-time. Watch how stock limits, API tools, cron processes, and diagnostic configurations dynamically react in compliance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-zinc-200/50 dark:border-zinc-800/50 relative z-10">
              {/* Role Selectors */}
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
                  Remap Active User Role
                </label>
                <div id="rbac-role-selectors" className="space-y-2.5">
                  {[
                    { id: UserRole.ADMIN, label: "Platform Administrator", desc: "Exposes master token, cron job deletion, and API key rotations in diagnostics." },
                    { id: UserRole.EDITOR, label: "Data Editor", desc: "Allows compilation of PDF/CSV records and invalidating memory caches." },
                    { id: UserRole.SUBSCRIBER, label: "View Subscriber", desc: "Restricted developer endpoints. Prevented from updating system crons." },
                  ].map((role) => {
                    const isSelected = userRole === role.id;
                    return (
                      <div
                        id={`override-role-${role.id.toLowerCase()}`}
                        key={role.id}
                        onClick={() => handleUpdateRole(role.id)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.2)]"
                            : "bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        <div className="text-xs font-bold leading-none font-sans tracking-wide">{role.label}</div>
                        <p className={`text-[11px] mt-1.5 font-sans leading-relaxed ${isSelected ? "text-indigo-100" : "text-zinc-400 dark:text-zinc-500"}`}>
                          {role.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subscription Selector */}
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
                  Remap Billing Tier
                </label>
                <div id="billing-tier-selectors" className="space-y-2.5">
                  {[
                    { id: SubscriptionTier.FREE, label: "Sandbox (Free)", desc: "Access limited tickers. No custom API Key generation." },
                    { id: SubscriptionTier.STANDARD, label: "Standard Developer", desc: "1 active endpoint, automated CSV exports cap (10 / mo)." },
                    { id: SubscriptionTier.PRO, label: "Professional Alpha", desc: "Unlimited active endpoints, premium low-latency routes." },
                    { id: SubscriptionTier.ENTERPRISE, label: "Nexus Enterprise", desc: "Unlimited active logins, full API throughput, custom shards." },
                  ].map((tier) => {
                    const isSelected = userTier === tier.id;
                    return (
                      <div
                        id={`override-tier-${tier.id.toLowerCase()}`}
                        key={tier.id}
                        onClick={() => handleUpdateTier(tier.id)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.2)]"
                            : "bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        <div className="text-xs font-bold leading-none font-sans tracking-wide">{tier.label}</div>
                        <p className={`text-[11px] mt-1.5 font-sans leading-relaxed ${isSelected ? "text-indigo-100" : "text-zinc-400 dark:text-zinc-500"}`}>
                          {tier.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance toggle & General Preferences */}
          <div className="bg-white/60 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl rounded-3xl p-6">
            <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-zinc-500 dark:text-zinc-400 mb-5 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" /> Platform Configuration
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-2 font-bold tracking-widest">Data Sync Refresh Interval</label>
                <select
                  id="select-refresh-interval"
                  value={dataRefreshInterval}
                  onChange={(e) => {
                    setDataRefreshInterval(e.target.value);
                    triggerSystemMessage("Refresh Frequency Remapped", `Downstream financial cache is set to poll alerts every ${e.target.value}.`, "SUCCESS");
                  }}
                  className="w-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-sans"
                >
                  <option value="1s">High Throughput (1s) - Institutional Feed</option>
                  <option value="5s">Standard Polling (5s) - Active Trader</option>
                  <option value="30s">Coarse Interval (30s) - Sandbox Developer</option>
                  <option value="1m">Static Interval (1m) - Cache Restrictive</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-2 font-bold tracking-widest">Primary UI Language Node</label>
                <select
                  id="select-language"
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    triggerSystemMessage("Language Redrawn", `Translating system consoles to language set: ${e.target.value}.`, "INFO");
                  }}
                  className="w-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-sans"
                >
                  <option value="ENGLISH_US">English (US Edition) - Default</option>
                  <option value="ENGLISH_UK">English (UK Sterling Unit)</option>
                  <option value="DEUTSCH_EU">Deutsch (Frankfurt Vault Sync)</option>
                  <option value="JAPAN_JP">日本語 (Tokyo Grid Sync)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
              <div>
                <h5 className="text-xs font-bold font-sans text-zinc-800 dark:text-zinc-200 tracking-wide">Force Global Maintenance Mode</h5>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans mt-1 max-w-sm leading-relaxed">
                  Simulate downstream database lockouts or pipeline deployments to inspect the interrupted state layout.
                </p>
              </div>
              <button
                id="toggle-maintenance-mode"
                onClick={onToggleMaintenance}
                className={`text-xs font-bold py-2.5 px-5 rounded-xl border transition-all cursor-pointer font-sans shrink-0 shadow-sm ${
                  isMaintenanceMode
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                    : "bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-300"
                }`}
              >
                {isMaintenanceMode ? "Turn Off Maintenance Mode" : "Activate Maintenance Screen"}
              </button>
            </div>

            <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
              <div>
                <h5 className="text-xs font-bold font-sans text-zinc-800 dark:text-zinc-200 tracking-wide">Ambient Glow Effects</h5>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans mt-1 max-w-sm leading-relaxed">
                  Adjust 3D background opacity and pulse intensity for a more immersive view, increasing general brightness.
                </p>
              </div>
              <button
                id="toggle-ambient-glow"
                onClick={onToggleAmbientGlow}
                className={`text-xs font-bold py-2.5 px-5 rounded-xl border transition-all cursor-pointer font-sans shrink-0 shadow-sm ${
                  ambientGlow
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                    : "bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-300"
                }`}
              >
                {ambientGlow ? "Disable Ambient Glow" : "Enable Ambient Glow"}
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE SESSIONS & SECURITY POLICY (4 COLS) */}
        <div id="settings-security" className="lg:col-span-4 space-y-6">
          {/* 2FA Verification Card */}
          <div className="bg-white/60 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl rounded-3xl p-6">
            <h4 className="text-[11px] font-bold uppercase font-mono tracking-widest text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500 animate-pulse" /> Security Protection
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans mb-5 leading-relaxed">
              Enable two-factor authentication (2FA) verification hashes to protect secure API endpoints and key credentials.
            </p>

            {isEntering2FA ? (
              <form onSubmit={handleConfirm2FA} className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-zinc-400 font-mono tracking-widest block mb-3 font-bold">ENTER AUTHENTICATOR CODE</span>
                  <input
                    id="mfa-token-input"
                    type="text"
                    maxLength={6}
                    value={twoFactorToken}
                    onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 482051"
                    className="bg-white/50 dark:bg-zinc-950/50 border border-zinc-200/50 dark:border-zinc-800/50 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-center font-mono text-lg tracking-[0.25em] text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/20 w-full shadow-inner"
                  />
                </div>
                <div className="flex gap-2.5">
                  <button
                    id="cancel-2fa-btn"
                    type="button"
                    onClick={() => setIsEntering2FA(false)}
                    className="flex-1 bg-white dark:bg-zinc-900 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-300 text-xs py-2.5 rounded-xl font-bold font-sans cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-2fa-btn"
                    type="submit"
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl font-sans cursor-pointer shadow-sm transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-3.5 rounded-2xl mb-5 shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 block tracking-wide">Google Authenticator</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tracking-widest uppercase mt-0.5 block">
                      Status: {isTwoFactorActive ? "ON" : "OFF"}
                    </span>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${isTwoFactorActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-300 dark:bg-zinc-700"}`}></span>
                </div>

                <button
                  id="onboard-2fa-toggle"
                  onClick={handleToggle2FA}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide cursor-pointer text-center transition-all shadow-sm ${
                    isTwoFactorActive
                      ? "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                      : "bg-indigo-500 text-white hover:bg-indigo-600 border border-transparent"
                  }`}
                >
                  {isTwoFactorActive ? "Remove Two-Factor Protection" : "Setup Google Auth"}
                </button>
              </div>
            )}
          </div>

          {/* Active logins session list */}
          <div className="bg-white/60 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl rounded-3xl p-6">
            <h4 className="text-[11px] font-bold uppercase font-mono tracking-widest text-zinc-500 dark:text-zinc-400 mb-5 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-500" /> Active Session Details
            </h4>

            <div id="active-sessions-list" className="space-y-4">
              {activeSessions.map((session) => (
                <div id={`session-card-${session.id}`} key={session.id} className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-snug tracking-wide">{session.deviceName}</h5>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-1 tracking-wider">IP: {session.ipAddress}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">Location: {session.location}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md leading-none tracking-widest">
                        {session.lastActive}
                      </span>
                      {!session.isCurrent && (
                        <button
                          id={`close-session-${session.id}`}
                          onClick={() => {
                            onLogoutSession(session.id);
                            triggerSystemMessage("Session Force-Closed", `Expired authentication handshake key for login: ${session.deviceName}`, "SUCCESS");
                            triggerSystemAction("SYSTEM", "Forced remote login session termination.");
                          }}
                          className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline cursor-pointer transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
