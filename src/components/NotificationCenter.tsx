/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { NotificationItem } from "../types";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Search, Trash2, CheckCircle } from "lucide-react";

interface NotificationCenterProps {
  notifications: NotificationItem[];
  dispatchNotificationAction: (action: "READ" | "DELETE" | "READ_ALL" | "CLEAR_ALL", id?: string) => void;
}

export default function NotificationCenter({
  notifications,
  dispatchNotificationAction,
}: NotificationCenterProps) {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "SUCCESS" | "INFO">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotifications = notifications.filter((notif) => {
    const matchesFilter = activeFilter === "ALL" || notif.category === activeFilter;
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "CRITICAL":
        return {
          border: "border-rose-950 bg-rose-500/[0.02]",
          glow: "bg-rose-500/10 border-rose-500/30 text-red-600",
          text: "text-red-600",
          icon: <AlertCircle className="w-5 h-5" />,
        };
      case "WARNING":
        return {
          border: "border-amber-950 bg-amber-500/[0.01]",
          glow: "bg-amber-500/10 border-amber-500/20 text-orange-600",
          text: "text-orange-600",
          icon: <AlertTriangle className="w-5 h-5" />,
        };
      case "SUCCESS":
        return {
          border: "border-emerald-950 bg-emerald-500/[0.01]",
          glow: "bg-emerald-500/10 border-emerald-200/20 text-emerald-600",
          text: "text-emerald-600",
          icon: <CheckCircle2 className="w-5 h-5" />,
        };
      default:
        return {
          border: "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50",
          glow: "bg-sky-500/10 border-sky-500/20 text-sky-400",
          text: "text-sky-450",
          icon: <Info className="w-5 h-5" />,
        };
    }
  };

  return (
    <div id="notifications-screen" className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-slate-50 tracking-tight">Notification Center</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time audit alerts, web socket heartbeats, security anomalies and billing webhooks.
          </p>
        </div>
        <div id="bulk-operations-controls" className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="mark-all-read-btn"
            onClick={() => dispatchNotificationAction("READ_ALL")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs px-3.5 py-2 rounded border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
          <button
            id="clear-all-notif-btn"
            onClick={() => dispatchNotificationAction("CLEAR_ALL")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-rose-800 text-rose-300 font-medium text-xs px-3.5 py-2 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear all logs</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Category Filters */}
        <div id="notif-category-filter" className="md:col-span-8 flex flex-wrap gap-1.5">
          {["ALL", "CRITICAL", "WARNING", "SUCCESS", "INFO"].map((type) => {
            const isSelected = activeFilter === type;
            const count = type === "ALL" 
              ? notifications.length 
              : notifications.filter((n) => n.category === type).length;

            return (
              <button
                id={`filter-notif-${type.toLowerCase()}`}
                key={type}
                onClick={() => setActiveFilter(type as any)}
                className={`px-3 py-1.5 rounded text-xs font-sans transition-all border flex items-center gap-2 ${
                  isSelected
                    ? "bg-indigo-600 text-white border-zinc-200 font-semibold"
                    : "bg-white dark:bg-slate-900 shadow-sm text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 hover:text-slate-800 dark:text-slate-200"
                }`}
              >
                <span>{type}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? "bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-50" : "bg-slate-50 dark:bg-slate-900/50 text-slate-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Name Searching Box */}
        <div className="md:col-span-4 relative">
          <input
            id="search-notifications"
            type="text"
            placeholder="Search log triggers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 focus:border-slate-300 dark:border-slate-600 text-xs font-sans text-slate-800 dark:text-slate-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none"
          />
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* NOTIFICATIONS LIST CONTAINER */}
      <div id="notifications-list" className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
            <CheckCircle2 className="w-10 h-10 text-indigo-600/30 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-sans">Clear Skyline</h4>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              No telemetry alerts found matching your active filter. Everything operates normally.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const theme = getCategoryTheme(notif.category);
            return (
              <div
                id={`notification-card-${notif.id}`}
                key={notif.id}
                className={`border rounded-xl p-4 transition-all relative flex flex-col md:flex-row justify-between gap-4 ${theme.border} ${
                  !notif.isRead ? "relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:bg-emerald-500 before:rounded-r" : ""
                }`}
              >
                <div className="flex gap-3.5 items-start">
                  {/* Category Glow Tag */}
                  <div className={`p-2.5 rounded-lg border shrink-0 ${theme.glow}`}>
                    {theme.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50 font-sans leading-snug">
                        {notif.title}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-mono tracking-wider">
                        • {notif.timestamp}
                      </span>
                      {notif.systemRef && (
                        <span className="bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 text-slate-400 px-2 py-0.2 rounded text-[8px] font-mono select-all">
                          {notif.systemRef}
                        </span>
                      )}
                      {!notif.isRead && (
                        <span className="bg-emerald-500/10 border border-emerald-200/20 text-emerald-600 font-bold px-1.5 py-0.1 rounded text-[8px] font-mono">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans leading-relaxed max-w-2xl">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {!notif.isRead && (
                    <button
                      id={`mark-read-${notif.id}`}
                      onClick={() => dispatchNotificationAction("READ", notif.id)}
                      className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded px-2.5 py-1.5 transition-all text-center cursor-pointer"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    id={`delete-notif-${notif.id}`}
                    onClick={() => dispatchNotificationAction("DELETE", notif.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-rose-900/20 rounded transitions-colors cursor-pointer"
                    title="Dismiss alert permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
