/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { StockTicker } from "../types";
import { TrendingUp, TrendingDown, RefreshCw, Star, Info, DollarSign, Activity } from "lucide-react";
import TiltCard from "./TiltCard";

interface EquitiesOverviewProps {
  stocks: StockTicker[];
  watchlistSyms: string[];
  toggleWatchlist: (symbol: string) => void;
  triggerSystemAction: (category: string, details: string) => void;
  triggerSystemMessage: (title: string, msg: string, cat: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL") => void;
}

export default function EquitiesOverview({
  stocks,
  watchlistSyms,
  toggleWatchlist,
  triggerSystemAction,
  triggerSystemMessage,
}: EquitiesOverviewProps) {
  const [selectedStockSym, setSelectedStockSym] = useState<string>("NVDA");
  const [moversTab, setMoversTab] = useState<"ALL" | "GAINERS" | "LOSERS">("ALL");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const selectedStock = stocks.find((s) => s.symbol === selectedStockSym) || stocks[0];

  // Filter stocks for Movers list
  const moversList = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const filteredMovers = moversList.filter((s) => {
    if (moversTab === "GAINERS") return s.changePercent > 0;
    if (moversTab === "LOSERS") return s.changePercent < 0;
    return true;
  });

  const getSectorBreakdown = () => {
    const sectors: { [key: string]: { totalValue: number; count: number } } = {};
    stocks.forEach((s) => {
      if (!sectors[s.sector]) {
        sectors[s.sector] = { totalValue: 0, count: 0 };
      }
      sectors[s.sector].totalValue += s.price;
      sectors[s.sector].count += 1;
    });

    const totalPortfolioStockValue = stocks.reduce((sum, s) => sum + s.price, 0);

    return Object.keys(sectors).map((sect) => {
      const percentage = (sectors[sect].totalValue / totalPortfolioStockValue) * 100;
      return {
        name: sect,
        allocation: percentage.toFixed(1),
        tickersCount: sectors[sect].count,
        impliedValue: "$" + (sectors[sect].totalValue * 154000).toLocaleString(undefined, { maximumFractionDigits: 0 }),
      };
    });
  };

  const handleSelectStock = (sym: string) => {
    setSelectedStockSym(sym);
    triggerSystemAction("PORTFOLIO", `Inspected stock ticker ${sym} via Interactive Equities pane.`);
  };

  // Generate coordinate array for custom high fidelity SVG graph
  const renderInteractiveChart = () => {
    const data = selectedStock.history24h;
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const width = 600;
    const height = 180;
    const padding = 15;

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
      return { x, y, value: val };
    });

    const pathData = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    const isPositive = selectedStock.changePercent >= 0;
    const lineColor = isPositive ? "#4f46e5" : "#f43f5e"; // Emerald vs. Rose

    return (
      <div className="relative">
        {/* Render coordinates line */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[200px] overflow-visible">
          <defs>
            <linearGradient id={`gradient-${selectedStock.symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="10" y1={height / 2} x2={width - 10} y2={height / 2} stroke="#e2e8f0" strokeDasharray="4 4" />
          <line x1="10" y1={height - padding} x2={width - 10} y2={height - padding} stroke="#cbd5e1" />

          {/* Smooth area fill */}
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
            fill={`url(#gradient-${selectedStock.symbol})`}
          />

          {/* Main stroke line */}
          <path d={pathData} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Tooltip circles */}
          {points.map((p, idx) => (
            <circle
              id={`point-circle-${selectedStock.symbol}-${idx}`}
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === idx ? "6" : "3.5"}
              fill={hoverIndex === idx ? lineColor : "#09090b"}
              stroke={lineColor}
              strokeWidth="1.8"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer transition-all"
            />
          ))}
        </svg>

        {/* Hover Value Box */}
        <div className="absolute right-4 top-2 text-right">
          {hoverIndex !== null ? (
            <div id="chart-hover-metrics">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Intraday Spot value</span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-50">
                ${points[hoverIndex].value.toFixed(2)}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">24h Peak Value</span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                Hi: ${selectedStock.high} / Lo: ${selectedStock.low}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="equities-screen" className="space-y-6">
      {/* Upper header summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/20 dark:border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50 tracking-tight">Equities Performance</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5 max-w-lg">
            Interactive stock analysis metrics, algorithmic indices, sector allocations and real-time watchlists.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
             <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest pl-1">
               Feed Active
             </span>
          </div>
          <button
            id="force-refresh-quotes"
            onClick={() => {
              triggerSystemMessage("Quotes Synchronized", "Successfully refreshed index market quotations from financial endpoints.", "SUCCESS");
              triggerSystemAction("PORTFOLIO", "Requested force stock feed metadata sync.");
            }}
            className="p-2 bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 rounded-xl hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all cursor-pointer backdrop-blur-md"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* THREE SECTION GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        {/* LEFT CARD COLUMN: STOCK DETAILS CHART (8 COLS) */}
        <div id="stock-chart-panel" className="lg:col-span-8 space-y-6">
          <div className="bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden shadow-xl shadow-black/5">
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
            
            <div className="relative z-10">
            {/* Active Ticker Row */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/60 dark:bg-zinc-900/60 border border-white/50 dark:border-white/10 shadow-sm text-zinc-800 dark:text-zinc-200 px-4 py-2 rounded-2xl text-xl font-bold font-display tracking-wide backdrop-blur-md">
                  {selectedStock.symbol}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-sans tracking-tight">
                    {selectedStock.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-zinc-400 font-mono tracking-widest uppercase">Sector:</span>
                    <span className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-0.5 rounded-md text-[9px] uppercase font-mono font-bold tracking-wider">
                      {selectedStock.sector}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Indicators */}
              <div className="text-right">
                <div className="text-3xl font-display font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  ${selectedStock.price.toFixed(2)}
                </div>
                <div className={`text-xs font-mono font-bold flex items-center justify-end gap-1 mt-1.5 ${
                  selectedStock.changePercent >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}>
                  {selectedStock.changePercent >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{selectedStock.changePercent >= 0 ? "+" : ""}{selectedStock.changePercent.toFixed(2)}%</span>
                  <span className="text-zinc-400">(${selectedStock.changeValue.toFixed(2)})</span>
                </div>
              </div>
            </div>

            {/* Simulated Live SVG Chart */}
            <div className="py-4 border-t border-b border-white/20 dark:border-white/5 my-6 backdrop-blur-sm">
              {renderInteractiveChart()}
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              <div className="bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 rounded-2xl p-4 backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Market Cap</span>
                <span className="text-sm font-sans font-bold text-zinc-800 dark:text-zinc-200 mt-1 block">{selectedStock.marketCap}</span>
                <span className="text-[9px] text-zinc-400 font-sans mt-0.5 block">USD Base Valuation</span>
              </div>
              <div className="bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 rounded-2xl p-4 backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Volume (24h)</span>
                <span className="text-sm font-sans font-bold text-zinc-800 dark:text-zinc-200 mt-1 block">{selectedStock.volume}</span>
                <span className="text-[9px] text-zinc-400 font-sans mt-0.5 block">Accumulated trades</span>
              </div>
              <div className="bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 rounded-2xl p-4 backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">P/E Ratio</span>
                <span className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-1 block">{selectedStock.peRatio}</span>
                <span className="text-[9px] text-zinc-400 font-sans mt-0.5 block">Price/Earnings mult</span>
              </div>
              <div className="bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 rounded-2xl p-4 backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Watchlist</span>
                <button
                  id={`favorite-toggle-${selectedStock.symbol}`}
                  onClick={() => toggleWatchlist(selectedStock.symbol)}
                  className="mt-2 flex items-center justify-center gap-1.5 py-1.5 w-full bg-zinc-900 dark:bg-zinc-100/10 hover:bg-black dark:hover:bg-white/20 text-white dark:text-zinc-100 rounded-xl text-[10px] font-sans font-bold transition-colors cursor-pointer"
                >
                  <Star className={`w-3 h-3 shrink-0 ${
                    watchlistSyms.includes(selectedStock.symbol) ? "fill-amber-400 text-amber-500" : ""
                  }`} />
                  <span>{watchlistSyms.includes(selectedStock.symbol) ? "Tracking" : "Add Asset"}</span>
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* Sector Allocation Breakdown */}
          <div className="bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-xl shadow-black/5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 mb-5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Sector Weight Allocations
            </h4>
            <div id="sector-table" className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/20 dark:border-white/5 text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
                    <th className="py-3 pb-2 font-semibold">Sector Target</th>
                    <th className="py-3 pb-2 font-semibold">Asset Weight</th>
                    <th className="py-3 pb-2 font-semibold">Volume Count</th>
                    <th className="py-3 pb-2 font-semibold text-right">Implied Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50 text-xs font-sans text-zinc-700 dark:text-zinc-300">
                  {getSectorBreakdown().map((sect, idx) => (
                    <tr key={idx} className="hover:bg-white/40 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 font-bold text-zinc-800 dark:text-zinc-200 tracking-wide">{sect.name}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-8 font-mono text-[11px] font-semibold">{sect.allocation}%</span>
                          <div className="w-24 bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden shrink-0">
                            <div
                              style={{ width: `${sect.allocation}%` }}
                              className="bg-indigo-500 h-full rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-zinc-500 dark:text-zinc-400 text-[11px]">{sect.tickersCount} contracts</td>
                      <td className="py-3.5 text-right font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{sect.impliedValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT CARD COLUMN: MARKET TICKERS & WATCHLIST (4 COLS) */}
        <div id="stock-watchlist-panel" className="lg:col-span-4 space-y-6">
          {/* Watchlist card */}
          <div className="bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-xl shadow-black/5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2">Watched Assets <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /></span>
              <span className="text-[10px] bg-white/60 dark:bg-zinc-800/60 shadow-sm border border-white/50 dark:border-white/10 text-zinc-500 px-2.5 py-0.5 rounded-md font-mono tracking-widest lowercase font-bold">
                {watchlistSyms.length} total
              </span>
            </h4>

            {watchlistSyms.length === 0 ? (
              <div className="text-center py-10 px-4 bg-white/30 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 text-[11px] font-sans">
                Watchlist empty. Toggle the star on any ticker to list here.
              </div>
            ) : (
              <div id="watchlist-tickers" className="space-y-3">
                {stocks
                  .filter((s) => watchlistSyms.includes(s.symbol))
                  .map((stock) => {
                    const isSelected = selectedStockSym === stock.symbol;
                    const changePositive = stock.changePercent >= 0;
                    return (
                      <div
                        id={`watchlist-row-${stock.symbol}`}
                        key={stock.symbol}
                        onClick={() => handleSelectStock(stock.symbol)}
                        className={`flex justify-between items-center p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${
                          isSelected
                            ? "bg-white/80 dark:bg-zinc-800/80 border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20"
                            : "bg-white/50 dark:bg-zinc-900/50 border-white/50 dark:border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold font-display text-zinc-800 dark:text-zinc-200 tracking-wide">{stock.symbol}</div>
                          <div className="text-[10px] text-zinc-400 max-w-[120px] truncate mt-0.5">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">${stock.price.toFixed(2)}</div>
                          <div className={`text-[10px] font-mono leading-none flex items-center justify-end gap-0.5 mt-1 font-semibold ${
                            changePositive ? "text-emerald-500" : "text-rose-500"
                          }`}>
                            <span>{changePositive ? "+" : ""}{stock.changePercent.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Movers / Tickers selection card */}
          <div className="bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-xl shadow-black/5 flex flex-col h-[520px]">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 mb-4 block">
              Market Movers
            </h4>

            {/* Quick tabs filters */}
            <div id="market-movers-tabs" className="grid grid-cols-3 bg-white/60 dark:bg-zinc-900/60 shadow-sm border border-white/50 dark:border-white/10 p-1 rounded-xl mb-5 shrink-0">
              {["ALL", "GAINERS", "LOSERS"].map((tab) => (
                <button
                  id={`movers-tab-${tab.toLowerCase()}`}
                  key={tab}
                  onClick={() => setMoversTab(tab as any)}
                  className={`py-1.5 text-[10px] font-mono rounded-lg font-bold uppercase cursor-pointer transition-all ${
                    moversTab === tab
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* list */}
            <div id="movers-tickers-list" className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-hide">
              {filteredMovers.map((stock) => {
                const isSelected = selectedStockSym === stock.symbol;
                const changePositive = stock.changePercent >= 0;
                return (
                  <div
                    id={`mover-item-${stock.symbol}`}
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock.symbol)}
                    className={`flex justify-between items-center p-3 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex-shrink-0 ${
                      isSelected
                        ? "bg-white/80 dark:bg-zinc-800/80 border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20"
                        : "bg-white/50 dark:bg-zinc-900/50 border-white/50 dark:border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-white/50 dark:border-white/5 flex items-center justify-center text-[10px] font-extrabold font-display tracking-widest text-zinc-500 dark:text-zinc-400 shadow-sm">
                        {stock.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-display text-zinc-800 dark:text-zinc-200 tracking-wide">{stock.symbol}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{stock.name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">${stock.price.toFixed(2)}</div>
                      <div className={`text-[10px] font-mono font-bold leading-none bg-white/80 dark:bg-zinc-800/80 shadow-sm border border-white/50 dark:border-white/5 py-1 px-2 rounded-md inline-block mt-1 ${
                        changePositive
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}>
                        {changePositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
