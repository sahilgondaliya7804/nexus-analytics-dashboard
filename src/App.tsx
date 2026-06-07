/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ActiveScreen,
  UserRole,
  SubscriptionTier,
  UserProfile,
  StockTicker,
  CryptoTicker,
  ApiEndpoint,
  NotificationItem,
  ActiveSession,
  ScheduledExportTask,
  ExportHistoryItem,
  AuditLogEntry,
} from "./types";

import {
  INITIAL_STOCKS,
  INITIAL_CRYPTOS,
  INITIAL_API_ENDPOINTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SESSIONS,
  INITIAL_SCHEDULED_EXPORTS,
  INITIAL_EXPORT_HISTORY,
  INITIAL_AUDIT_LOGS,
} from "./data/mockData";

// Components
import DashboardScreen from "./components/DashboardScreen";
import EquitiesOverview from "./components/EquitiesOverview";
import CryptoMarkets from "./components/CryptoMarkets";
import ApiGateway from "./components/ApiGateway";
import ExportCenter from "./components/ExportCenter";
import SettingsScreen from "./components/SettingsScreen";
import MaintenanceScreen from "./components/MaintenanceScreen";
import LoadingScreen from "./components/LoadingScreen";
import StripeCheckoutModal from "./components/StripeCheckoutModal";
import LoginScreen from "./components/LoginScreen";
import NotificationCenter from "./components/NotificationCenter";
import WeatherAnalytics from "./components/WeatherAnalytics";
import Premium3DBackground from "./components/Premium3DBackground";

import {
  LayoutDashboard,
  TrendingUp,
  Coins,
  Cpu,
  FileText,
  Settings,
  Bell,
  LogOut,
  Terminal,
  Shield,
  CreditCard,
  Menu,
  X,
  PlusCircle,
  AlertTriangle,
  Lightbulb,
  CloudLightning,
} from "lucide-react";

import ThreeDOrb from "./components/ThreeDOrb";
import { Sparkles, Send, History, Plus, MessageSquare } from "lucide-react";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  category: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL";
}

export default function App() {
  // Authentication & Profile States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Active Layout screen state
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(ActiveScreen.DASHBOARD);

  // Core Global States
  const [stocks, setStocks] = useState<StockTicker[]>(INITIAL_STOCKS);
  const [cryptos, setCryptos] = useState<CryptoTicker[]>(INITIAL_CRYPTOS);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>(INITIAL_API_ENDPOINTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledExportTask[]>(INITIAL_SCHEDULED_EXPORTS);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>(INITIAL_EXPORT_HISTORY);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Custom user lists
  const [watchlistSyms, setWatchlistSyms] = useState<string[]>(["NVDA", "AAPL", "TSLA"]);
  const [watchlistCryptoSyms, setWatchlistCryptoSyms] = useState<string[]>(["BTC", "ETH", "SOL"]);

  // Visual Toggles
  const [ambientGlow, setAmbientGlow] = useState(false);

  // System State toggles
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // HUD Feed toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // AI Assistant State
  type AIMessage = { role: "USER"|"AI", text: string };
  type AIChatSession = { id: string, title: string, messages: AIMessage[] };

  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [aiSessions, setAiSessions] = useState<AIChatSession[]>([
    {
      id: "session_1",
      title: "Current Chat",
      messages: [
        { role: "AI", text: "Hello, I am Nexus AI. I can help analyze your portfolio, trigger security audits, or explain active telemetry patterns. How can I assist?" }
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>("session_1");

  const activeSession = aiSessions.find(s => s.id === activeSessionId) || aiSessions[0];
  const aiMessages = activeSession.messages;

  // Auto-collapse sidebar on mobile if keyboard opens (vertical space shrinks)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && window.innerHeight < 500) {
        setIsAISidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    
    const userMsg = aiInput;
    setAiInput("");
    setIsAIThinking(true);
    
    setAiSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
           ...s,
           title: s.title === "Current Chat" || s.title === "New Chat" ? userMsg.substring(0, 20) + '...' : s.title,
           messages: [...s.messages, { role: "USER", text: userMsg }] 
        };
      }
      return s;
    }));
    
    // Fake AI response delay
    setTimeout(() => {
      setIsAIThinking(false);
      setAiSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
             ...s,
             messages: [...s.messages, { role: "AI", text: `I have analyzed your request regarding "${userMsg}". All subsystems are operating at peak efficiency. Is there anything else you'd like to inspect?` }] 
          };
        }
        return s;
      }));
      triggerSystemMessage("Nexus AI Activity", "Natural language query successfully processed.", "INFO");
    }, 1800);
  };

  const createNewAISession = () => {
    const newSession: AIChatSession = {
      id: `session_${Date.now()}`,
      title: "New Chat",
      messages: [
        { role: "AI", text: "Hello, I am Nexus AI. How can I assist you with this new inquiry?" }
      ]
    };
    setAiSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Authenticate user check listener
  useEffect(() => {
    // Basic simulate firebase state loaded
    const savedSession = localStorage.getItem("saas_market_user_session");
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch (e) {
        setUser(null);
      }
    }
    setTimeout(() => {
      setAuthChecking(false);
    }, 1200);
  }, []);

  // System Handlers helper
  const triggerSystemMessage = (
    title: string,
    msg: string,
    category: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL"
  ) => {
    const nextToast: ToastMessage = {
      id: "toast_" + Math.random().toString(36).substring(2, 9),
      title,
      message: msg,
      category,
    };
    setToasts((prev) => [...prev, nextToast]);

    // Push new notification elements dynamically as well!
    const nextNotification: NotificationItem = {
      id: "notif_" + Math.random().toString(36).substring(2, 9),
      title,
      message: msg,
      category,
      timestamp: "Active Now",
      isRead: false,
    };
    setNotifications((prev) => [nextNotification, ...prev]);

    // Prune toasts
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== nextToast.id));
    }, 4500);
  };

  // Log Secure Operations to general Ledger Audit
  const triggerAuditAction = (category: string, details: string, ipValue = "192.168.1.104") => {
    if (!user) return;
    const nextLog: AuditLogEntry = {
      id: "log_" + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      userId: user.uid,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      userTier: user.tier,
      action: details.split(":")[0] || "Handshake action",
      category: category as any,
      ipAddress: ipValue,
      status: "SUCCESS",
      details,
    };
    setAuditLogs((prev) => [nextLog, ...prev]);
  };

  // Toggle equity watchlist elements
  const toggleWatchlist = (symbol: string) => {
    if (watchlistSyms.includes(symbol)) {
      setWatchlistSyms((prev) => prev.filter((s) => s !== symbol));
      triggerSystemMessage("Watchlist Removed", `You are no longer tracking equity symbol ${symbol}.`, "INFO");
    } else {
      setWatchlistSyms((prev) => [...prev, symbol]);
      triggerSystemMessage("Watchlist Added", `Successfully registered custom ticker ${symbol} on Stock watchlist.`, "SUCCESS");
    }
    triggerAuditAction("PORTFOLIO", `Modified equity tracking: ${symbol} toggled.`);
  };

  // Toggle cryptocurrency list elements
  const toggleCryptoWatchlist = (symbol: string) => {
    if (watchlistCryptoSyms.includes(symbol)) {
      setWatchlistCryptoSyms((prev) => prev.filter((s) => s !== symbol));
      triggerSystemMessage("Ledger Watchlist Removed", `Crypto code ${symbol} unlinked from live watchlist feeds.`, "INFO");
    } else {
      setWatchlistCryptoSyms((prev) => [...prev, symbol]);
      triggerSystemMessage("Ledger Watchlist Synchronized", `Linked decentralized token ${symbol} to active tickers list.`, "SUCCESS");
    }
    triggerAuditAction("PORTFOLIO", `Modified decentralized on-chain tracking watchlist: ${symbol} toggled.`);
  };

  // Core User Configuration Change (Simulating settings override)
  const handleConfigOverride = (nextRole: UserRole, nextTier: SubscriptionTier) => {
    if (!user) return;
    const updated = { ...user, role: nextRole, tier: nextTier };
    setUser(updated);
    localStorage.setItem("saas_market_user_session", JSON.stringify(updated));
    triggerAuditAction("SYSTEM", `Privileges modified overrides: role changed to ${nextRole} and subscription to ${nextTier}`);
  };

  // Endpoint configuration mutations
  const handleModifyEndpoints = (id: string, updatedParams: Partial<ApiEndpoint>) => {
    setApiEndpoints((prev) =>
      prev.map((ep) => (ep.id === id ? { ...ep, ...updatedParams } : ep))
    );
  };

  // Handle reports schedules and compilations lists
  const handleModifyScheduledTasks = (
    action: "CREATE" | "TOGGLE" | "DELETE",
    id?: string,
    nextObj?: any
  ) => {
    if (action === "CREATE") {
      setExportHistory((prev) => [nextObj, ...prev]);
      triggerAuditAction("EXPORT", `Render PDF Export successful: fileName: ${nextObj.fileName}`);
    } else if (action === "TOGGLE") {
      setScheduledTasks((prev) => [nextObj, ...prev]);
      triggerAuditAction("EXPORT", `Compiling cron task schedule initialized: ${nextObj.name}`);
    } else if (action === "DELETE") {
      setScheduledTasks((prev) => prev.filter((task) => task.id !== id));
      triggerAuditAction("EXPORT", `Terminated scheduled job from system cron: ID: ${id}`);
    }
  };

  // Handle disconnections of remote log-sessions
  const handleLogoutSession = (id: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    triggerAuditAction("SYSTEM", `Manually terminated active session log: ID: ${id}`);
  };

  // Manage System Notifications Checklist Actions
  const dispatchNotificationAction = (
    action: "READ" | "DELETE" | "READ_ALL" | "CLEAR_ALL",
    id?: string
  ) => {
    if (action === "READ") {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } else if (action === "DELETE") {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } else if (action === "READ_ALL") {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      triggerSystemMessage("Handshake complete", "Registered all active feed lines as read.", "SUCCESS");
    } else if (action === "CLEAR_ALL") {
      setNotifications([]);
      triggerSystemMessage("Trace Log Purged", "Annihilated all telemetry notification records.", "WARNING");
    }
  };

  // Stripe Upgrade Successful Simulation
  const handleStripeUpgradeSuccess = (promotedTier: SubscriptionTier) => {
    if (!user) return;
    const updatedUser = { ...user, tier: promotedTier };
    setUser(updatedUser);
    localStorage.setItem("saas_market_user_session", JSON.stringify(updatedUser));
    triggerSystemMessage("Stripe Upgrade Succeeded", `Successfully promoted subscription status to ${promotedTier}! API limits extended.`, "SUCCESS");
    triggerAuditAction("BILLING", `Stripe subscription checkout processed. Promoted tier capabilities to ${promotedTier}.`);
  };

  // Basic User sign out
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("saas_market_user_session");
    setActiveScreen(ActiveScreen.DASHBOARD);
    triggerSystemMessage("Session handshake ended", "Authentication token invalidated securely.", "INFO");
  };

  // Setup unauthenticated screen if not logged in
  if (!user && !authChecking) {
    return (
      <LoginScreen
        onLoginSuccess={(profile) => {
          setUser(profile);
          triggerAuditAction("AUTHENTICATION", "Authorized node connection (Firebase Authenticator linking success).");
        }}
        triggerSystemMessage={triggerSystemMessage}
      />
    );
  }

  // Undergoing Maintenance / Interrupted layout state
  if (isMaintenanceMode) {
    return (
      <MaintenanceScreen
        onDisableMaintenance={() => setIsMaintenanceMode(false)}
        triggerSystemMessage={triggerSystemMessage}
      />
    );
  }

  // Standard loading skeleton
  if (authChecking || isLoadingSkeleton) {
    return <LoadingScreen />;
  }

  // Active Screens router
  const renderWorkspaceScreen = () => {
    switch (activeScreen) {
      case ActiveScreen.DASHBOARD:
        return (
          <DashboardScreen
            user={user!}
            auditLogs={auditLogs}
            recentExports={exportHistory}
            onSetScreen={(s) => setActiveScreen(s)}
            triggerSystemMessage={triggerSystemMessage}
            triggerSystemAction={triggerAuditAction}
            onOpenCheckout={() => setIsStripeModalOpen(true)}
          />
        );
      case ActiveScreen.EQUITIES:
        return (
          <EquitiesOverview
            stocks={stocks}
            watchlistSyms={watchlistSyms}
            toggleWatchlist={toggleWatchlist}
            triggerSystemAction={triggerAuditAction}
            triggerSystemMessage={triggerSystemMessage}
          />
        );
      case ActiveScreen.CRYPTO:
        return (
          <CryptoMarkets
            cryptos={cryptos}
            watchlistCryptoSyms={watchlistCryptoSyms}
            toggleCryptoWatchlist={toggleCryptoWatchlist}
            triggerSystemAction={triggerAuditAction}
            triggerSystemMessage={triggerSystemMessage}
          />
        );
      case ActiveScreen.API_GATEWAY:
        return (
          <ApiGateway
            endpoints={apiEndpoints}
            userRole={user!.role}
            userTier={user!.tier}
            onModifyEndpoint={handleModifyEndpoints}
            triggerSystemAction={triggerAuditAction}
            triggerSystemMessage={triggerSystemMessage}
          />
        );
      case ActiveScreen.NOTIFICATIONS:
        return (
          <NotificationCenter
            notifications={notifications}
            dispatchNotificationAction={dispatchNotificationAction}
          />
        );
      case ActiveScreen.REPORTS:
        return (
          <ExportCenter
            scheduledTasks={scheduledTasks}
            exportHistory={exportHistory}
            userRole={user!.role}
            onModifyTasks={handleModifyScheduledTasks}
            triggerSystemAction={triggerAuditAction}
            triggerSystemMessage={triggerSystemMessage}
          />
        );
      case ActiveScreen.SETTINGS:
        return (
          <SettingsScreen
            userRole={user!.role}
            userTier={user!.tier}
            activeSessions={activeSessions}
            onConfigChange={handleConfigOverride}
            triggerSystemMessage={triggerSystemMessage}
            triggerSystemAction={triggerAuditAction}
            onLogoutSession={handleLogoutSession}
            isMaintenanceMode={isMaintenanceMode}
            onToggleMaintenance={() => setIsMaintenanceMode(true)}
            ambientGlow={ambientGlow}
            onToggleAmbientGlow={() => setAmbientGlow(!ambientGlow)}
          />
        );
      case ActiveScreen.WEATHER:
        return (
          <WeatherAnalytics
            triggerSystemMessage={triggerSystemMessage}
            triggerSystemAction={triggerAuditAction}
          />
        );
      default:
        return <LoadingScreen />;
    }
  };

  // Nav labels sidebar references
  const NAV_ITEMS = [
    { id: ActiveScreen.DASHBOARD, label: "Terminal Dashboard", icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
    { id: ActiveScreen.EQUITIES, label: "Equities Overview", icon: <TrendingUp className="w-4.5 h-4.5" /> },
    { id: ActiveScreen.CRYPTO, label: "Crypto Markets", icon: <Coins className="w-4.5 h-4.5" /> },
    { id: ActiveScreen.WEATHER, label: "Weather Analytics", icon: <CloudLightning className="w-4.5 h-4.5" /> },
    { id: ActiveScreen.API_GATEWAY, label: "API gateway Control", icon: <Cpu className="w-4.5 h-4.5" /> },
    { id: ActiveScreen.REPORTS, label: "Reports & Export Center", icon: <FileText className="w-4.5 h-4.5" /> },
    { id: ActiveScreen.NOTIFICATIONS, label: "Notification center", icon: <Bell className="w-4.5 h-4.5" />, badge: notifications.filter(n => !n.isRead).length },
    { id: ActiveScreen.SETTINGS, label: "Configuration Node", icon: <Settings className="w-4.5 h-4.5" /> },
  ];

  return (
    <div id="saas-market-app" className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-zinc-800 dark:text-zinc-200 font-sans flex relative overflow-hidden">
      <Premium3DBackground ambientGlow={ambientGlow} />
      {/* 1. LEFT SIDEBAR NAVIGATION: DESKTOP EDITION (GLASS COMPACT) */}
      <aside
        id="desktop-sidebar"
        className="hidden lg:flex w-72 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] border-r border-zinc-200/50 dark:border-zinc-800/50 flex-col justify-between py-8 shrink-0 relative z-20 transition-all font-display"
      >
        <div className="space-y-8">
          {/* Dashboard HUD Identity */}
          <div className="px-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl flex items-center justify-center">
              <Terminal className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest block">
                NEXUS
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tracking-widest uppercase block leading-none mt-1">
                Platform
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 px-4 block">
            {NAV_ITEMS.map((item) => {
              const isSelected = activeScreen === item.id;
              return (
                <button
                  id={`nav-link-desktop-${item.id.toLowerCase()}`}
                  key={item.id}
                  onClick={() => {
                    setActiveScreen(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="tracking-wide">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? "bg-white/20 dark:bg-black/20 text-current" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Card Bottom Sidebar widget */}
        <div className="px-6 space-y-4">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-200/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono uppercase flex items-center justify-center shrink-0">
              {user?.name.substring(0, 2)}
            </div>
            <div className="truncate pr-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate block tracking-wide">
                {user?.name}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase block truncate leading-none mt-1">
                {user?.role} • {user?.tier}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="desktop-logout-action"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 bg-white/40 dark:bg-zinc-900/40 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 rounded-xl py-2.5 text-[10px] font-semibold cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>

            <button
              id="skeleton-toggle-diagnostics"
              onClick={() => {
                setIsLoadingSkeleton(true);
                setTimeout(() => setIsLoadingSkeleton(false), 2000);
                triggerSystemMessage("Skeleton Initiated", "Testing dashboard skeleton visual states.", "INFO");
              }}
              className="flex items-center justify-center gap-1.5 bg-white/40 dark:bg-zinc-900/40 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl py-2.5 text-[10px] font-semibold cursor-pointer transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Skeleton</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE HEADER BAR */}
      <div id="mobile-workspace" className="flex flex-col flex-1 min-w-0 max-w-full">
        <header
          id="mobile-header"
          className="lg:hidden h-14 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl border-b border-zinc-200/50 dark:border-zinc-800/50 px-4 flex items-center justify-between shrink-0 relative z-30"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 text-zinc-800 dark:text-zinc-200 rounded-lg flex items-center justify-center backdrop-blur-md">
              <Terminal className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-sm font-bold tracking-widest text-zinc-900 dark:text-zinc-50 font-display uppercase">
              NEXUS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="mobile-notif-shortcut"
              onClick={() => setActiveScreen(ActiveScreen.NOTIFICATIONS)}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-900/50 rounded-lg relative cursor-pointer transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              )}
            </button>

            <button
              id="toggle-mobile-sidebar"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 bg-white/60 dark:bg-zinc-900/60 shadow-sm text-zinc-700 dark:text-zinc-300 rounded-lg border border-white/50 dark:border-white/10 cursor-pointer backdrop-blur-md hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* MOBILE SIDEBAR PANEL (DRAWER GRID) */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              id="mobile-nav-overlay"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 w-72 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] border-r border-white/20 dark:border-white/5 z-40 p-5 flex flex-col justify-between lg:hidden"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-5 border-b border-white/20 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4.5 h-4.5 text-indigo-500" />
                    <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest font-display">
                      NEXUS
                    </span>
                  </div>
                  <button
                    id="close-mobile-nav"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 px-1.5 bg-black/5 dark:bg-white/5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {NAV_ITEMS.map((item) => (
                    <button
                      id={`nav-link-mobile-${item.id.toLowerCase()}`}
                      key={item.id}
                      onClick={() => {
                        setActiveScreen(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-sans font-semibold transition-colors cursor-pointer shadow-sm ${
                        activeScreen === item.id
                          ? "bg-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500/50"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-800/60 border border-transparent border border-white/50 dark:border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="tracking-wide">{item.label}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Bot mobile metrics */}
              <div className="border-t border-white/20 dark:border-white/5 pt-5 space-y-4">
                <div className="p-4 bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 backdrop-blur-md rounded-2xl text-xs font-sans text-zinc-500 dark:text-zinc-400">
                  <div className="font-bold text-zinc-800 dark:text-zinc-200 font-display text-sm tracking-wide">{user?.name}</div>
                  <div className="font-mono text-[10px] mt-1 tracking-widest uppercase">{user?.role} • {user?.tier}</div>
                </div>
                <button
                  id="mobile-logout-action"
                  onClick={() => {
                    handleLogout();
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl py-3 text-xs font-bold font-sans cursor-pointer transition-colors shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. CENTRAL MAIN HUB SCROLLABLE INNER WORKSPACE */}
        <main
          id="main-workspace-scroller"
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-h-[calc(100vh-3.5rem)] lg:max-h-screen relative z-10"
        >
          {/* Active component renderer */}
          {renderWorkspaceScreen()}
        </main>
      </div>

      {/* 4. FLOATING HUD TOAST FEED MODULES */}
      <div id="saas-hud-toasts" className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.category === "SUCCESS";
            const isCritical = toast.category === "CRITICAL";
            const isWarning = toast.category === "WARNING";
            return (
              <motion.div
                id={`floating-toast-${toast.id}`}
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-4 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-2xl pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${
                  isSuccess
                    ? "bg-white/80 dark:bg-zinc-900/80 border-emerald-500/20 text-zinc-900 dark:text-zinc-50"
                    : isCritical
                    ? "bg-rose-50 dark:bg-rose-950/80 border-rose-500/35 text-zinc-900 dark:text-zinc-50 animate-bounce"
                    : isWarning
                    ? "bg-amber-50 dark:bg-amber-950/80 border-amber-500/30 text-zinc-900 dark:text-zinc-50"
                    : "bg-white/80 dark:bg-zinc-900/80 border-white/20 dark:border-white/10 text-zinc-900 dark:text-zinc-50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 shadow-sm ${
                  isSuccess
                    ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    : isCritical
                    ? "bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                    : isWarning
                    ? "bg-amber-500"
                    : "bg-indigo-500"
                }`}></span>
                <div>
                  <h4 className="text-[13px] font-bold font-sans tracking-tight leading-snug">
                    {toast.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed font-medium">
                    {toast.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 5. STRIPE CHECKOUT MODAL */}
      <StripeCheckoutModal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        currentTier={user!.tier}
        onUpgradeSuccess={handleStripeUpgradeSuccess}
      />

      {/* 6. FLOATING NEXUS AI ASSISTANT WIDGET */}
      <div id="nexus-ai-widget" className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 flex flex-col items-start gap-4">
        <AnimatePresence>
          {isAIOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`bg-white/60 dark:bg-zinc-950/60 border border-white/50 dark:border-white/10 shadow-2xl shadow-black/10 rounded-3xl flex relative overflow-hidden backdrop-blur-3xl lg:ml-64 origin-bottom-left transition-all duration-300 ${isAISidebarOpen ? 'w-[calc(100vw-2rem)] sm:w-[480px]' : 'w-[calc(100vw-2rem)] sm:w-[360px]'} h-[65vh] max-h-[500px] min-h-[250px] sm:min-h-[350px]`}
            >
              {/* Sidebar */}
              {isAISidebarOpen && (
                <div className="absolute inset-y-0 left-0 z-20 w-3/4 max-w-[240px] sm:w-48 sm:relative shrink-0 border-r border-white/20 dark:border-white/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl flex flex-col shadow-2xl sm:shadow-none transition-transform">
                  {/* Sidebar Header */}
                  <div className="bg-black/5 dark:bg-white/5 px-4 py-3 flex justify-between items-center shrink-0 h-14">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">Chat History</span>
                    <button onClick={createNewAISession} className="text-indigo-500 hover:text-indigo-600 bg-white/50 dark:bg-zinc-800/50 cursor-pointer p-1.5 rounded-lg shadow-sm transition-all hover:scale-105">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Sessions List */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {aiSessions.map(session => (
                      <button
                         key={session.id}
                         onClick={() => {
                           setActiveSessionId(session.id);
                           if (window.innerWidth < 640) setIsAISidebarOpen(false); // auto-close on mobile
                         }}
                         className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all shadow-sm ${
                           session.id === activeSessionId 
                             ? "bg-indigo-500 text-white font-bold" 
                             : "text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 font-medium border border-transparent border border-white/50 dark:border-white/5"
                         }`}
                         title={session.title}
                       >
                         <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                         <span className="truncate">{session.title}</span>
                       </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Chat Column */}
              <div className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-zinc-950/40">
                {/* Header */}
                <div className="bg-indigo-500 px-4 py-3 flex justify-between items-center shrink-0 shadow-[0_4px_20px_rgba(99,102,241,0.2)] h-14 z-10">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsAISidebarOpen(!isAISidebarOpen)}
                      className={`cursor-pointer transition-colors p-1.5 rounded-lg bg-black/10 hover:bg-black/20 ${isAISidebarOpen ? 'text-white' : 'text-indigo-100 hover:text-white'}`}
                      title="Toggle History"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-indigo-400/50 mx-0.5"></div>
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                    <span className="text-sm font-bold font-display text-white tracking-widest uppercase">Nexus AI</span>
                  </div>
                  <button onClick={() => setIsAIOpen(false)} className="text-indigo-100 hover:text-white cursor-pointer ml-auto bg-black/10 hover:bg-black/20 p-1.5 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 relative scrollbar-hide">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex text-[13px] ${msg.role === "USER" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed ${
                        msg.role === "USER" 
                          ? "bg-indigo-100 text-indigo-900 border border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-100 dark:border-indigo-800/40 rounded-tr-sm" 
                          : "bg-white/80 dark:bg-zinc-900/80 border border-white/50 dark:border-white/10 text-zinc-800 dark:text-zinc-200 rounded-tl-sm backdrop-blur-md"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAIThinking && (
                    <div className="flex justify-start">
                      <div className="bg-white/80 dark:bg-zinc-900/80 border border-white/50 dark:border-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 h-10">
                         <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                         <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                         <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input Area */}
                <div className="p-3 bg-white/60 dark:bg-zinc-900/60 border-t border-white/20 dark:border-white/5 shrink-0 backdrop-blur-xl">
                  <form onSubmit={handleAISubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask Nexus AI..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-inner rounded-xl px-4 py-2.5 text-[13px] text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow font-sans placeholder-zinc-400"
                    />
                    <button 
                      type="submit"
                      disabled={!aiInput.trim() || isAIThinking}
                      className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white p-3 rounded-xl transition-all cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.4)] disabled:shadow-none hover:scale-105 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating 3D Orb Trigger */}
        <div 
          className="relative w-16 h-16 sm:w-20 sm:h-20 cursor-pointer ml-2 lg:ml-64 hover:scale-110 transition-transform duration-300"
          onClick={() => setIsAIOpen(!isAIOpen)}
        >
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <ThreeDOrb className="w-full h-full drop-shadow-2xl" isThinking={isAIThinking} />
          {!isAIOpen && (
            <div className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-[0_4px_12px_rgba(99,102,241,0.5)] animate-pulse">
              AI
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
