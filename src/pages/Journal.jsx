import { useState } from 'react';
import { Brain, CheckCircle2, Save, Sparkles } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import SectionHeader from '../components/ui/SectionHeader';
import { journalAnalysis, journalSections } from '../data/mockData';

const starterValues = {
  'What I Learned Today': 'Studied AI agent evaluation patterns and prompt testing workflows.',
  'What I Built Today': 'Completed the first version of a premium dashboard UI.',
  Wins: 'Protected deep work and completed my daily planning ritual.',
  Failures: 'Delayed outreach because product polish felt easier than sales discomfort.',
  Lessons: 'Shipping matters, but feedback loops matter even more.',
  Expenses: 'Cloud tools: $18. Coffee meeting: $6.',
  Income: 'Freelance milestone invoice drafted.',
  'Networking Activity': 'Commented on two founder posts and bookmarked three potential mentors.',
  'Health Activity': '35-minute strength session and 8,200 steps.',
};

export default function Journal() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Daily Journal"
        title="Turn reflection into tomorrow's edge"
        description="Log learning, building, wins, failures, money signals, networking, and health activity. The AI analysis panel converts the day into useful feedback."
        action={
          <PremiumButton icon={Save} onClick={() => setSubmitted(true)}>
            Analyze day
          </PremiumButton>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
        <GlassCard className="p-5">
          <div className="grid gap-4">
            {journalSections.map((section) => (
              <label key={section} className="block">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <CheckCircle2 size={16} className="text-champagne" />
                  {section}
                </span>
                <textarea
                  className="focus-ring mt-2 min-h-24 w-full resize-y rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-white placeholder:text-steel"
                  defaultValue={starterValues[section]}
                  placeholder={`Write your ${section.toLowerCase()}...`}
                />
              </label>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-steel">Autosaved locally for this prototype experience.</p>
            <PremiumButton icon={Sparkles} onClick={() => setSubmitted(true)}>
              Submit and analyze
            </PremiumButton>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
                <Brain size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-champagne">AI Analysis Panel</p>
                <h2 className="text-xl font-bold text-white">{submitted ? 'Today’s decision intelligence' : 'Waiting for submission'}</h2>
              </div>
            </div>

            {submitted ? (
              <div className="mt-5 space-y-3">
                {journalAnalysis.map((item) => (
                  <div key={item.label} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                    <h3 className="text-sm font-bold text-white">{item.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-steel">{item.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState title="No analysis yet" body="Submit your journal to reveal strengths, weaknesses, opportunities, and tomorrow's action plan." action="Analyze" />
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader eyebrow="Streak" title="Reflection consistency" description="Journaling four or more days per week improves the quality of AI coaching recommendations." />
            <div className="grid grid-cols-7 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className={`grid aspect-square place-items-center rounded-[8px] border text-sm font-bold ${
                    index < 5 ? 'border-champagne/30 bg-champagne/15 text-champagne' : 'border-white/10 bg-white/[0.045] text-steel'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
