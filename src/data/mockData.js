import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  ChartNoAxesCombined,
  CircleDollarSign,
  Crown,
  Dumbbell,
  Flame,
  Globe2,
  GraduationCap,
  HeartPulse,
  Landmark,
  Lightbulb,
  LineChart,
  Lock,
  MessageSquareText,
  Mic,
  Newspaper,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  WalletCards,
  Zap,
} from 'lucide-react';

export const user = {
  name: 'Kavin',
  role: 'Founder in training',
  location: 'India',
  avatar: 'K',
  streak: 42,
  level: 'Executive Builder',
  focus: 'AI products, disciplined learning, business strategy',
};

export const navigation = [
  { label: 'Dashboard', path: '/', icon: BarChart3 },
  { label: 'AI Coach', path: '/coach', icon: MessageSquareText },
  { label: 'Journal', path: '/journal', icon: BookOpen },
  { label: 'News', path: '/news', icon: Newspaper },
  { label: 'Skills', path: '/skills', icon: GraduationCap },
  { label: 'Business Lab', path: '/business-lab', icon: Lightbulb },
  { label: 'Wealth', path: '/wealth', icon: Landmark },
  { label: 'Goals', path: '/goals', icon: Target },
  { label: 'Analytics', path: '/analytics', icon: LineChart },
  { label: 'Profile', path: '/profile', icon: UserRound },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const mobileNavigation = navigation.slice(0, 5);

export const scoreCards = [
  { label: 'Growth Score', value: 88, delta: '+12%', icon: TrendingUp, color: '#F7D88A' },
  { label: 'Wealth Score', value: 71, delta: '+8%', icon: CircleDollarSign, color: '#5EF1B6' },
  { label: 'Skill Score', value: 84, delta: '+15%', icon: GraduationCap, color: '#6EC6FF' },
  { label: 'Discipline Score', value: 91, delta: '+6%', icon: Flame, color: '#FF6B4A' },
  { label: 'Health Score', value: 76, delta: '+4%', icon: HeartPulse, color: '#B38CFF' },
  { label: 'Productivity Score', value: 86, delta: '+10%', icon: Zap, color: '#F7D88A' },
];

export const dashboardWidgets = {
  mission: {
    title: "Today's Mission",
    body: 'Ship one meaningful improvement, study market signals for 30 minutes, and close the day with a clear operating review.',
    status: '3 of 5 actions queued',
    icon: Rocket,
  },
  focus: [
    'Finish React routing and UI system',
    'Practice sales storytelling',
    'Review AI startup funding trends',
    'Train for 35 minutes',
  ],
  coach: {
    title: 'AI Coach Advice',
    body: 'Your best leverage today is sequencing: complete the visible product layer first, then turn feedback into sharper monetization assumptions.',
  },
  achievements: [
    { label: '42-day streak', icon: Flame, tone: 'text-ember' },
    { label: 'Skill sprint completed', icon: Trophy, tone: 'text-champagne' },
    { label: 'Budget review done', icon: WalletCards, tone: 'text-mint' },
  ],
  dailyChallenge: {
    title: 'Daily Challenge',
    body: 'Write a 90-second pitch for one business idea and record yourself delivering it.',
    reward: '+40 discipline XP',
  },
};

export const weeklyProgress = [
  { day: 'Mon', growth: 72, habits: 64, learning: 2.5 },
  { day: 'Tue', growth: 78, habits: 72, learning: 3.1 },
  { day: 'Wed', growth: 82, habits: 81, learning: 3.6 },
  { day: 'Thu', growth: 79, habits: 74, learning: 2.4 },
  { day: 'Fri', growth: 86, habits: 84, learning: 4.2 },
  { day: 'Sat', growth: 90, habits: 88, learning: 3.8 },
  { day: 'Sun', growth: 88, habits: 91, learning: 3.3 },
];

export const completionStats = [
  { label: 'Goal Completion', value: 78, icon: Target, color: '#F7D88A' },
  { label: 'Habit Completion', value: 91, icon: CalendarCheck, color: '#5EF1B6' },
  { label: 'Income Growth', value: 36, icon: ChartNoAxesCombined, color: '#6EC6FF' },
  { label: 'Knowledge Growth', value: 84, icon: Brain, color: '#B38CFF' },
];

export const incomeData = [
  { month: 'Jan', income: 2400, assets: 11000 },
  { month: 'Feb', income: 2700, assets: 12200 },
  { month: 'Mar', income: 3150, assets: 13800 },
  { month: 'Apr', income: 3500, assets: 15150 },
  { month: 'May', income: 4100, assets: 17400 },
  { month: 'Jun', income: 4800, assets: 20100 },
];

export const notifications = [
  { title: 'AI briefing ready', body: '7 market signals summarized for your startup watchlist.', icon: Sparkles, time: '4m' },
  { title: 'Habit streak protected', body: 'You completed deep work before noon.', icon: ShieldCheck, time: '1h' },
  { title: 'Goal risk detected', body: 'Business validation milestone needs two outreach actions.', icon: Bell, time: '3h' },
];

export const onboardingScreens = [
  {
    title: 'Design your operating system',
    body: 'Pick the growth pillars RiseOS AI should optimize first.',
    chips: ['Founder Mode', 'Career Acceleration', 'Financial Literacy', 'Deep Work'],
  },
  {
    title: 'Connect daily discipline',
    body: 'Turn habits, journals, skills, and goals into one intelligent feedback loop.',
    chips: ['Habits', 'Journal', 'Skill Sprints', 'Weekly Reviews'],
  },
  {
    title: 'Upgrade decisions',
    body: 'Use AI coaching and world intelligence to spot better actions earlier.',
    chips: ['AI Coach', 'News Signals', 'Business Ideas', 'Analytics'],
  },
];

export const authBenefits = [
  'AI growth dashboard',
  'Habit and goal intelligence',
  'Business and wealth education',
  'Premium daily briefings',
];

export const chatHistory = [
  { role: 'assistant', content: 'Welcome back, Kavin. What decision are we sharpening today?' },
  { role: 'user', content: 'Help me plan a focused week for AI product building.' },
  {
    role: 'assistant',
    content:
      'Anchor the week around one shipped prototype, ten user conversations, and one monetization experiment. Keep learning blocks close to the build work.',
  },
];

export const suggestedPrompts = [
  { title: 'Career coaching', prompt: 'Help me build a 90-day career acceleration plan.', icon: BriefcaseBusiness },
  { title: 'Business coaching', prompt: 'Evaluate my SaaS idea and suggest next validation steps.', icon: Building2 },
  { title: 'Financial education', prompt: 'Explain asset allocation for a beginner with examples.', icon: Landmark },
  { title: 'Communication', prompt: 'Coach me to speak with more executive presence.', icon: Mic },
  { title: 'Productivity', prompt: 'Design a deep work system for my current goals.', icon: Activity },
  { title: 'Life planning', prompt: 'Turn my five-year vision into measurable quarterly actions.', icon: Crown },
];

export const aiActionCards = [
  { title: 'Decision Audit', body: 'Analyze one major choice with upside, downside, and second-order effects.' },
  { title: 'Skill Sprint', body: 'Convert a skill target into seven days of practice prompts.' },
  { title: 'Founder Debrief', body: 'Review market, user, product, and revenue assumptions.' },
];

export const journalSections = [
  'What I Learned Today',
  'What I Built Today',
  'Wins',
  'Failures',
  'Lessons',
  'Expenses',
  'Income',
  'Networking Activity',
  'Health Activity',
];

export const journalAnalysis = [
  { label: 'Strengths', body: 'High completion energy, strong technical learning, and clear bias toward shipping.' },
  { label: 'Weaknesses', body: 'Networking and sales practice trail behind product output.' },
  { label: 'Opportunities', body: 'Turn today’s build into outreach material for early customer discovery.' },
  { label: "Tomorrow's Action Plan", body: 'Run a 90-minute build block, send five outreach messages, and close with a written pitch review.' },
];

export const newsCategories = ['AI', 'Technology', 'Business', 'Startups', 'Finance', 'Global Economy', 'India', 'Manufacturing', 'Innovation'];

export const newsCards = [
  {
    category: 'AI',
    headline: 'Enterprise AI agents move from pilots to operating workflows',
    summary: 'Large companies are shifting from isolated AI demos toward task-specific agents connected to internal tools and approval systems.',
    impact: 92,
    career: 'Learn agent orchestration, evaluation, and workflow design.',
    business: 'Build focused AI services for compliance-heavy teams.',
    investment: 'Track infrastructure, observability, and security layers.',
  },
  {
    category: 'Startups',
    headline: 'Vertical SaaS founders bundle software, payments, and analytics',
    summary: 'Operators in niche markets are favoring platforms that own more of the business process instead of narrow point tools.',
    impact: 84,
    career: 'Study one industry deeply and map daily operator pain.',
    business: 'Prototype workflow-first dashboards for one underserved niche.',
    investment: 'Watch sectors with fragmented vendors and recurring transactions.',
  },
  {
    category: 'India',
    headline: 'India’s manufacturing stack attracts precision supply-chain startups',
    summary: 'New digital layers are helping factories improve visibility, quality control, and supplier coordination.',
    impact: 81,
    career: 'Pair software skills with manufacturing domain knowledge.',
    business: 'Offer inspection, procurement, or analytics products for SMEs.',
    investment: 'Follow automation, logistics, and industrial data companies.',
  },
  {
    category: 'Finance',
    headline: 'Retail investors demand clearer education around long-term allocation',
    summary: 'Platforms are adding learning-first experiences that explain risk, diversification, and compounding without hype.',
    impact: 76,
    career: 'Build financial literacy content and UX systems.',
    business: 'Create educational budgeting and portfolio simulation tools.',
    investment: 'Prioritize fundamentals over trend chasing.',
  },
  {
    category: 'Innovation',
    headline: 'No-code and AI coding tools reshape early product validation',
    summary: 'Small teams can now create polished prototypes faster, raising the bar for customer discovery and distribution.',
    impact: 88,
    career: 'Develop product taste, testing discipline, and prompt fluency.',
    business: 'Launch narrower MVPs and validate pricing sooner.',
    investment: 'Look for tools that reduce the build-test-learning cycle.',
  },
  {
    category: 'Global Economy',
    headline: 'Founders model resilience as rates, trade, and currency risks shift',
    summary: 'Business planning increasingly includes scenario analysis around margins, capital access, and geographic exposure.',
    impact: 73,
    career: 'Strengthen financial modeling and macro interpretation.',
    business: 'Build decision dashboards for small exporters and service firms.',
    investment: 'Balance growth exposure with cash-flow quality.',
  },
];

export const skillTracks = [
  { name: 'Programming', level: 'Advanced', progress: 86, weeklyGrowth: '+6h', color: '#6EC6FF' },
  { name: 'AI Skills', level: 'Advanced', progress: 82, weeklyGrowth: '+8h', color: '#F7D88A' },
  { name: 'Sales', level: 'Intermediate', progress: 54, weeklyGrowth: '+2h', color: '#FF6B4A' },
  { name: 'Communication', level: 'Intermediate', progress: 61, weeklyGrowth: '+3h', color: '#B38CFF' },
  { name: 'Leadership', level: 'Growing', progress: 49, weeklyGrowth: '+2h', color: '#5EF1B6' },
  { name: 'Marketing', level: 'Intermediate', progress: 57, weeklyGrowth: '+2.5h', color: '#F7D88A' },
  { name: 'Finance', level: 'Foundational', progress: 42, weeklyGrowth: '+1.5h', color: '#6EC6FF' },
  { name: 'Business Strategy', level: 'Intermediate', progress: 63, weeklyGrowth: '+4h', color: '#5EF1B6' },
  { name: 'Networking', level: 'Foundational', progress: 38, weeklyGrowth: '+1h', color: '#FF6B4A' },
];

export const learningRecommendations = [
  'Run one mock sales call every day for a week.',
  'Build a small AI agent with memory, tools, and evaluation logs.',
  'Read one annual report and summarize the business model.',
  'Publish a weekly build log to attract collaborators.',
];

export const skillProgressData = [
  { week: 'W1', programming: 68, ai: 62, sales: 34, finance: 28 },
  { week: 'W2', programming: 72, ai: 68, sales: 39, finance: 31 },
  { week: 'W3', programming: 78, ai: 74, sales: 45, finance: 36 },
  { week: 'W4', programming: 86, ai: 82, sales: 54, finance: 42 },
];

export const businessLab = {
  generatedIdea:
    'AI-powered operating dashboard for small manufacturing owners that combines order tracking, cash-flow warnings, supplier follow-ups, and daily performance summaries.',
  startupBuilder: [
    { label: 'Customer', value: 'Small manufacturing operators' },
    { label: 'Pain', value: 'Low visibility across orders, suppliers, cash, and quality' },
    { label: 'MVP', value: 'WhatsApp intake + dashboard + weekly AI brief' },
    { label: 'Pricing', value: 'Subscription plus implementation support' },
  ],
  revenueModel: [
    { stream: 'SaaS subscription', potential: 'High', confidence: 76 },
    { stream: 'Setup fee', potential: 'Medium', confidence: 68 },
    { stream: 'Premium analytics', potential: 'High', confidence: 61 },
  ],
  swot: [
    { title: 'Strengths', body: 'Clear pain, recurring workflow, strong AI summarization fit.' },
    { title: 'Weaknesses', body: 'Requires domain trust and integrations.' },
    { title: 'Opportunities', body: 'India SME digitization and manufacturing growth.' },
    { title: 'Threats', body: 'ERP vendors and low willingness to switch.' },
  ],
  competitors: ['Zoho Creator', 'Tally integrations', 'Custom ERP vendors', 'Factory digitization consultants'],
};

export const wealthModules = [
  { title: 'Financial Literacy', progress: 74, icon: BookOpen },
  { title: 'Budget Tracking', progress: 82, icon: WalletCards },
  { title: 'Investment Learning', progress: 58, icon: LineChart },
  { title: 'Wealth Principles', progress: 69, icon: Crown },
  { title: 'Asset Building', progress: 45, icon: Landmark },
];

export const wealthTimeline = [
  { year: '2026', title: 'Build cash discipline', body: 'Track expenses, emergency fund, and earning skills.' },
  { year: '2027', title: 'Increase income engines', body: 'Freelance, productize services, and validate startup revenue.' },
  { year: '2028', title: 'Acquire assets', body: 'Study diversified investing and durable cash-flow assets.' },
  { year: '2030', title: 'Scale allocation', body: 'Improve systems, risk management, and compounding behavior.' },
];

export const assetAllocation = [
  { name: 'Learning', value: 25, fill: '#F7D88A' },
  { name: 'Emergency Fund', value: 20, fill: '#5EF1B6' },
  { name: 'Index Funds', value: 30, fill: '#6EC6FF' },
  { name: 'Business', value: 15, fill: '#B38CFF' },
  { name: 'Experiments', value: 10, fill: '#FF6B4A' },
];

export const goals = [
  {
    type: 'Career',
    title: 'Become an AI product engineer',
    progress: 76,
    prediction: '11 weeks',
    milestones: ['Portfolio MVP', 'Case study', 'Interview practice'],
  },
  {
    type: 'Business',
    title: 'Validate first SaaS revenue',
    progress: 44,
    prediction: '16 weeks',
    milestones: ['Landing page', '10 calls', 'Paid pilot'],
  },
  {
    type: 'Health',
    title: 'Train 5 days per week',
    progress: 82,
    prediction: 'On track',
    milestones: ['Strength baseline', 'Nutrition review', 'Sleep consistency'],
  },
  {
    type: 'Learning',
    title: 'Master AI agent architecture',
    progress: 67,
    prediction: '8 weeks',
    milestones: ['Tool use', 'Memory systems', 'Evaluation'],
  },
  {
    type: 'Financial',
    title: 'Build six-month emergency fund',
    progress: 39,
    prediction: '7 months',
    milestones: ['Budget', 'Savings automation', 'Review spending'],
  },
];

export const achievementTimeline = [
  { date: 'Jun 3', event: 'Completed weekly review', icon: BadgeCheck },
  { date: 'Jun 1', event: 'Reached 40-day streak', icon: Flame },
  { date: 'May 28', event: 'Built first AI dashboard prototype', icon: Rocket },
  { date: 'May 22', event: 'Finished finance fundamentals module', icon: Landmark },
];

export const analyticsData = [
  { month: 'Jan', growth: 58, habits: 54, learning: 24, income: 2400, productivity: 62, skills: 48 },
  { month: 'Feb', growth: 63, habits: 61, learning: 30, income: 2700, productivity: 67, skills: 54 },
  { month: 'Mar', growth: 69, habits: 68, learning: 36, income: 3150, productivity: 70, skills: 61 },
  { month: 'Apr', growth: 75, habits: 72, learning: 42, income: 3500, productivity: 78, skills: 67 },
  { month: 'May', growth: 82, habits: 84, learning: 49, income: 4100, productivity: 83, skills: 75 },
  { month: 'Jun', growth: 88, habits: 91, learning: 54, income: 4800, productivity: 86, skills: 82 },
];

export const profileStats = [
  { label: 'Growth XP', value: '18,420' },
  { label: 'Completed Goals', value: '23' },
  { label: 'Learning Hours', value: '312' },
  { label: 'Journal Entries', value: '96' },
];

export const achievementBadges = [
  { title: 'Deep Work Elite', icon: Zap },
  { title: 'Founder Sprint', icon: Rocket },
  { title: 'Financial Student', icon: Landmark },
  { title: 'Health Discipline', icon: Dumbbell },
  { title: 'Global Reader', icon: Globe2 },
  { title: 'Skill Builder', icon: GraduationCap },
];

export const activityHistory = [
  'Completed AI skills sprint',
  'Logged expenses and income',
  'Generated business model canvas',
  'Reviewed global economy briefing',
  'Updated career milestones',
];

export const settingsGroups = [
  {
    title: 'Experience',
    items: [
      { label: 'Dark mode', enabled: true, icon: Sparkles },
      { label: 'Notifications', enabled: true, icon: Bell },
      { label: 'AI Preferences', enabled: true, icon: Brain },
    ],
  },
  {
    title: 'Protection',
    items: [
      { label: 'Privacy', enabled: true, icon: ShieldCheck },
      { label: 'Security', enabled: true, icon: Lock },
      { label: 'Data Export', enabled: false, icon: WalletCards },
    ],
  },
];
