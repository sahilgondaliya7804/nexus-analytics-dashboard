/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CryptoTicker } from "../types";
import { Coins, Flame, Star, Percent, RefreshCw, BarChart2, CornerDownRight, ShieldCheck } from "lucide-react";
import TiltCard from "./TiltCard";

interface CryptoMarketsProps {
  cryptos: CryptoTicker[];
  watchlistCryptoSyms: string[];
  toggleCryptoWatchlist: (symbol: string) => void;
  triggerSystemAction: (category: string, details: string) => void;
  triggerSystemMessage: (title: string, msg: string, cat: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL") => void;
}

export default function CryptoMarkets({
  cryptos,
  watchlistCryptoSyms,
  toggleCryptoWatchlist,
  triggerSystemAction,
  triggerSystemMessage,
}: CryptoMarketsProps) {
  const [selectedCryptoSym, setSelectedCryptoSym] = useState<string>("BTC");
  const [sentimentFilter, setSentimentFilter] = useState<"ALL" | "BULLISH" | "NEUTRAL" | "BEARISH">("ALL");

  const selectedCrypto = cryptos.find((c) => c.symbol === selectedCryptoSym) || cryptos[0];

  const filteredSentimentCryptos = cryptos.filter((c) => {
    if (sentimentFilter === "ALL") return true;
    return c.sentiment === sentimentFilter;
  });

  const getSentimentGlow = (sentiment: string) => {
    switch (sentiment) {
      case "BULLISH":
        return {
          bg: "bg-emerald-500/10 hover:bg-emerald-500/15",
          border: "border-emerald-200/30 hover:border-emerald-200/50",
          text: "text-emerald-600",
          badge: "bg-emerald-50 text-emerald-600 border-emerald-800/30",
        };
      case "BEARISH":
        return {
          bg: "bg-rose-500/10 hover:bg-rose-500/15",
          border: "border-rose-500/30 hover:border-rose-500/50",
          text: "text-red-600",
          badge: "bg-red-100 text-red-600 border-rose-800/30",
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:bg-slate-900/50",
          border: "border-slate-300 dark:border-slate-600 hover:border-slate-300 dark:border-slate-600",
          text: "text-slate-500 dark:text-slate-400",
          badge: "bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
        };
    }
  };

  const handleSelectCrypto = (sym: string) => {
    setSelectedCryptoSym(sym);
    triggerSystemAction("PORTFOLIO", `Selected crypto market asset ${sym} for analysis.`);
  };

  const MOCK_TRANSACTIONS = [
    {
      id: "tx-c1",
      timestamp: "32 mins ago",
      type: "BUY",
      symbol: "ETH",
      amountRaw: "12.50 ETH",
      rate: "$3,420.50",
      totalCost: "$42,756.25",
      status: "SETTLED",
    },
    {
      id: "tx-c2",
      timestamp: "1 hour ago",
      type: "SWAP",
      symbol: "SOL",
      amountRaw: "250.00 SOL",
      rate: "$184.75",
      totalCost: "4.85 ETH",
      status: "SETTLED",
    },
    {
      id: "tx-c3",
      timestamp: "4 hours ago",
      type: "BUY",
      symbol: "BTC",
      amountRaw: "0.450 BTC",
      rate: "$94,250.00",
      totalCost: "$42,412.50",
      status: "SETTLED",
    },
    {
      id: "tx-c4",
      timestamp: "1 day ago",
      type: "WITHDRAW",
      symbol: "LINK",
      amountRaw: "1,500.00 LINK",
      rate: "$17.82",
      totalCost: "$26,730.00",
      status: "COMPLETED",
    },
  ];

  // Render weekly sparklines
  const renderSparkline = (history: number[], isPositive: boolean) => {
    const minVal = Math.min(...history);
    const maxVal = Math.max(...history);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const width = 120;
    const height = 30;
    const padding = 1.5;

    const pointsStr = history
      .map((val, idx) => {
        const x = padding + (idx / (history.length - 1)) * (width - padding * 2);
        const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

    const strokeColor = isPositive ? "#4f46e5" : "#f43f5e";

    return (
      <svg className="w-[120px] h-[30px] overflow-visible select-none">
        <polyline points={pointsStr} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div id="crypto-screen" className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/20 dark:border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50 tracking-tight">Decentralized Assets Ledger</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5 max-w-lg">
            Real-time decentralized ledger networks, cryptos watchlists, dominance breakdowns, and transaction settlement audits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
             <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest pl-1">
               Ledger Synchronized
             </span>
          </div>
          <button
            id="force-refresh-cryptos"
            onClick={() => {
              triggerSystemMessage("Ledger Synchronized", "Successfully validated on-chain liquidity pools and network dominance stats.", "SUCCESS");
              triggerSystemAction("PORTFOLIO", "Requested decentralized ledger tickers refresh.");
            }}
            className="p-2 bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 rounded-xl hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all cursor-pointer backdrop-blur-md"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CORE DOUBLE CARD COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        {/* LEFT AREA: CRYPTO MARKET TICKERS & SENTIMENT HEATMAP (8 COLS) */}
        <div id="crypto-market-tracker" className="lg:col-span-8 space-y-6">
          {/* Sentiment Heatmap Block */}
          <div className="bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden shadow-xl shadow-black/5">
            <div className="absolute top-[0%] left-[50%] w-[50%] h-[50%] rounded-full bg-[#f43f5e]/5 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[30%] rounded-full bg-[#10b981]/5 blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 relative z-10">
              <div>
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-indigo-500" /> Algorithmic Sentiment Heatmap
                </h4>
                <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                  Real-time network leverage metrics mapping overall coin mood boundaries.
                </p>
              </div>

              {/* Sentiment filters tabs styling */}
              <div id="sentiment-toggle-tabs" className="flex bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 p-1 rounded-xl gap-1 shrink-0">
                {["ALL", "BULLISH", "NEUTRAL", "BEARISH"].map((tab) => (
                  <button
                    id={`sentiment-tab-${tab.toLowerCase()}`}
                    key={tab}
                    onClick={() => setSentimentFilter(tab as any)}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-lg cursor-pointer transition-all ${
                      sentimentFilter === tab
                        ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Heatmap Grid Boxes */}
            <div id="heatmap-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
              {filteredSentimentCryptos.map((coin) => {
                const style = getSentimentGlow(coin.sentiment);
                const isSelected = selectedCryptoSym === coin.symbol;
                const isPositive = coin.changePercent24h >= 0;

                return (
                  <TiltCard key={coin.symbol} className="h-full">
                  <div
                    id={`heatmap-cell-${coin.symbol}`}
                    onClick={() => handleSelectCrypto(coin.symbol)}
                    className={`h-full p-4 border rounded-2xl cursor-pointer transition-all shadow-sm ${style.bg} ${style.border} ${
                      isSelected ? "ring-2 ring-indigo-500/30 scale-[1.02]" : "hover:scale-[1.02]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-sm font-bold font-display tracking-wide text-zinc-900 dark:text-zinc-50">{coin.symbol}</span>
                        <p className="text-[10px] text-zinc-400 block leading-none mt-0.5">{coin.name}</p>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest ${style.badge}`}>
                        {coin.sentiment}
                      </span>
                    </div>

                    <div className="mt-4">
                      <span className="text-lg font-mono font-bold text-zinc-800 dark:text-zinc-200 block tracking-tight">
                        ${coin.price >= 1 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : coin.price.toFixed(4)}
                      </span>
                      <span className={`text-[11px] mt-1 font-mono font-semibold leading-none flex items-center ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                        {isPositive ? "+" : ""}{coin.changePercent24h.toFixed(2)}% (24h)
                      </span>
                    </div>
                  </div>
                  </TiltCard>
                );
              })}
            </div>
          </div>

          {/* Crypto Tickers Details table */}
          <div className="bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-xl shadow-black/5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 mb-5 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-500" /> Decentralized Liquidity Pool Indices
            </h4>
            <div id="crypto-table" className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/20 dark:border-white/5 text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
                    <th className="py-3 pb-2 font-semibold">Coin Identity</th>
                    <th className="py-3 pb-2 font-semibold">Price State</th>
                    <th className="py-3 pb-2 font-semibold">Weekly Trend</th>
                    <th className="py-3 pb-2 font-semibold">24h Change</th>
                    <th className="py-3 pb-2 font-semibold text-right">Market Dom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50 text-xs font-sans text-zinc-700 dark:text-zinc-300">
                  {cryptos.map((coin) => {
                    const isSelected = selectedCryptoSym === coin.symbol;
                    const isPositive = coin.changePercent24h >= 0;
                    return (
                      <tr
                        id={`crypto-row-${coin.symbol}`}
                        key={coin.symbol}
                        onClick={() => handleSelectCrypto(coin.symbol)}
                        className={`hover:bg-white/40 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors ${isSelected ? "bg-white/60 dark:bg-zinc-900/60" : ""}`}
                      >
                        <td className="py-3.5 font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-white/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border border-white/50 dark:border-white/5 flex items-center justify-center text-[10px] uppercase font-bold font-display tracking-widest shadow-sm">
                            {coin.symbol.substring(0, 2)}
                          </span>
                          <div>
                            <span className="font-bold font-display tracking-wide text-zinc-800 dark:text-zinc-200">{coin.symbol}</span>
                            <span className="text-[10px] text-zinc-400 block mt-0.5 leading-none">{coin.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 font-mono font-bold text-zinc-800 dark:text-zinc-200 tracking-tight text-sm">
                          ${coin.price >= 1 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : coin.price.toFixed(4)}
                        </td>
                        <td className="py-3.5">{renderSparkline(coin.history7d, isPositive)}</td>
                        <td className="py-3.5">
                          <span className={`font-mono font-bold ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                            {isPositive ? "+" : ""}{coin.changePercent24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="font-mono text-zinc-900 dark:text-zinc-50 font-bold">{coin.dominance}%</span>
                          <span className="text-[9px] text-zinc-400 block mt-0.5 leading-none">Total Supply share</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: WATCHLIST & RECENT TRANSACTIONS (4 COLS) */}
        <div id="crypto-watchlist-ledger" className="lg:col-span-4 space-y-6">
          {/* Market dominance card dials */}
          <div className="bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-xl shadow-black/5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 mb-5 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-indigo-500" /> Share Dominance Index
            </h4>

            <div className="space-y-4">
              {cryptos.map((coin) => (
                <div id={`dominance-bar-${coin.symbol}`} key={coin.symbol} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-sans">
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{coin.symbol} <span className="text-zinc-400 font-normal">({coin.name})</span></span>
                    <span className="text-zinc-900 dark:text-zinc-50 font-mono font-bold">{coin.dominance}%</span>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden shrink-0">
                    <div
                      style={{ width: `${coin.dominance}%` }}
                      className="bg-indigo-500 h-full rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Watchlist toggle card */}
          <div className="bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-xl shadow-black/5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 mb-5 flex justify-between items-center">
              <span className="flex items-center gap-2">Watched Tokens <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /></span>
              <span className="text-[10px] bg-white/60 dark:bg-zinc-800/60 shadow-sm border border-white/50 dark:border-white/10 text-zinc-500 px-2.5 py-0.5 rounded-md font-mono tracking-widest lowercase font-bold">
                {watchlistCryptoSyms.length} targets
              </span>
            </h4>

            {watchlistCryptoSyms.length === 0 ? (
              <p className="text-center py-10 px-4 bg-white/30 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 text-[11px] font-sans">
                Watchlist is vacant.
              </p>
            ) : (
              <div id="crypto-watchlist" className="space-y-3">
                {cryptos
                  .filter((c) => watchlistCryptoSyms.includes(c.symbol))
                  .map((coin) => {
                    const isSelected = selectedCryptoSym === coin.symbol;
                    const changePositive = coin.changePercent24h >= 0;
                    return (
                      <div
                        id={`crypto-watchlist-item-${coin.symbol}`}
                        key={coin.symbol}
                        onClick={() => handleSelectCrypto(coin.symbol)}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex justify-between items-center transition-all hover:scale-[1.02] shadow-sm ${
                          isSelected
                            ? "bg-white/80 dark:bg-zinc-800/80 border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20"
                            : "bg-white/50 dark:bg-zinc-900/50 border-white/50 dark:border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold font-display text-zinc-800 dark:text-zinc-200 tracking-wide">{coin.symbol}</div>
                          <span className="text-[10px] text-zinc-400 block mt-0.5 leading-tight">{coin.name}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                            ${coin.price >= 1 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : coin.price.toFixed(4)}
                          </span>
                          <span className={`text-[10px] font-mono block leading-none mt-1 font-semibold ${changePositive ? "text-emerald-500" : "text-rose-500"}`}>
                            {changePositive ? "+" : ""}{coin.changePercent24h.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Recent Ledger audits */}
          <div className="bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-xl shadow-black/5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 mb-5 flex items-center justify-between">
              <span>On-Chain Settlement Log</span>
              <span className="text-[9px] text-emerald-600 font-mono font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> SECURE
              </span>
            </h4>

            <div id="crypto-tx-logs" className="space-y-4">
              {MOCK_TRANSACTIONS.map((tx) => (
                <div id={`tx-crypto-${tx.id}`} key={tx.id} className="border-b border-white/20 dark:border-white/5 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] tracking-widest font-mono font-bold px-2 py-0.5 rounded-md border ${
                      tx.type === "BUY"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : tx.type === "SWAP"
                        ? "bg-white/60 dark:bg-zinc-800/60 border-white/50 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    }`}>
                      {tx.type} {tx.symbol}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono tracking-wider">{tx.timestamp}</span>
                  </div>

                  <div className="flex justify-between items-baseline mt-3 text-xs">
                    <span className="text-zinc-800 dark:text-zinc-200 font-bold font-mono text-sm tracking-tight">{tx.amountRaw}</span>
                    <span className="text-zinc-500 dark:text-zinc-400 font-mono">{tx.totalCost}</span>
                  </div>

                  <div className="flex justify-between text-[11px] text-zinc-400 mt-1 font-sans">
                    <span>Rate: {tx.rate}</span>
                    <span className="text-zinc-400 font-mono text-[10px]">{tx.status}</span>
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
