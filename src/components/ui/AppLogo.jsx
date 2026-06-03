import { useState } from 'react';

export default function AppLogo({ className = 'size-11', imageClassName = 'p-1.5', showFallback = true }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-[8px] bg-gold-line text-night shadow-gold ${className}`}>
      {!failed ? (
        <img
          src="/logo.png"
          alt="RiseOS AI logo"
          className={`h-full w-full object-contain ${imageClassName}`}
          onError={() => setFailed(true)}
        />
      ) : (
        showFallback && <span className="text-lg font-black">R</span>
      )}
    </div>
  );
}
