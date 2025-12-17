import { TrendingUp, TrendingDown } from "lucide-react";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

// Static data for non-crypto assets
const staticData = [
  { symbol: "NASDAQ", price: 18234.50, change: -0.32, isUp: false },
  { symbol: "GOLD", price: 2342.80, change: 0.65, isUp: true },
  { symbol: "EUR/USD", price: 1.0892, change: -0.12, isUp: false },
  { symbol: "S&P 500", price: 5234.12, change: 0.45, isUp: true },
];

const TickerBar = () => {
  const { prices, loading } = useCryptoPrices();

  // Combine live crypto prices with static data
  const tickerData = [
    ...prices.map(p => ({
      symbol: p.symbol,
      price: p.price,
      change: p.change24h,
      isUp: p.isUp,
      isCrypto: true
    })),
    ...staticData.map(s => ({
      ...s,
      isCrypto: false
    }))
  ];

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === "EUR/USD") {
      return price.toFixed(4);
    }
    if (price >= 1000) {
      return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return price.toFixed(2);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="bg-secondary/50 border-y border-border overflow-hidden">
      <div className="flex animate-ticker">
        {[...tickerData, ...tickerData].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-8 py-3 border-r border-border/50 min-w-max"
          >
            <span className="font-semibold text-foreground">{item.symbol}</span>
            <span className="font-mono text-foreground">
              ${loading && item.isCrypto ? "..." : formatPrice(item.price, item.symbol)}
            </span>
            <span className={`flex items-center gap-1 font-medium ${item.isUp ? "profit-text" : "loss-text"}`}>
              {item.isUp ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {loading && item.isCrypto ? "..." : formatChange(item.change)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerBar;
