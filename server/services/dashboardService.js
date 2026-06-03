import Expense from '../models/Expense.js';
import Goal from '../models/Goal.js';
import Habit from '../models/Habit.js';
import Income from '../models/Income.js';
import Journal from '../models/Journal.js';
import Skill from '../models/Skill.js';

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function calculateDashboard(userId) {
  const [journalEntries, goals, habits, skills, expenses, incomes] = await Promise.all([
    Journal.find({ user: userId }).sort({ createdAt: -1 }).limit(30),
    Goal.find({ user: userId }),
    Habit.find({ user: userId }),
    Skill.find({ user: userId }),
    Expense.find({ user: userId }),
    Income.find({ user: userId }),
  ]);

  const learningHours = journalEntries.reduce((total, entry) => total + Number(entry.timeSpentLearning || 0), 0) + skills.reduce((total, skill) => total + Number(skill.learningHours || 0), 0);
  const completedGoals = goals.filter((goal) => goal.status === 'completed' || goal.progress >= 100).length;
  const habitCompletions = habits.reduce((total, habit) => total + habit.completions.length, 0);
  const averageSkill = skills.length ? skills.reduce((total, skill) => total + skill.progress, 0) / skills.length : 0;
  const totalIncome = incomes.reduce((total, item) => total + item.amount, 0) + journalEntries.reduce((total, entry) => total + Number(entry.income || 0), 0);
  const totalExpenses = expenses.reduce((total, item) => total + item.amount, 0) + journalEntries.reduce((total, entry) => total + Number(entry.expenses || 0), 0);
  const bestHabitStreak = habits.reduce((max, habit) => Math.max(max, habit.currentStreak || 0), 0);

  const disciplineScore = clamp(habitCompletions * 8 + bestHabitStreak * 4);
  const skillScore = clamp(averageSkill + learningHours * 2);
  const productivityScore = clamp(journalEntries.length * 7 + completedGoals * 12 + habitCompletions * 3);
  const wealthScore = clamp(totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 60 + incomes.length * 5 : 0);
  const healthScore = clamp(journalEntries.filter((entry) => entry.healthActivity).length * 8 + disciplineScore * 0.2);
  const growthScore = clamp((disciplineScore + skillScore + productivityScore + wealthScore + healthScore) / 5);

  return {
    disciplineScore,
    goalsCompleted: completedGoals,
    growthScore,
    habitCompletion: clamp(habitCompletions * 10),
    habitStreak: bestHabitStreak,
    healthScore,
    incomeTracked: totalIncome,
    journalEntries: journalEntries.length,
    learningHours,
    productivityScore,
    skillScore,
    wealthScore,
  };
}
