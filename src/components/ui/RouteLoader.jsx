import AppLogo from './AppLogo';

export default function RouteLoader({ message = 'Loading workspace' }) {
  return (
    <div className="page-shell" aria-busy="true" role="status">
      <div className="glass-panel rounded-[8px] p-5">
        <div className="flex items-center gap-3">
          <AppLogo className="size-12" />
          <div>
            <span className="sr-only">{message}</span>
            <div className="h-4 w-28 animate-pulse rounded-full bg-white/8" />
            <div className="mt-2 h-3 w-44 animate-pulse rounded-full bg-white/7" />
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="h-28 animate-pulse rounded-[8px] bg-white/7" />
          <div className="h-28 animate-pulse rounded-[8px] bg-white/7" />
          <div className="h-28 animate-pulse rounded-[8px] bg-white/7" />
        </div>
      </div>
    </div>
  );
}
