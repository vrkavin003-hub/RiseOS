import axios from 'axios';
import { env } from '../config/env.js';
import News from '../models/News.js';
import { broadcast } from './realtime.js';

const categories = ['AI', 'Technology', 'Business', 'Finance', 'India', 'Global Economy', 'Manufacturing', 'Startups'];

export async function refreshNews() {
  if (!env.newsApiKey) return [];

  const { data } = await axios.get('https://newsapi.org/v2/everything', {
    params: {
      apiKey: env.newsApiKey,
      language: 'en',
      pageSize: 20,
      q: categories.join(' OR '),
      sortBy: 'publishedAt',
    },
  });

  const articles = await Promise.all(
    (data.articles || []).map((article) =>
      News.findOneAndUpdate(
        { url: article.url },
        {
          businessImpact: 'Look for customer pain, operational shifts, and new market openings.',
          careerImpact: 'Identify skills and roles becoming more valuable because of this trend.',
          category: 'Technology',
          headline: article.title,
          impactScore: 60,
          learningOpportunity: 'Summarize the article and extract one practical lesson.',
          publishedAt: article.publishedAt,
          source: article.source?.name || 'Unknown',
          summary: article.description || article.content || '',
          url: article.url,
        },
        { new: true, upsert: true },
      ),
    ),
  );

  broadcast('news:refresh', { count: articles.length });
  return articles;
}
