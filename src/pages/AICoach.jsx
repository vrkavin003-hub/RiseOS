import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Clock3, Mic, Plus, Send, Sparkles, UserRound } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PremiumButton from '../components/ui/PremiumButton';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBanner from '../components/ui/StatusBanner';
import { aiActionCards, suggestedPrompts } from '../data/mockData';
import { useAIChats } from '../hooks/useAIChats';

function formatChatDate(value) {
  if (!value) return 'New';
  return new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export default function AICoach() {
  const {
    activeChatId,
    chats,
    error,
    isLoading,
    isSending,
    messages,
    selectChat,
    sendMessage,
    startNewChat,
  } = useAIChats();
  const [input, setInput] = useState('');
  const [activePrompt, setActivePrompt] = useState(suggestedPrompts[0].prompt);

  async function handleSubmit(event) {
    event?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setInput('');
    try {
      await sendMessage(trimmed);
    } catch {
      setInput(trimmed);
    }
  }

  function handlePrompt(prompt) {
    setActivePrompt(prompt);
    setInput(prompt);
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="AI Life Coach"
        title="Executive coaching for decisions, discipline, and skill growth"
        description="A ChatGPT-style coaching workspace for career strategy, business thinking, financial education, communication, productivity, life planning, and skill development."
        action={
          <PremiumButton icon={Plus} onClick={startNewChat} type="button">
            New session
          </PremiumButton>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-4">
          <GlassCard className="p-4">
            <h2 className="text-sm font-bold text-white">Suggested prompts</h2>
            <div className="mt-4 grid gap-3">
              {suggestedPrompts.map((item) => {
                const Icon = item.icon;
                const selected = activePrompt === item.prompt;
                return (
                  <button
                    key={item.title}
                    className={`focus-ring rounded-[8px] border p-3 text-left transition ${
                      selected ? 'border-champagne/40 bg-champagne/12' : 'border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                    onClick={() => handlePrompt(item.prompt)}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-[8px] bg-white/8 text-champagne">
                        <Icon size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-steel">{item.prompt}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h2 className="text-sm font-bold text-white">Recent sessions</h2>
            <div className="mt-4 grid gap-3">
              {isLoading ? (
                <LoadingSkeleton rows={3} />
              ) : chats.length > 0 ? (
                chats.slice(0, 6).map((chat) => (
                  <button
                    className={`focus-ring rounded-[8px] border p-3 text-left transition ${
                      activeChatId === chat._id ? 'border-champagne/40 bg-champagne/12' : 'border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                    key={chat._id}
                    onClick={() => selectChat(chat._id)}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid size-9 place-items-center rounded-[8px] bg-white/8 text-champagne">
                        <Clock3 size={16} />
                      </div>
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-white">{chat.title}</p>
                        <p className="mt-1 text-xs leading-5 text-steel">{formatChatDate(chat.updatedAt)} | {chat.messages?.length || 0} messages</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3 text-sm leading-6 text-steel">
                  Your saved coaching sessions will appear here.
                </p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h2 className="text-sm font-bold text-white">AI action cards</h2>
            <div className="mt-4 space-y-3">
              {aiActionCards.map((card) => (
                <button
                  key={card.title}
                  className="focus-ring w-full rounded-[8px] border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-champagne/30 hover:bg-white/[0.07]"
                  onClick={() => handlePrompt(`${card.title}: ${card.body}`)}
                  type="button"
                >
                  <div className="flex items-center gap-2 text-champagne">
                    <Sparkles size={16} />
                    <h3 className="text-sm font-bold">{card.title}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-steel">{card.body}</p>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="flex min-h-[680px] flex-col overflow-hidden p-0">
          <div className="border-b border-white/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">RiseOS Coach</h2>
                <p className="text-sm text-steel">Personalized recommendations based on goals, habits, journal, skill, and wealth signals.</p>
              </div>
              <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${isSending ? 'border-champagne/20 bg-champagne/10 text-champagne' : 'border-mint/20 bg-mint/10 text-mint'}`}>
                <span className={`size-2 rounded-full ${isSending ? 'bg-champagne' : 'bg-mint'}`} />
                {isSending ? 'Thinking' : 'Ready'}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <StatusBanner>{error}</StatusBanner>
            {isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  return (
                    <motion.div
                      key={`${message.role}-${index}-${message.content.slice(0, 8)}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-gold-line text-night">
                          <Bot size={18} />
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] whitespace-pre-line rounded-[8px] border p-4 text-sm leading-6 ${
                          isUser
                            ? 'border-champagne/25 bg-champagne/12 text-white'
                            : 'border-white/10 bg-white/[0.055] text-steel'
                        }`}
                      >
                        {message.content}
                      </div>
                      {isUser && (
                        <div className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-white/8 text-white">
                          <UserRound size={18} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {isSending && (
                  <motion.div
                    key="assistant-thinking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-gold-line text-night">
                      <Bot size={18} />
                    </div>
                    <div className="rounded-[8px] border border-white/10 bg-white/[0.055] p-4 text-sm leading-6 text-steel">
                      Thinking through the next useful move...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          <form className="border-t border-white/10 p-4" onSubmit={handleSubmit}>
            <div className="mb-3 flex flex-wrap gap-2">
              {['Career plan', 'Business idea', 'Communication drill'].map((quick) => (
                <button
                  key={quick}
                  className="focus-ring rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-steel transition hover:border-champagne/30 hover:text-white"
                  onClick={() => setInput(`Coach me on: ${quick}`)}
                  type="button"
                >
                  {quick}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-2">
              <textarea
                className="focus-ring min-h-12 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-white placeholder:text-steel"
                disabled={isSending}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                placeholder="Ask for coaching, planning, analysis, or practice..."
                value={input}
              />
              <button className="focus-ring grid size-11 shrink-0 place-items-center rounded-[8px] border border-white/10 text-steel transition hover:text-white" aria-label="Voice input" type="button">
                <Mic size={19} />
              </button>
              <button
                aria-label="Send message"
                className="focus-ring grid size-11 shrink-0 place-items-center rounded-[8px] bg-gold-line text-night shadow-gold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending || !input.trim()}
                type="submit"
              >
                <Send size={19} />
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
