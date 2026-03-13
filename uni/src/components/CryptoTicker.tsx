"use client";

interface CryptoTickerCoin {
  symbol: string;
  name: string;
  price: string;
  change24h: number;
}

interface CryptoTickerProps {
  coins: CryptoTickerCoin[];
}

export function CryptoTicker({ coins }: CryptoTickerProps) {
  if (coins.length === 0) return null;

  const items = [...coins, ...coins];

  return (
    <div className="bg-foreground text-background overflow-hidden relative">
      <div className="flex items-center">
        {/* Fixed label */}
        <div className="shrink-0 bg-destructive px-4 py-2 z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-editorial text-white">Crypto Live</span>
          </div>
        </div>

        {/* Scrolling prices */}
        <div className="overflow-hidden flex-1">
          <div className="flex animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused]">
            {items.map((coin, i) => (
              <div
                key={`${coin.symbol}-${i}`}
                className="flex items-center gap-2 px-4 py-2 shrink-0 text-xs"
              >
                <span className="font-bold text-background/90">{coin.symbol}</span>
                <span className="text-background/60">{coin.price}</span>
                <span className={`font-semibold ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </span>
                <span className="text-background/20 ml-2">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
