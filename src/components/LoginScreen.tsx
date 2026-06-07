/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { firebaseAuth } from "../lib/firebase";
import { Lock, Mail, Eye, EyeOff, Terminal, Shield, ArrowRight, UserCheck } from "lucide-react";
import { UserProfile } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  triggerSystemMessage: (title: string, msg: string, cat: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL") => void;
}

export default function LoginScreen({ onLoginSuccess, triggerSystemMessage }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const DEMO_USERS = [
    {
      email: "alex.mercer@nexus.io",
      label: "Admin & Enterprise Partner",
      icon: "⚡",
      desc: "Full permissions, telemetry controllers, API gateway configurations.",
    },
    {
      email: "subscriber@gmail.com",
      label: "Standard Subscriber",
      icon: "👤",
      desc: "Restricted developer endpoints, basic stock and crypto markets.",
    },
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      let profile: UserProfile;
      if (isSignUp) {
        profile = await firebaseAuth.signUpWithEmail(email, password, name);
        triggerSystemMessage("Account Registered", `Welcome ${profile.name}! Your account is initialized under standard Subscription limits.`, "SUCCESS");
      } else {
        profile = await firebaseAuth.signInWithEmail(email, password);
        triggerSystemMessage("Access Authorized", `Welcome back, ${profile.name}. Handshake key generated.`, "SUCCESS");
      }
      onLoginSuccess(profile);
    } catch (e: any) {
      setErrorMessage(e.message || "Credential handshake failed. Please try again.");
      triggerSystemMessage("Authorization Denied", e.message || "Failed password check.", "CRITICAL");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreFill = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword("nexus_alpha_2026");
    setIsSignUp(false);
    setErrorMessage("");
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-emerald-500/[0.02] border border-emerald-200/[0.04] rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-sky-500/[0.01] border border-sky-500/[0.03] rounded-full blur-3xl pointer-events-none"></div>

      {/* Main card */}
      <div
        id="login-card"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10"
      >
        {/* Core Header Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center mb-3 group-hover:border-slate-300 dark:border-slate-600 transition-colors">
            <Terminal className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-emerald-600 font-mono uppercase bg-emerald-50 border border-emerald-800/30 px-2 py-0.5 rounded-full mb-1">
            Nexus Intelligence Gateway
          </span>
          <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-slate-50 tracking-tight">
            {isSignUp ? "Create Developer Account" : "Platform Handshake"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            {isSignUp ? "Connect your local nodes to the Nexus SAAS network" : "Authorization node required to parse market data streams"}
          </p>
        </div>

        {errorMessage && (
          <div id="login-error-alert" className="mb-4 bg-rose-500/10 border border-rose-500/20 text-red-600 p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2">
            <div className="bg-rose-500 text-black font-bold p-0.5 rounded text-[8px] font-mono shrink-0 select-none mt-0.5">X</div>
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-mono">
                Full Display Name
              </label>
              <div className="relative">
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-200 text-xs rounded px-3 py-2.5 pl-8 font-sans transition-all"
                  placeholder="e.g. Cassandra Vance"
                />
                <UserCheck className="absolute left-2.5 top-3 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-mono">
              Email Node Address
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-200 text-xs rounded px-3 py-2.5 pl-8 font-sans transition-all"
                placeholder="developer@nexus.io"
              />
              <Mail className="absolute left-2.5 top-3 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                Security Password
              </label>
              {!isSignUp && (
                <button
                  id="forgot-password"
                  type="button"
                  onClick={() => triggerSystemMessage("Reset Link Sent", "If this email represents an active node, a secret key reset code has been routed.", "INFO")}
                  className="text-[10px] text-slate-400 hover:text-slate-700 dark:text-slate-300 font-sans cursor-pointer transition-colors"
                >
                  Forgot credential?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-200 text-xs rounded px-3 py-2.5 pl-8 pr-10 font-mono transition-all"
                placeholder="••••••••"
              />
              <Lock className="absolute left-2.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <button
                id="toggle-password-visibility"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="flex items-center">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-3.5 h-3.5 rounded bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 text-indigo-600 mr-2 shrink-0 accent-emerald-500 focus:ring-0"
              />
              <label htmlFor="remember-me-checkbox" className="text-[11px] text-slate-400 select-none font-sans">
                Keep session handshake active (LocalStorage cached)
              </label>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded text-xs uppercase tracking-wider font-sans transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-slate-200/50 active:transform active:scale-98"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5 font-mono">
                AUTHENTICATING...
              </span>
            ) : (
              <>
                <span>{isSignUp ? "Commit Local Node" : "Access Console Gateway"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <span className="relative bg-white dark:bg-slate-900 shadow-sm px-3 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
            Identity Providers
          </span>
        </div>

        {/* Social Authentication Simulator */}
        <div id="social-auth-providers" className="grid grid-cols-3 gap-2 mb-6">
          {["Google", "Apple", "GitHub"].map((provider) => (
            <button
              id={`auth-${provider.toLowerCase()}`}
              key={provider}
              type="button"
              onClick={() => {
                const simulatedEmail = `${provider.toLowerCase()}-dev@nexus.io`;
                handlePreFill(simulatedEmail);
                triggerSystemMessage("Provider Authenticated", `Connected via ${provider} OAuth securely.`, "SUCCESS");
              }}
              className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:border-slate-600 transition-all border border-slate-200 dark:border-slate-700 rounded py-2 text-[10px] text-slate-500 dark:text-slate-400 font-sans cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-indigo-600" />
              <span>{provider}</span>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            id="toggle-auth-mode"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage("");
            }}
            className="text-xs text-slate-400 hover:text-slate-700 dark:text-slate-300 transition-colors font-sans cursor-pointer underline"
          >
            {isSignUp ? "Already registered? Handshake existing session" : "No active node? Request access & register now"}
          </button>
        </div>
      </div>

      {/* QUICK TESTING CONTROLS */}
      <div
        id="demo-accounts-panel"
        className="w-full max-w-md mt-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 relative z-10"
      >
        <span className="text-[9px] font-bold tracking-widest text-orange-600 font-mono uppercase bg-amber-950/20 border border-amber-800/30 px-2 py-0.5 rounded-full mb-3 inline-block">
          ⚡ Demo Access Nodes
        </span>
        <p className="text-[10px] text-slate-400 font-sans mb-3 leading-relaxed">
          Select a role profile below to pre-fill security tokens instantly and review role-based access control (RBAC) levels:
        </p>
        <div className="space-y-2">
          {DEMO_USERS.map((demo) => (
            <button
              id={`autofill-btn-${demo.email.split("@")[0]}`}
              key={demo.email}
              onClick={() => {
                handlePreFill(demo.email);
                triggerSystemMessage("Demo Autofilled", `${demo.label} email pre-filled. Press 'Access Console Gateway' to proceed.`, "INFO");
              }}
              className="w-full text-left bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 p-2.5 rounded-lg transition-all flex items-start gap-2.5 group cursor-pointer"
            >
              <span className="text-base leading-none select-none mt-0.5">{demo.icon}</span>
              <div>
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">
                  {demo.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  {demo.desc}
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">
                  email: {demo.email}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
