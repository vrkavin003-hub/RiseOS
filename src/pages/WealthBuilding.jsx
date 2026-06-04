import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Calculator, Landmark, Plus, ShieldCheck, Trash2, WalletCards } from 'lucide-react';
import ChartShell from '../components/ui/ChartShell';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBanner from '../components/ui/StatusBanner';
import { assetAllocation, wealthModules, wealthTimeline } from '../data/mockData';
import { useWealthSummary } from '../hooks/useWealthSummary';

const tooltipStyle = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  background: 'rgba(8,10,19,0.95)',
  color: '#fff',
};

const chartColors = ['#F7D88A', '#6EC6FF', '#5EF1B6', '#FF6B4A', '#B38CFF', '#94A3B8'];

const initialIncome = {
  amount: '',
  date: '',
  note: '',
  source: '',
};

const initialExpense = {
  amount: '',
  category: '',
  date: '',
  note: '',
};

function toAmount(value) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? Math.max(0, nextValue) : 0;
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return 'No date';
  return new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function buildExpenseChart(expenses) {
  const totals = expenses.reduce((groups, expense) => {
    const category = expense.category || 'general';
    groups[category] = Number(groups[category] || 0) + Number(expense.amount || 0);
    return groups;
  }, {});

  const entries = Object.entries(totals).map(([name, value], index) => ({
    fill: chartColors[index % chartColors.length],
    name,
    value,
  }));

  return entries.length > 0 ? entries : assetAllocation;
}

function TransactionList({ emptyBody, emptyTitle, items, mutatingId, onDelete, type }) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} body={emptyBody} action="Add entry" />;
  }

  return (
    <div className="grid gap-3">
      {items.slice(0, 6).map((item) => (
        <div key={item._id} className="flex items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
          <div>
            <p className="text-sm font-bold text-white">{type === 'income' ? item.source || 'Income' : item.category || 'Expense'}</p>
            <p className="mt-1 text-xs text-steel">{formatDate(item.date)}{item.note ? ` | ${item.note}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-black ${type === 'income' ? 'text-mint' : 'text-ember'}`}>{formatMoney(item.amount)}</span>
            <button
              aria-label={`Delete ${type}`}
              className="focus-ring grid size-9 place-items-center rounded-[8px] border border-white/10 bg-white/7 text-steel transition hover:border-ember/35 hover:text-ember disabled:cursor-not-allowed disabled:opacity-60"
              disabled={mutatingId === item._id}
              onClick={() => onDelete(item)}
              type="button"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WealthBuilding() {
  const {
    createExpense,
    createIncome,
    deleteExpense,
    deleteIncome,
    error,
    expenses,
    incomes,
    isCreating,
    isLoading,
    mutatingId,
    net,
    savingsRate,
    summary,
  } = useWealthSummary();
  const [incomeForm, setIncomeForm] = useState(initialIncome);
  const [expenseForm, setExpenseForm] = useState(initialExpense);

  const expenseChart = useMemo(() => buildExpenseChart(expenses), [expenses]);
  const budgetProgress = summary.totalIncome > 0 ? Math.max(0, Math.min(100, savingsRate)) : 0;
  const trackedModules = wealthModules.map((module) =>
    module.title === 'Budget Tracking' ? { ...module, progress: budgetProgress } : module,
  );

  function handleIncomeChange(event) {
    const { name, value } = event.target;
    setIncomeForm((current) => ({ ...current, [name]: value }));
  }

  function handleExpenseChange(event) {
    const { name, value } = event.target;
    setExpenseForm((current) => ({ ...current, [name]: value }));
  }

  async function handleIncomeSubmit(event) {
    event.preventDefault();

    try {
      await createIncome({
        amount: toAmount(incomeForm.amount),
        date: incomeForm.date || undefined,
        note: incomeForm.note,
        source: incomeForm.source || 'general',
      });
      setIncomeForm(initialIncome);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleExpenseSubmit(event) {
    event.preventDefault();

    try {
      await createExpense({
        amount: toAmount(expenseForm.amount),
        category: expenseForm.category || 'general',
        date: expenseForm.date || undefined,
        note: expenseForm.note,
      });
      setExpenseForm(initialExpense);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleDeleteIncome(item) {
    try {
      await deleteIncome(item);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleDeleteExpense(item) {
    try {
      await deleteExpense(item);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Wealth Building"
        title="Educational systems for financial literacy and asset thinking"
        description="Track income and expenses while learning budgeting principles, investment concepts, and long-term decision discipline."
        action={
          <PremiumButton disabled={isCreating} form="income-form" icon={Landmark} type="submit">
            Add income
          </PremiumButton>
        }
      />

      <GlassCard className="border-mint/20 bg-mint/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 text-mint" size={20} />
          <p className="text-sm leading-6 text-steel">
            Educational only: this page tracks your account data for learning and budgeting practice. It is not financial advice, investment advice, or a prediction of returns.
          </p>
        </div>
      </GlassCard>

      <StatusBanner>{error}</StatusBanner>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Total income', formatMoney(summary.totalIncome), 'text-mint'],
          ['Total expenses', formatMoney(summary.totalExpenses), 'text-ember'],
          ['Net tracked', formatMoney(net), net >= 0 ? 'text-mint' : 'text-ember'],
          ['Savings rate', `${savingsRate}%`, savingsRate >= 0 ? 'text-champagne' : 'text-ember'],
        ].map(([label, value, tone]) => (
          <GlassCard key={label} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
            <p className={`mt-3 text-2xl font-black ${tone}`}>{isLoading ? 'Syncing' : value}</p>
          </GlassCard>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Income" title="Track earning signals" />
          <form id="income-form" className="grid gap-3" onSubmit={handleIncomeSubmit}>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs font-semibold text-steel">Source</span>
                <input
                  className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white placeholder:text-steel"
                  name="source"
                  onChange={handleIncomeChange}
                  placeholder="Freelance"
                  value={incomeForm.source}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-steel">Amount</span>
                <input
                  className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white placeholder:text-steel"
                  min="0"
                  name="amount"
                  onChange={handleIncomeChange}
                  placeholder="500"
                  required
                  step="0.01"
                  type="number"
                  value={incomeForm.amount}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-steel">Date</span>
                <input
                  className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white"
                  name="date"
                  onChange={handleIncomeChange}
                  type="date"
                  value={incomeForm.date}
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-steel">Note</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white placeholder:text-steel"
                name="note"
                onChange={handleIncomeChange}
                placeholder="Milestone payment, salary, product sale..."
                value={incomeForm.note}
              />
            </label>
            <div className="flex justify-end">
              <PremiumButton disabled={isCreating} icon={Plus} type="submit">
                Save income
              </PremiumButton>
            </div>
          </form>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Expenses" title="Track spending signals" />
          <form className="grid gap-3" onSubmit={handleExpenseSubmit}>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs font-semibold text-steel">Category</span>
                <input
                  className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white placeholder:text-steel"
                  name="category"
                  onChange={handleExpenseChange}
                  placeholder="Tools"
                  value={expenseForm.category}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-steel">Amount</span>
                <input
                  className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white placeholder:text-steel"
                  min="0"
                  name="amount"
                  onChange={handleExpenseChange}
                  placeholder="29"
                  required
                  step="0.01"
                  type="number"
                  value={expenseForm.amount}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-steel">Date</span>
                <input
                  className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white"
                  name="date"
                  onChange={handleExpenseChange}
                  type="date"
                  value={expenseForm.date}
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-steel">Note</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white placeholder:text-steel"
                name="note"
                onChange={handleExpenseChange}
                placeholder="Subscription, coffee meeting, course..."
                value={expenseForm.note}
              />
            </label>
            <div className="flex justify-end">
              <PremiumButton disabled={isCreating} icon={Plus} type="submit">
                Save expense
              </PremiumButton>
            </div>
          </form>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.86fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Recent Activity" title="Income and expense ledger" />
          {isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <TransactionList
                emptyBody="Saved income entries appear here."
                emptyTitle="No income tracked"
                items={incomes}
                mutatingId={mutatingId}
                onDelete={handleDeleteIncome}
                type="income"
              />
              <TransactionList
                emptyBody="Saved expenses appear here."
                emptyTitle="No expenses tracked"
                items={expenses}
                mutatingId={mutatingId}
                onDelete={handleDeleteExpense}
                type="expense"
              />
            </div>
          )}
        </GlassCard>

        <ChartShell title={expenses.length ? 'Spending Allocation' : 'Asset Allocation Charts'} subtitle={expenses.length ? 'Tracked expenses by category' : 'Educational sample allocation'}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expenseChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                {expenseChart.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartShell>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        {trackedModules.map((module, index) => {
          const Icon = module.icon;
          return (
            <GlassCard key={module.title} className="p-4" delay={index * 0.04}>
              <div className="mb-4 grid size-11 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
                <Icon size={20} />
              </div>
              <h2 className="text-sm font-bold text-white">{module.title}</h2>
              <div className="mt-4">
                <ProgressBar value={module.progress} color="#F7D88A" label="Progress" compact />
              </div>
            </GlassCard>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.86fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Wealth Journey Timeline" title="Long-term behavior path" />
          <div className="relative space-y-4">
            <div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-px bg-white/10" />
            {wealthTimeline.map((item) => (
              <div key={item.year} className="relative flex gap-4">
                <div className="z-10 grid size-8 shrink-0 place-items-center rounded-full bg-gold-line text-xs font-black text-night">{item.year.slice(2)}</div>
                <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-sm font-bold text-white">
                    {item.year} | {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-steel">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Scenario Planner" title="Budget discipline simulator" description="Simple planning surface for learning how behavior assumptions affect cash discipline." />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Monthly contribution', formatMoney(Math.max(0, net))],
              ['Tracked income', formatMoney(summary.totalIncome)],
              ['Tracked expenses', formatMoney(summary.totalExpenses)],
              ['Discipline factor', savingsRate >= 20 ? 'High' : savingsRate >= 0 ? 'Building' : 'At risk'],
            ].map(([label, value]) => (
              <label key={label} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-steel">{label}</span>
                <input className="focus-ring mt-3 w-full bg-transparent text-lg font-black text-white" readOnly value={value} />
              </label>
            ))}
          </div>
          <PremiumButton className="mt-5" icon={Calculator} variant="ghost">
            Simulate plan
          </PremiumButton>
        </GlassCard>
      </section>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-[8px] bg-gold-line text-night">
            <WalletCards size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-champagne">Financial literacy loop</p>
            <h2 className="text-xl font-black text-white">Track, review, adjust, and keep decisions boring on purpose.</h2>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
