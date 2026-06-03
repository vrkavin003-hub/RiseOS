import { useMemo, useState } from 'react';
import { ArrowUpRight, BriefcaseBusiness, ChartNoAxesCombined, Lightbulb, Newspaper } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import { newsCards, newsCategories } from '../data/mockData';

export default function NewsIntelligence() {
  const [category, setCategory] = useState('AI');
  const filteredNews = useMemo(() => newsCards.filter((card) => card.category === category), [category]);
  const visibleNews = filteredNews.length ? filteredNews : newsCards.slice(0, 4);

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="World News Intelligence"
        title="Signal-rich briefings for careers, business ideas, and market awareness"
        description="A modern news dashboard that translates global events into practical career impact, business opportunity, and educational investment insight."
        action={<PremiumButton icon={Newspaper}>Generate briefing</PremiumButton>}
      />

      <GlassCard className="p-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {newsCategories.map((item) => (
            <button
              key={item}
              className={`focus-ring shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                category === item
                  ? 'border-champagne/45 bg-champagne/14 text-champagne shadow-gold'
                  : 'border-white/10 bg-white/[0.045] text-steel hover:border-white/20 hover:text-white'
              }`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-3">
        {visibleNews.map((card, index) => (
          <GlassCard key={card.headline} className="flex min-h-[420px] flex-col p-5 transition hover:-translate-y-1 hover:border-champagne/35" delay={index * 0.05}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-full border border-champagne/20 bg-champagne/10 px-3 py-1 text-xs font-bold text-champagne">{card.category}</span>
              <span className="text-xs font-semibold text-steel">Impact {card.impact}/100</span>
            </div>
            <h2 className="text-xl font-black leading-tight text-white">{card.headline}</h2>
            <p className="mt-3 text-sm leading-6 text-steel">{card.summary}</p>
            <div className="mt-5">
              <ProgressBar label="Impact Score" value={card.impact} color={card.impact > 85 ? '#F7D88A' : '#6EC6FF'} />
            </div>
            <div className="mt-5 flex-1 space-y-3">
              <Insight icon={BriefcaseBusiness} label="Career Impact" body={card.career} />
              <Insight icon={Lightbulb} label="Business Opportunity" body={card.business} />
              <Insight icon={ChartNoAxesCombined} label="Investment Insight" body={card.investment} />
            </div>
            <PremiumButton className="mt-5 w-full" icon={ArrowUpRight} variant="ghost">
              Learn More
            </PremiumButton>
          </GlassCard>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <GlassCard className="p-5">
          <EmptyState
            title={`No dedicated ${category} cards yet`}
            body="Showing the strongest cross-category intelligence while the AI briefing engine prepares a category-specific feed."
            action="Refresh feed"
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
