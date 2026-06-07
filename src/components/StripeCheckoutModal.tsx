/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, CreditCard, ShieldCheck, Check, Sparkles, Loader2 } from "lucide-react";
import { SubscriptionTier } from "../types";

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  onUpgradeSuccess: (newTier: SubscriptionTier) => void;
}

const PLANS = [
  {
    tier: SubscriptionTier.FREE,
    name: "Free Sandbox",
    price: "$0",
    period: "forever",
    description: "Basic client queries with limited tickers and no API gateway integration.",
    features: [
      "Access limited Stocks and Cryptos",
      "Manual data refreshes (1 min cache)",
      "Standard notification logs only",
      "No custom API Key generation",
    ],
  },
  {
    tier: SubscriptionTier.STANDARD,
    name: "Standard Developer",
    price: "$29",
    period: "month",
    description: "Great for individual traders and developers looking for custom API access.",
    features: [
      "Real-time Stock & Crypto Tickers",
      "1 active custom API Connection",
      "Standard latency gateway endpoints",
      "Email alerts for critical errors",
      "10 automated CSV reports / month",
    ],
  },
  {
    tier: SubscriptionTier.PRO,
    name: "Professional Alpha",
    price: "$149",
    period: "month",
    description: "Advanced dashboards with real-time telemetries, optimized endpoints, and custom reports.",
    features: [
      "All features in Standard tier",
      "Unlimited active API connections",
      "Access to premium low-latency router",
      "Automated PDF and JSON exports",
      "Unlimited daily reports scheduler",
      "Priority Discord/Slack tech support",
    ],
    popular: true,
  },
  {
    tier: SubscriptionTier.ENTERPRISE,
    name: "Nexus Enterprise",
    price: "$999",
    period: "month",
    description: "Ultimate platform capacity for trading firms and investment institutions needing dedicated channels.",
    features: [
      "Full API throughput (No throttling)",
      "Role-Based Access Controls (RBAC)",
      "Dedicated database shard node",
      "Simultaneous multi-session logins",
      "Custom Stripe billing schedules",
      "24/7 dedicated solutions manager",
    ],
  },
];

export default function StripeCheckoutModal({
  isOpen,
  onClose,
  currentTier,
  onUpgradeSuccess,
}: StripeCheckoutModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(
    currentTier === SubscriptionTier.ENTERPRISE ? SubscriptionTier.PRO : currentTier
  );
  const [checkoutStep, setCheckoutStep] = useState<"SELECT" | "PAY" | "PROCESSING" | "SUCCESS">("SELECT");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("***");
  const [cardName, setCardName] = useState("Alex Mercer");

  if (!isOpen) return null;

  const currentPlanDetails = PLANS.find((p) => p.tier === selectedPlan) || PLANS[1];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("PROCESSING");
    setTimeout(() => {
      setCheckoutStep("SUCCESS");
    }, 2200);
  };

  const handleCompleteUpgrade = () => {
    onUpgradeSuccess(selectedPlan);
    setCheckoutStep("SELECT");
    onClose();
  };

  return (
    <div id="stripe-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        id="stripe-modal-container"
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 shadow-sm border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toggle Close */}
        <button
          id="close-stripe-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 transition-colors p-2 hover:bg-slate-50 dark:bg-slate-900/50 rounded-full z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {checkoutStep === "SUCCESS" ? (
          <div id="stripe-success-step" className="w-full p-12 text-center flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 font-sans tracking-tight mb-2">
              Payment Secured. Upgrade Complete!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md font-sans text-sm">
              Your billing schedule has been updated via Stripe. Your subscription has been promoted to{" "}
              <span className="text-emerald-600 font-bold tracking-wide">{currentPlanDetails.name}</span>.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-4 mb-8 text-left w-full max-w-sm font-mono text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-300 dark:border-slate-600 mb-2">
                <span>Transaction Reference</span>
                <span className="text-slate-800 dark:text-slate-200">ch_stripe_3M9aB1</span>
              </div>
              <div className="flex justify-between py-1 mb-1">
                <span>Account Tier</span>
                <span className="text-emerald-600 font-semibold">{currentPlanDetails.tier}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Charged Amount</span>
                <span className="text-slate-900 dark:text-slate-50 font-semibold">{currentPlanDetails.price}/mo</span>
              </div>
            </div>
            <button
              id="confirm-upgrade-btn"
              onClick={handleCompleteUpgrade}
              className="bg-emerald-500 hover:bg-emerald-600 active:transform active:scale-95 text-slate-900 dark:text-slate-50 font-medium px-6 py-2.5 rounded-lg font-sans text-sm tracking-tight transition-all shadow-md shadow-emerald-500/20"
            >
              Access Promoted Features
            </button>
          </div>
        ) : (
          <>
            {/* LEFT AREA: Choose Tiers */}
            <div id="stripe-left" className="w-full md:w-3/5 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-300 dark:border-slate-600 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-slate-200/80 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest font-mono">
                    Stripe Checkout Suite
                  </span>
                  <span className="bg-emerald-500/10 border border-emerald-200/20 text-emerald-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest font-mono">
                    Live Demo sandbox
                  </span>
                </div>
                <h3 className="text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-slate-50 mb-1">
                  Adjust Subscription Capacity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-6">
                  Select a subscription plan that suits your portfolio volume. Payments are simulated instantly.
                </p>

                {checkoutStep === "SELECT" ? (
                  <div id="plans-selection" className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {PLANS.map((plan) => {
                      const isSelected = selectedPlan === plan.tier;
                      const isCurrent = currentTier === plan.tier;
                      return (
                        <div
                          id={`plan-card-${plan.tier.toLowerCase()}`}
                          key={plan.tier}
                          onClick={() => {
                            if (!isCurrent) setSelectedPlan(plan.tier);
                          }}
                          className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                            isCurrent
                              ? "border-emerald-200/40 bg-emerald-500/[0.02]"
                              : isSelected
                              ? "border-indigo-600 bg-slate-50 dark:bg-slate-900/50 shadow-lg shadow-slate-300/80"
                              : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:bg-slate-900/50"
                          }`}
                        >
                          {plan.popular && (
                            <span className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-orange-600 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono">
                              <Sparkles className="w-2.5 h-2.5" /> Popular
                            </span>
                          )}
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{plan.name}</div>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{plan.price}</span>
                            <span className="text-[10px] text-slate-400">/{plan.period}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-sans leading-relaxed">
                            {plan.description}
                          </p>
                          {isCurrent && (
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-200/20 px-1.5 py-0.5 rounded font-mono">
                              <Check className="w-2.5 h-2.5" /> Selected
                            </span>
                          )}
                          {!isCurrent && isSelected && (
                            <span className="mt-3 inline-flex items-center gap-1 text-[9px] text-slate-900 dark:text-slate-50 font-bold bg-slate-200 border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 rounded font-mono">
                              Ready To Upgrade
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div id="stripe-plan-summary" className="bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-5">
                    <button
                      id="change-plan-btn"
                      onClick={() => setCheckoutStep("SELECT")}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 underline mb-3 float-right font-sans"
                    >
                      Change Plan
                    </button>
                    <div className="clear-both"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-slate-400 text-xs font-mono">UPGRADING TO</div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-50">{currentPlanDetails.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-50">{currentPlanDetails.price}</div>
                        <div className="text-[10px] text-slate-400">per month</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans border-t border-slate-300 dark:border-slate-600/80 pt-2">
                      {currentPlanDetails.description}
                    </p>
                    <ul className="mt-4 space-y-1.5">
                      {currentPlanDetails.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-sans">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {checkoutStep === "SELECT" && (
                <div id="stripe-left-next-step" className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-400 flex items-center gap-1 font-sans">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" /> Secure checkout verified by Stripe API
                  </div>
                  <button
                    id="goto-payment-btn"
                    disabled={selectedPlan === currentTier}
                    onClick={() => setCheckoutStep("PAY")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded font-sans text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Proceed to Payment ({currentPlanDetails.price})
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT AREA: Card Payment Details */}
            <div id="stripe-right" className="w-full md:w-2/5 bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold font-sans text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Payment Details
                </h4>

                {checkoutStep === "PROCESSING" ? (
                  <div id="checkout-processing" className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                    <h5 className="text-slate-800 dark:text-slate-200 font-sans font-medium text-sm">Processing Stripe Intent...</h5>
                    <p className="text-slate-400 font-sans text-xs mt-1">Calling secure payment proxy node.</p>
                  </div>
                ) : (
                  <form onSubmit={handlePay} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                        Card Holder Name
                      </label>
                      <input
                        id="card-name"
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 shadow-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-xs font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          id="card-number"
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 shadow-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 transition-colors pl-8"
                        />
                        <CreditCard className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                          Expires (MM/YY)
                        </label>
                        <input
                          id="card-expiry"
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 shadow-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 transition-colors"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                          CVC
                        </label>
                        <input
                          id="card-cvc"
                          type="password"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 shadow-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 transition-colors"
                          maxLength={3}
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-300 dark:border-slate-600/80 my-4 pt-4">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 py-1 font-sans">
                        <span>Subscription Cost</span>
                        <span>{currentPlanDetails.price}/mo</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 py-1 font-sans">
                        <span>Local Sandbox Taxes</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-900 dark:text-slate-50 font-semibold py-1 mt-1 border-t border-slate-200 dark:border-slate-700 font-sans">
                        <span>Total Due Today</span>
                        <span>{checkoutStep === "SELECT" ? "$0" : currentPlanDetails.price}</span>
                      </div>
                    </div>

                    <button
                      id="stripe-checkout-pay-now"
                      type="submit"
                      disabled={checkoutStep === "SELECT"}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded text-xs font-sans tracking-wide transition-colors uppercase disabled:opacity-45 disabled:cursor-not-allowed text-center"
                    >
                      Authenticate and Process Payment
                    </button>
                  </form>
                )}
              </div>

              <div id="stripe-security-badge" className="text-[10px] text-slate-400 font-mono mt-6 border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
                <span>SSL Encrypted SHA-256</span>
                <span>PCI-DSS COMPLIANT</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
