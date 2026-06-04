import { useMemo, useState } from 'react';
import { ArrowUpRight, Bookmark, BriefcaseBusiness, ChartNoAxesCombined, Lightbulb, Newspaper, RefreshCw } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBanner from '../components/ui/StatusBanner';
import { useAuth } from '../context/AuthContext';
import { newsCards, newsCategories } from '../data/mockData';
import { useNewsIntelligence } from '../hooks/useNewsIntelligence';

function normalizeArticle(item) {
  return {
    _id: item._id,
    business: item.businessImpact || item.business || 'Look for customer pain, operational shifts, and new market openings.',
    career: item.careerImpact || item.career || 'Identify skills and roles becoming more valuable because of this trend.',
    category: item.category || 'Technology',
    headline: item.headline,
    impact: Number(item.impactScore ?? item.impact ?? 60),
    investment: item.learningOpportunity || item.investment || 'Summarize the article and extract one practical lesson.',
    publishedAt: item.publishedAt,
    savedBy: item.savedBy || [],
    source: item.source || 'RiseOS AI',
    summary: item.summary || 'No summary available yet.',
    url: item.url || '',
  };
}

function isSavedByUser(article, userId) {
  if (!userId) return false;
  return article.savedBy.some((entry) => String(entry?._id || entry) === String(userId));
}

function formatPublishedAt(value) {
  if (!value) return 'Curated';
  return new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export default function NewsIntelligence() {
  const { user } = useAuth();
  const { error, isLoading, isRefreshing, mutatingId, news, refreshNews, saveNews } = useNewsIntelligence();
  const [category, setCategory] = useState('AI');

  const liveArticles = useMemo(() => news.map(normalizeArticle), [news]);
  const fallbackArticles = useMemo(() => newsCards.map(normalizeArticle), []);
  const articles = liveArticles.length > 0 ? liveArticles : fallbackArticles;
  const categories = useMemo(
    () => Array.from(new Set([...newsCategories, ...articles.map((article) => article.category).filter(Boolean)])),
    [articles],
  );
  const filteredNews = useMemo(() => articles.filter((card) => card.category === category), [articles, category]);
  const visibleNews = filteredNews.length ? filteredNews : articles.slice(0, 4);
  const usingFallback = liveArticles.length === 0;

  async function handleRefresh() {
    try {
      await refreshNews();
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleSave(article) {
    if (!article._id) return;

    try {
      await saveNews(article._id);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="World News Intelligence"
        title="Signal-rich briefings for careers, business ideas, and market awareness"
        description="A modern news dashboard that translates global events into practical career impact, business opportunity, and educational investment insight."
        action={
          <PremiumButton disabled={isRefreshing} icon={RefreshCw} onClick={handleRefresh} type="button">
            {isRefreshing ? 'Refreshing...' : 'Generate briefing'}
          </PremiumButton>
        }
      />

      <StatusBanner>{error}</StatusBanner>

      {usingFallback && !isLoading && (
        <GlassCard className="border-champagne/20 bg-champagne/5 p-4">
          <div className="flex items-start gap-3">
            <Newspaper className="mt-1 text-champagne" size={20} />
            <p className="text-sm leading-6 text-steel">
              Showing curated sample intelligence until live articles are available. Add `NEWS_API_KEY` and refresh to populate the account feed.
            </p>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              className={`focus-ring shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                category === item
                  ? 'border-champagne/45 bg-champagne/14 text-champagne shadow-gold'
                  : 'border-white/10 bg-white/[0.045] text-steel hover:border-white/20 hover:text-white'
              }`}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </GlassCard>

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <LoadingSkeleton rows={4} />
          <LoadingSkeleton rows={4} />
          <LoadingSkeleton rows={4} />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {visibleNews.map((card, index) => {
            const saved = isSavedByUser(card, user?._id);
            return (
              <GlassCard key={card._id || card.headline} className="flex min-h-[420px] flex-col p-5 transition hover:-translate-y-1 hover:border-champagne/35" delay={index * 0.05}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-champagne/20 bg-champagne/10 px-3 py-1 text-xs font-bold text-champagne">{card.category}</span>
                  <span className="text-xs font-semibold text-steel">Impact {card.impact}/100</span>
                </div>
                <h2 className="text-xl font-black leading-tight text-white">{card.headline}</h2>
                <p className="mt-2 text-xs font-semibold text-steel">
                  {card.source} | {formatPublishedAt(card.publishedAt)}
                </p>
                <p className="mt-3 text-sm leading-6 text-steel">{card.summary}</p>
                <div className="mt-5">
                  <ProgressBar label="Impact Score" value={card.impact} color={card.impact > 85 ? '#F7D88A' : '#6EC6FF'} />
                </div>
                <div className="mt-5 flex-1 space-y-3">
                  <Insight icon={BriefcaseBusiness} label="Career Impact" body={card.career} />
                  <Insight icon={Lightbulb} label="Business Opportunity" body={card.business} />
                  <Insight icon={ChartNoAxesCombined} label="Learning Insight" body={card.investment} />
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <PremiumButton
                    disabled={!card._id || saved || mutatingId === card._id}
                    icon={Bookmark}
                    onClick={() => handleSave(card)}
                    type="button"
                    variant="ghost"
                  >
                    {saved ? 'Saved' : 'Save'}
                  </PremiumButton>
                  {card.url ? (
                    <a
                      className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/8 px-4 text-sm font-bold text-white transition duration-300 hover:border-champagne/35 hover:bg-white/12"
                      href={card.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Learn More
                      <ArrowUpRight size={17} />
                    </a>
                  ) : (
                    <PremiumButton className="w-full" icon={ArrowUpRight} type="button" variant="ghost" disabled>
                      Learn More
                    </PremiumButton>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {!isLoading && filteredNews.length === 0 && (
        <GlassCard className="p-5">
          <EmptyState
            title={`No dedicated ${category} cards yet`}
            body="Showing the strongest cross-category intelligence while the briefing engine prepares a category-specific feed."
            action="Refresh feed"
            onAction={handleRefresh}
          />
        </GlassCard>
      )}
    </div>
  );
}

function Insight({ icon: Icon, label, body }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <Icon size={16} className="text-champagne" />
        {label}
      </div>
      <p className="mt-2 text-xs leading-5 text-steel">{body}</p>
    </div>
  );
}
