"use client";

import { useState } from "react";

interface ResearchSource {
  id: string;
  name: string;
  type: "marketplace" | "competitor" | "social" | "supplier" | "industry";
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  apiKey: string;
}

interface Insight {
  id: string;
  title: string;
  source: string;
  confidence: number;
  freshness: string;
  type: "pricing" | "demand" | "sentiment" | "competitor";
  data: string;
}

const initialSources: ResearchSource[] = [
  { id: "rs1", name: "Amazon Marketplace", type: "marketplace", status: "connected", lastSync: "2026-09-14 10:30", apiKey: "••••••••" },
  { id: "rs2", name: "Flipkart Seller Hub", type: "marketplace", status: "connected", lastSync: "2026-09-14 09:15", apiKey: "••••••••" },
  { id: "rs3", name: "Google Trends", type: "industry", status: "connected", lastSync: "2026-09-13 18:00", apiKey: "••••••••" },
  { id: "rs4", name: "Social Buzz Monitor", type: "social", status: "error", lastSync: "2026-09-10 12:00", apiKey: "" },
  { id: "rs5", name: "Competitor Tracker", type: "competitor", status: "disconnected", lastSync: "Never", apiKey: "" },
  { id: "rs6", name: "Supplier Feed API", type: "supplier", status: "connected", lastSync: "2026-09-14 08:00", apiKey: "••••••••" },
];

const insights: Insight[] = [
  { id: "i1", title: "Honey prices trending 8% higher on Amazon", source: "Amazon Marketplace", confidence: 92, freshness: "2 hours ago", type: "pricing", data: "Average premium honey price on Amazon India increased from ₹450 to ₹486 over the past 30 days. Your pricing at ₹499-₹799 is competitive within the premium segment." },
  { id: "i2", title: "High demand for \"raw honey\" search terms", source: "Google Trends", confidence: 88, freshness: "6 hours ago", type: "demand", data: "Search volume for \"raw honey India\" increased 34% month-over-month. \"Forest honey\" and \"organic honey\" are also trending upward." },
  { id: "i3", title: "Positive sentiment on WildHive brand mentions", source: "Social Buzz Monitor", confidence: 75, freshness: "1 day ago", type: "sentiment", data: "42 mentions detected across social platforms. 78% positive, 15% neutral, 7% negative. Common praise: \"authentic taste\", \"fast delivery\". Complaints: \"price premium\"." },
  { id: "i4", title: "Competitor \"Pure Honey Co.\" launched new line", source: "Competitor Tracker", confidence: 85, freshness: "3 days ago", type: "competitor", data: "Pure Honey Co. launched 3 new varieties (Lavender, Manuka-inspired, Wildflower) at ₹349-₹599 price range. They are targeting the same premium segment." },
  { id: "i5", title: "Stingless bee honey gaining traction", source: "Google Trends", confidence: 70, freshness: "12 hours ago", type: "demand", data: "Searches for \"stingless bee honey\" increased 56% in South Indian markets. Limited supply creates a premium pricing opportunity." },
  { id: "i6", title: "Bulk honey prices rising from suppliers", source: "Supplier Feed API", confidence: 95, freshness: "4 hours ago", type: "pricing", data: "Raw honey bulk prices from suppliers increased 5% this quarter. Consider adjusting retail margins or locking in supplier contracts." },
];

const typeColors: Record<string, string> = {
  marketplace: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  competitor: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  social: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  supplier: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  industry: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
};

const insightTypeColors: Record<string, string> = {
  pricing: "💰 Pricing",
  demand: "📈 Demand",
  sentiment: "💬 Sentiment",
  competitor: "🏁 Competitor",
};

export default function ResearchPage() {
  const [sources, setSources] = useState(initialSources);
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [editApiKey, setEditApiKey] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState<"insights" | "sources">("insights");

  function toggleConnection(id: string) {
    setSources(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (s.status === "connected") return { ...s, status: "disconnected" as const };
      if (s.apiKey) return { ...s, status: "connected" as const, lastSync: new Date().toLocaleString() };
      return s;
    }));
  }

  function saveApiKey(id: string) {
    setSources(prev => prev.map(s => s.id === id ? { ...s, apiKey: editApiKey || "••••••••", status: "connected" as const, lastSync: new Date().toLocaleString() } : s));
    setEditingSource(null);
    setEditApiKey("");
  }

  const filteredSources = sources.filter(s => filterType === "all" || s.type === filterType);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Research Integration</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aggregated market insights from external sources
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800" role="tablist">
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === "insights"
              ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
          role="tab"
          aria-selected={activeTab === "insights"}
        >
          Insights ({insights.length})
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === "sources"
              ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
          role="tab"
          aria-selected={activeTab === "sources"}
        >
          Sources ({sources.length})
        </button>
      </div>

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Confidence</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(insights.reduce((a, b) => a + b.confidence, 0) / insights.length)}%
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Sources</p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                {sources.filter(s => s.status === "connected").length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">New Insights</p>
              <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {insights.filter(i => i.freshness.includes("hour")).length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">Data Sources</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{sources.length}</p>
            </div>
          </div>

          {/* Insights List */}
          <div className="space-y-3">
            {insights.map(insight => (
              <div key={insight.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{insight.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeColors[insight.type] || ""}`}>
                        {insightTypeColors[insight.type]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{insight.data}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Source: {insight.source}</span>
                      <span>Freshness: {insight.freshness}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Confidence</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`h-full rounded-full ${
                              insight.confidence >= 85 ? "bg-green-500" : insight.confidence >= 70 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${insight.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources Tab */}
      {activeTab === "sources" && (
        <>
          {/* Type filter */}
          <div className="mb-4 flex flex-wrap gap-2">
            {["all", "marketplace", "competitor", "social", "supplier", "industry"].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  filterType === type
                    ? "bg-amber-500 text-white"
                    : "border border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                }`}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full text-left text-sm" role="grid">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last Sync</th>
                  <th className="px-5 py-3">API Key</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredSources.map(source => (
                  <tr key={source.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{source.name}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeColors[source.type]}`}>
                        {source.type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                        source.status === "connected" ? "text-green-600 dark:text-green-400" :
                        source.status === "error" ? "text-red-500" : "text-gray-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          source.status === "connected" ? "bg-green-500" :
                          source.status === "error" ? "bg-red-500" : "bg-gray-400"
                        }`} />
                        {source.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{source.lastSync}</td>
                    <td className="px-5 py-3">
                      {editingSource === source.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editApiKey}
                            onChange={e => setEditApiKey(e.target.value)}
                            placeholder="Enter API key"
                            className="w-32 rounded border border-amber-400 bg-white px-2 py-1 text-xs dark:bg-gray-800"
                            autoFocus
                          />
                          <button onClick={() => saveApiKey(source.id)} className="text-xs text-green-600">✓</button>
                          <button onClick={() => setEditingSource(null)} className="text-xs text-gray-400">✕</button>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-gray-400">{source.apiKey || "Not set"}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleConnection(source.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                            source.status === "connected"
                              ? "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                              : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400"
                          }`}
                        >
                          {source.status === "connected" ? "Disconnect" : "Connect"}
                        </button>
                        <button
                          onClick={() => { setEditingSource(source.id); setEditApiKey(""); }}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                        >
                          Configure
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
