import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMarketPrices } from "@/hooks/useMarketPrices";

const formatPrice = (price: number, symbol: string): string => {
  if (price === 0) return "...";
  
  // Forex pairs need more decimal places
  if (["EUR", "GBP"].includes(symbol)) {
    return price.toFixed(4);
  }
  // Large numbers like indices
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toFixed(2);
};

const formatChange = (change: number): string => {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
};

const MarketsSection = () => {
  const { markets, loading } = useMarketPrices();

  const marketCategories = [
    {
      category: "Crypto",
      icon: "₿",
      assets: markets.crypto,
    },
    {
      category: "Forex",
      icon: "💱",
      assets: markets.forex,
    },
    {
      category: "Indices",
      icon: "📊",
      assets: markets.indices,
    },
    {
      category: "Commodities",
      icon: "🥇",
      assets: markets.commodities,
    },
  ];

  return (
    <section id="markets" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trade <span className="text-gradient-primary">500+ Markets</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access a wide range of global markets from a single platform. 
            Trade crypto, forex, stocks, indices, and commodities with competitive spreads.
          </p>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketCategories.map((market) => (
            <Card key={market.category} variant="gradient" className="p-6 hover:border-primary/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{market.icon}</span>
                <h3 className="text-xl font-semibold">{market.category}</h3>
              </div>
              
              <div className="space-y-4">
                {market.assets.map((asset) => (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium text-foreground">
                        ${loading ? "..." : formatPrice(asset.price, asset.symbol)}
                      </p>
                      <p className={`text-sm flex items-center justify-end gap-1 ${asset.isUp ? "profit-text" : "loss-text"}`}>
                        {asset.isUp ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {loading ? "..." : formatChange(asset.change)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketsSection;
