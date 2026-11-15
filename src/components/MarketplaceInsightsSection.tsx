import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  AlertCircle,
  ExternalLink,
  Globe,
  RefreshCw,
  Search,
  TrendingUp,
} from 'lucide-react';
import { fetchMarketInsights } from '../lib/gemini';
import {
  getFallbackInsights,
  INSIGHT_TOPICS,
  InsightTopicId,
  MarketInsightsResponse,
} from '../utils/marketInsights';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { formatDate } from '../utils/formatters';

export const MarketplaceInsightsSection: React.FC = () => {
  const { t } = useThemeLanguage();
  const [activeTopic, setActiveTopic] = useState<InsightTopicId>('all');
  const [insights, setInsights] = useState<MarketInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cacheRef = useRef<Partial<Record<InsightTopicId, MarketInsightsResponse>>>({});
  const requestIdRef = useRef(0);

  const loadTopicInsights = useCallback(async (topicId: InsightTopicId, forceRefresh = false) => {
    if (!forceRefresh && cacheRef.current[topicId]) {
      setInsights(cacheRef.current[topicId]!);
      setErrorMsg(null);
      setIsLoading(false);
      return;
    }

    const currentReqId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await fetchMarketInsights(topicId, forceRefresh);
      if (currentReqId !== requestIdRef.current) return;
      if (data.isLiveGrounded) {
        cacheRef.current[topicId] = data;
      }
      setErrorMsg(data.error || null);
      setInsights(data);
    } catch (err: any) {
      if (currentReqId !== requestIdRef.current) return;
      const message = err?.message || 'Unable to load live Google Search trends right now.';
      setErrorMsg(message);
      const fallback: MarketInsightsResponse = err?.fallbackData || {
        ...getFallbackInsights(topicId),
        sources: [],
        searchQueries: [],
        generatedAt: new Date().toISOString(),
        isLiveGrounded: false,
        error: message,
      };
      setInsights(fallback);
    } finally {
      if (currentReqId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadTopicInsights(activeTopic, false);
  }, [activeTopic, loadTopicInsights]);

  const handleTopicSelect = (topicId: InsightTopicId) => {
    setActiveTopic(topicId);
  };

  const handleRefresh = () => {
    loadTopicInsights(activeTopic, true);
  };

  return (
    <section
      id="marketplace-insights"
      aria-labelledby="marketplace-insights-heading"
      className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Globe className="w-4 h-4 shrink-0" />
              <span>Google Search Grounded</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 dark:text-slate-400">
                {insights?.isLiveGrounded ? 'Live Industry Intelligence' : 'Market Benchmark View'}
              </span>
            </div>
            <h2
              id="marketplace-insights-heading"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance"
            >
              {t('marketplaceInsights')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('marketplaceInsightsSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {insights?.generatedAt && (
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                Updated {formatDate(insights.generatedAt)}
              </span>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-indigo-400 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Researching...' : 'Refresh Trends'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Skill Track Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter marketplace insights by skill track"
          className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8 border-b border-slate-200 dark:border-slate-800"
        >
          {INSIGHT_TOPICS.map((topic) => {
            const isActive = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTopicSelect(topic.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {topic.label}
              </button>
            );
          })}
        </div>

        {/* Propagated Status Notice (with Retry) */}
        {errorMsg && (
          <div
            role="status"
            className="mb-6 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500 dark:hover:border-indigo-400 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Retry Live Search
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div aria-busy="true" aria-label="Loading grounded marketplace insights" className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
                >
                  <div className="h-3.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loaded Insights Content */}
        {!isLoading && insights && (
          <div className="space-y-8">
            {/* Executive Summary Strip */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{insights.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span>{insights.isLiveGrounded ? 'Grounded via Google Search' : 'Curated 2026 Benchmark'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight text-balance">
                    {insights.headline}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {insights.executiveSummary}
                  </p>
                </div>

                <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 shrink-0">
                  <Link
                    to={`/freelancers?q=${encodeURIComponent(insights.trends[0]?.searchKeyword || '')}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Hire Trending Talent</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 4 Trend Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.trends.map((trend, index) => (
                <article
                  key={`${trend.skill}-${index}`}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    {/* Unboxed inline metadata with typographic separators */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {trend.demandLevel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{trend.category}</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {trend.hourlyRateRange}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {String(index + 1).padStart(2, '0')}. {trend.skill}
                    </h4>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {trend.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                      <span>{trend.growthSignal}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link
                        to={`/freelancers?skill=${encodeURIComponent(trend.searchKeyword)}`}
                        className="font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
                      >
                        Find Talent
                      </Link>
                      <Link
                        to={`/jobs?q=${encodeURIComponent(trend.searchKeyword)}`}
                        className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline whitespace-nowrap"
                      >
                        View Jobs
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Grounded Sources & Search Queries Footer */}
            {(insights.sources.length > 0 || insights.searchQueries.length > 0) && (
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                {insights.searchQueries.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                      <Search className="w-3.5 h-3.5 shrink-0" />
                      <span>Search queries:</span>
                    </span>
                    {insights.searchQueries.slice(0, 4).map((q, idx) => (
                      <React.Fragment key={q}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <span className="italic">{q}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {insights.sources.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Verified Web Sources
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {insights.sources.slice(0, 6).map((source) => (
                        <li key={source.uri}>
                          <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-xs group"
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {source.title}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {source.domain}
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
