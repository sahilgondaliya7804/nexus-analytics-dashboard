/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, UserRole, SubscriptionTier } from "../types";

// Setup an elegant client simulator if Firebase is not linked yet
export interface FirebaseInterface {
  isLinked: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  onAuthStateChanged: (callback: (user: UserProfile | null) => void) => () => void;
}

const STORAGE_KEY = "saas_market_user_session";

class FirebaseAuthSimulator implements FirebaseInterface {
  public isLinked = false;
  private listeners: ((user: UserProfile | null) => void)[] = [];
  private currentUser: UserProfile | null = null;

  constructor() {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        this.currentUser = JSON.parse(cached);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  public async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes("@")) {
          return reject(new Error("Please enter a valid email address."));
        }
        if (pass.length < 5) {
          return reject(new Error("Password must be at least 5 characters."));
        }

        const fallbackName = email.split("@")[0].replace(/[._]/g, " ");
        const formattedName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

        const profile: UserProfile = {
          uid: "usr_" + Math.random().toString(36).substring(2, 9),
          email: email.toLowerCase(),
          name: email.toLowerCase() === "alex.mercer@nexus.io" ? "Alex Mercer" : formattedName,
          role: email.toLowerCase() === "alex.mercer@nexus.io" ? UserRole.ADMIN : UserRole.SUBSCRIBER,
          tier: email.toLowerCase() === "alex.mercer@nexus.io" ? SubscriptionTier.ENTERPRISE : SubscriptionTier.FREE,
          avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
          isTwoFactorEnabled: false,
        };

        this.currentUser = profile;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        this.notifyListeners();
        resolve(profile);
      }, 800);
    });
  }

  public async signUpWithEmail(email: string, pass: string, name: string): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes("@")) {
          return reject(new Error("Please enter a valid email address."));
        }
        if (pass.length < 6) {
          return reject(new Error("Password must be at least 6 characters."));
        }
        if (!name.trim()) {
          return reject(new Error("Please enter your full name."));
        }

        const profile: UserProfile = {
          uid: "usr_" + Math.random().toString(36).substring(2, 9),
          email: email.toLowerCase(),
          name: name.trim(),
          role: UserRole.SUBSCRIBER,
          tier: SubscriptionTier.FREE,
          avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
          isTwoFactorEnabled: false,
        };

        this.currentUser = profile;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        this.notifyListeners();
        resolve(profile);
      }, 900);
    });
  }

  public async signOut(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        localStorage.removeItem(STORAGE_KEY);
        this.notifyListeners();
        resolve();
      }, 400);
    });
  }

  public onAuthStateChanged(callback: (user: UserProfile | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((li) => li !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((li) => li(this.currentUser));
  }
}

export const firebaseAuth = new FirebaseAuthSimulator();
