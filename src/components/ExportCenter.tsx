/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ScheduledExportTask, ExportHistoryItem, UserRole } from "../types";
import { Download, Calendar, History, ShieldAlert, CheckCircle, Clock, Trash, FileText, Plus, Hourglass } from "lucide-react";

interface ExportCenterProps {
  scheduledTasks: ScheduledExportTask[];
  exportHistory: ExportHistoryItem[];
  userRole: UserRole;
  onModifyTasks: (action: "CREATE" | "TOGGLE" | "DELETE", id?: string, nextObj?: any) => void;
  triggerSystemAction: (category: string, details: string) => void;
  triggerSystemMessage: (title: string, msg: string, cat: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL") => void;
}

export default function ExportCenter({
  scheduledTasks,
  exportHistory,
  userRole,
  onModifyTasks,
  triggerSystemAction,
  triggerSystemMessage,
}: ExportCenterProps) {
  const [templateSelection, setTemplateSelection] = useState<string>("PORTFOLIO");
  const [formatSelection, setFormatSelection] = useState<"CSV" | "JSON" | "PDF">("PDF");
  const [scheduledFrequency, setScheduledFrequency] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [scheduledName, setScheduledName] = useState("");
  const [isExportingNow, setIsExportingNow] = useState(false);

  // RBAC checks - Editors and Admins can build reports, Readers can read only.
  const canModifyReports = userRole === UserRole.ADMIN || userRole === UserRole.EDITOR;

  const handleTriggerExport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifyReports) {
      triggerSystemMessage(
        "Access Restriction",
        "Your account role (SUBSCRIBER) prevents you from compiling export reports. Editors/Admins are authorized.",
        "WARNING"
      );
      triggerSystemAction("SYSTEM", "Failed report compilation attempt due to Subscriber RBAC restrictions.");
      return;
    }

    setIsExportingNow(true);
    triggerSystemMessage("Export Compiling", "Downstream database nodes are rendering report schemas. Hold tight...", "INFO");

    setTimeout(() => {
      setIsExportingNow(false);

      const mockNewItem: ExportHistoryItem = {
        id: "ex-" + Math.floor(Math.random() * 1000),
        fileName: `${templateSelection.toLowerCase()}_report_render_fit_${Math.floor(Math.random() * 900) + 100}.${formatSelection.toLowerCase()}`,
        format: formatSelection,
        size: "1.4 MB",
        runTime: "Active Now",
        status: "COMPLETED",
        progressPercent: 100,
        recipientEmail: "developer@nexus.cap",
      };

      onModifyTasks("CREATE", undefined, mockNewItem);
      triggerSystemMessage("Compile Succeeded", `Successfully exported report to developer@nexus.cap. Size: ${mockNewItem.size}.`, "SUCCESS");
      triggerSystemAction("EXPORT", `Triggered quick report compile matching model ${templateSelection}.`);
    }, 2000);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifyReports) {
      triggerSystemMessage("Access Denied", "Scheduler modifications require EDIT credentials.", "CRITICAL");
      return;
    }

    if (!scheduledName.trim()) {
      triggerSystemMessage("Form Error", "Please provide a name descriptor for your scheduled sync job.", "WARNING");
      return;
    }

    const mockScheduled: ScheduledExportTask = {
      id: "st-" + Math.floor(Math.random() * 1000),
      name: scheduledName.trim(),
      frequency: scheduledFrequency,
      format: formatSelection,
      nextRun: `${scheduledFrequency === "Daily" ? "Tomorrow" : "Next run cycle"}, 00:00 UTC`,
      status: "ACTIVE",
    };

    onModifyTasks("TOGGLE", undefined, mockScheduled);
    setScheduledName("");
    triggerSystemMessage("Cron Task Added", `Successfully registered custom ${scheduledFrequency} scheduled job in system cron.`, "SUCCESS");
    triggerSystemAction("EXPORT", `Registered scheduled export job: ${mockScheduled.name}.`);
  };

  return (
    <div id="export-center-screen" className="space-y-6">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-slate-50 tracking-tight">Reports & Analytical Compilers</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Compile transactional statements, ledger audits, and API telemetries into localized PDF, CSV, or JSON assets.
          </p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 p-1 rounded-lg gap-2 shrink-0">
          <div className="text-xs uppercase font-mono font-bold text-slate-400 px-2 py-0.5 rounded">
            ROLE CLEARANCE: <span className="text-slate-900 dark:text-slate-50">{userRole}</span>
          </div>
        </div>
      </div>

      {/* THREE SECTION WORKBENCH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COMPILER CONFIGURATION OPTIONS (8 COLS) */}
        <div id="compiler-workbench" className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 backdrop-blur-sm">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" /> Analytical Template Compiler
            </h4>

            <form onSubmit={handleTriggerExport} className="space-y-4">
              {/* Template Selectors cards layout */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-2">
                  1. Choose Target Source Information
                </label>
                <div id="template-card-row" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "PORTFOLIO", label: "Portfolio allocation breakdown", desc: "Detailed metric sets mapping sectors, stocks, price charts." },
                    { id: "TELEMETRY", label: "API Gateway telemetries logs", desc: "Downstream endpoint latencies, errors, call metrics count." },
                    { id: "AUDITS", label: "Full ledger session audits", desc: "Chronological security changes, user roles, billing." },
                  ].map((temp) => (
                    <div
                      id={`template-box-${temp.id.toLowerCase()}`}
                      key={temp.id}
                      onClick={() => setTemplateSelection(temp.id)}
                      className={`p-3.5 border rounded-lg cursor-pointer transition-all ${
                        templateSelection === temp.id
                          ? "bg-slate-50 dark:bg-slate-900/50 border-zinc-500 text-slate-900 dark:text-slate-50"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <div className="text-xs font-bold">{temp.label}</div>
                      <p className="text-[10px] text-slate-400 mt-1 font-sans">{temp.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-2">
                    2. Encapsulation File Format
                  </label>
                  <div className="flex bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 p-1 rounded-lg">
                    {["PDF", "CSV", "JSON"].map((format) => (
                      <button
                        id={`comp-format-${format.toLowerCase()}`}
                        key={format}
                        type="button"
                        onClick={() => setFormatSelection(format as any)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer transition-colors ${
                          formatSelection === format
                            ? "bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200"
                            : "text-slate-400 hover:text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-2">
                    3. Compile Destination Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value="developer@nexus.cap"
                    className="w-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded font-mono text-xs text-slate-400 px-3 py-2 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {canModifyReports ? "✔ COMPILE SESSION READY" : "⚠ READ-ONLY LICENSE LIMIT"}
                </span>
                <button
                  id="trigger-compile-btn"
                  type="submit"
                  disabled={isExportingNow}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded text-xs uppercase tracking-wide transition-all cursor-pointer shadow-md shadow-zinc-950/25 flex items-center gap-1.5"
                >
                  {isExportingNow ? (
                    <>
                      <Hourglass className="w-3.5 h-3.5 animate-spin" />
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Request compile & delivery</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Export compile history lists */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-600" /> Export Compilation History
            </h4>
            <div id="export-history-table" className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    <th className="py-2.5 pb-2">File Manifest Name</th>
                    <th className="py-2.5 pb-2">Size</th>
                    <th className="py-2.5 pb-2">Compiled</th>
                    <th className="py-2.5 pb-2">Status</th>
                    <th className="py-2.5 pb-2 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/30 text-xs font-sans text-slate-700 dark:text-slate-300">
                  {exportHistory.map((item) => (
                    <tr id={`history-row-${item.id}`} key={item.id} className="hover:bg-slate-50 dark:bg-slate-900/50">
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <span className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-mono shrink-0">
                          {item.format}
                        </span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">{item.fileName}</span>
                      </td>
                      <td className="py-3 font-mono text-slate-500 dark:text-slate-400">{item.size}</td>
                      <td className="py-3 font-mono text-slate-500 dark:text-slate-400">{item.runTime}</td>
                      <td className="py-3 font-sans">
                        {item.status === "COMPLETED" && (
                          <span className="text-[10px] text-emerald-600 text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-200/20 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" /> Ready
                          </span>
                        )}
                        {item.status === "RUNNING" && (
                          <div className="space-y-1.5 max-w-[80px]">
                            <span className="text-[10px] text-amber-450 text-orange-600 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded inline-flex items-center gap-1 animate-pulse">
                              <Clock className="w-2.5 h-2.5 animate-spin" /> {item.progressPercent}%
                            </span>
                            <div className="w-full bg-slate-50 dark:bg-slate-900/50 h-1 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                              <div style={{ width: `${item.progressPercent}%` }} className="bg-amber-500 h-full"></div>
                            </div>
                          </div>
                        )}
                        {item.status === "FAILED" && (
                          <span className="text-[10px] text-red-600 text-red-600 font-bold bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            <ShieldAlert className="w-2.5 h-2.5" /> Blocked
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          id={`download-zip-${item.id}`}
                          disabled={item.status !== "COMPLETED"}
                          onClick={() => triggerSystemMessage("Download Activated", `Downloading compiled object: ${item.fileName}`, "SUCCESS")}
                          className="text-[10px] bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 px-2.2 py-1 rounded transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AUTOMATED CRON SCHEDULER WIDGETS (4 COLS) */}
        <div id="scheduler-workbench" className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> System Scheduler Cron
            </h4>
            <p className="text-[10px] text-slate-400 font-sans mb-4 leading-relaxed">
              Provision recurrent automated transfers directly in Nexus scheduler threads. Reports deliver seamlessly on intervals.
            </p>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-[9px] text-slate-400 uppercase font-mono mb-1">Job Name Descriptor</label>
                <input
                  id="schedule-name-input"
                  type="text"
                  placeholder="e.g., Weekly portfolio check"
                  value={scheduledName}
                  onChange={(e) => setScheduledName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded font-sans text-xs text-slate-600 dark:text-slate-400 px-3 py-2 focus:outline-none focus:border-slate-300 dark:border-slate-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 uppercase font-mono mb-1">Frequency Period</label>
                <select
                  id="schedule-freq-select"
                  value={scheduledFrequency}
                  onChange={(e) => setScheduledFrequency(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded px-2 py-2 text-xs font-sans text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="Daily">Everyday at 00:00 UTC</option>
                  <option value="Weekly">Every Sunday at 00:00 UTC</option>
                  <option value="Monthly">1st of months at 00:00 UTC</option>
                </select>
              </div>

              <button
                id="schedule-task-submit"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded text-[10px] uppercase font-sans tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Initialize Scheduler Job</span>
              </button>
            </form>
          </div>

          {/* Scheduled Active Jobs list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-4 block">
              Active Cron Registry
            </h4>

            <div id="scheduler-task-list" className="space-y-3.5">
              {scheduledTasks.map((task) => (
                <div id={`scheduler-task-item-${task.id}`} key={task.id} className="border-b border-slate-200 dark:border-slate-700 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans leading-tight">{task.name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        Thread frequency: {task.frequency} ({task.format})
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                        In-transit queue: {task.nextRun}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {task.status === "ACTIVE" ? (
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-200/20 font-bold px-1.5 py-0.2 rounded font-mono">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded font-mono">
                          PAUSED
                        </span>
                      )}
                      
                      <button
                        id={`delete-schedule-job-${task.id}`}
                        onClick={() => {
                          if (!canModifyReports) {
                            triggerSystemMessage("Restricted", "Subscriber privilege cannot delete cron processes.", "WARNING");
                            return;
                          }
                          onModifyTasks("DELETE", task.id);
                          triggerSystemMessage("Cron Task Deleted", "Removed scheduled report compiling task.", "SUCCESS");
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-rose-950/15 rounded cursor-pointer transition-colors"
                        title="Delete cron"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
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
