/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SubscriptionTier {
  FREE = "FREE",
  STANDARD = "STANDARD",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export enum UserRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  SUBSCRIBER = "SUBSCRIBER",
}

export enum ActiveScreen {
  DASHBOARD = "DASHBOARD",
  EQUITIES = "EQUITIES",
  CRYPTO = "CRYPTO",
  WEATHER = "WEATHER",
  API_GATEWAY = "API_GATEWAY",
  NOTIFICATIONS = "NOTIFICATIONS",
  REPORTS = "REPORTS",
  SETTINGS = "SETTINGS",
  MAINTENANCE = "MAINTENANCE",
  LOADING = "LOADING",
  LOGIN = "LOGIN",
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  tier: SubscriptionTier;
  avatarUrl?: string;
  isTwoFactorEnabled?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  userTier: SubscriptionTier;
  action: string;
  category: "AUTHENTICATION" | "API" | "PORTFOLIO" | "EXPORT" | "SYSTEM" | "BILLING";
  ipAddress: string;
  status: "SUCCESS" | "WARNING" | "FAIL";
  details: string;
}

export interface StockTicker {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  changeValue: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  high: number;
  low: number;
  history24h: number[];
  sector: "Technology" | "Finance" | "Energy" | "Healthcare" | "Consumer";
}

export interface CryptoTicker {
  symbol: string;
  name: string;
  price: number;
  changePercent24h: number;
  dominance: number; // e.g. percentage of market cap
  volume24h: string;
  marketCap: string;
  sentiment: "BULLISH" | "NEUTRAL" | "BEARISH";
  history7d: number[];
  high24h: number;
  low24h: number;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  avgLatencyMs: number;
  errorRatePercent: number;
  totalRequestsCount: number;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  billingTier: SubscriptionTier;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "CRITICAL" | "WARNING" | "SUCCESS" | "INFO";
  timestamp: string;
  isRead: boolean;
  systemRef?: string;
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface ScheduledExportTask {
  id: string;
  name: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  format: "CSV" | "JSON" | "PDF";
  nextRun: string;
  status: "ACTIVE" | "PAUSED";
}

export interface ExportHistoryItem {
  id: string;
  fileName: string;
  format: "CSV" | "JSON" | "PDF";
  size: string;
  runTime: string;
  status: "COMPLETED" | "RUNNING" | "FAILED";
  progressPercent: number;
  recipientEmail: string;
}
