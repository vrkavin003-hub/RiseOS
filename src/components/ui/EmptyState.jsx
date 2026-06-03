import { Inbox } from 'lucide-react';
import PremiumButton from './PremiumButton';

export default function EmptyState({ title = 'Nothing here yet', body = 'Your next action will appear here once you create it.', action = 'Create' }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-[8px] border border-dashed border-white/14 bg-white/[0.03] p-6 text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-white/8 text-champagne">
          <Inbox size={22} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-steel">{body}</p>
        <PremiumButton className="mt-4" variant="ghost">
          {action}
        </PremiumButton>
      </div>
    </div>
  );
}
