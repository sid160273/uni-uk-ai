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

  const items = [...coins, ...coins]; // Duplicate for seamless scroll

  return (
    <div className="bg-gray-950 text-white overflow-hidden relative">
      <div className="flex items-center">
        {/* Fixed label */}
        <div className="shrink-0 bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-2 text-xs font-bold flex items-center gap-2 z-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
          </span>
          CRYPTO LIVE
        </div>

        {/* Scrolling prices */}
        <div className="overflow-hidden flex-1">
          <div className="flex animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused]">
            {items.map((coin, i) => (
              <div
                key={`${coin.symbol}-${i}`}
                className="flex items-center gap-2 px-4 py-2 shrink-0 text-xs"
              >
                <span className="font-bold text-yellow-400">{coin.symbol}</span>
                <span className="text-gray-300">{coin.price}</span>
                <span className={`font-medium ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                </span>
                <span className="text-gray-700 ml-2">|</span>
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
