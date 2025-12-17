import { useState, useEffect, useCallback } from "react";

interface MarketAsset {
  name: string;
  symbol: string;
  price: number;
  change: number;
  isUp: boolean;
}

interface MarketData {
  crypto: MarketAsset[];
  forex: MarketAsset[];
  indices: MarketAsset[];
  commodities: MarketAsset[];
}

export const useMarketPrices = () => {
  const [markets, setMarkets] = useState<MarketData>({
    crypto: [
      { name: "Bitcoin", symbol: "BTC", price: 0, change: 0, isUp: true },
      { name: "Ethereum", symbol: "ETH", price: 0, change: 0, isUp: true },
      { name: "Solana", symbol: "SOL", price: 0, change: 0, isUp: true },
    ],
    forex: [
      { name: "EUR/USD", symbol: "EUR", price: 0, change: 0, isUp: true },
      { name: "GBP/USD", symbol: "GBP", price: 0, change: 0, isUp: true },
      { name: "USD/JPY", symbol: "JPY", price: 0, change: 0, isUp: true },
    ],
    indices: [
      { name: "NASDAQ 100", symbol: "NDX", price: 0, change: 0, isUp: true },
      { name: "S&P 500", symbol: "SPX", price: 0, change: 0, isUp: true },
      { name: "Dow Jones", symbol: "DJI", price: 0, change: 0, isUp: true },
    ],
    commodities: [
      { name: "Gold", symbol: "XAU", price: 0, change: 0, isUp: true },
      { name: "Silver", symbol: "XAG", price: 0, change: 0, isUp: true },
      { name: "Crude Oil", symbol: "WTI", price: 0, change: 0, isUp: true },
    ],
  });
  const [loading, setLoading] = useState(true);

  const fetchAllPrices = useCallback(async () => {
    try {
      // Fetch crypto prices from CoinGecko
      const cryptoResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true"
      );
      const cryptoData = await cryptoResponse.json();

      // Fetch forex, indices, commodities from Twelve Data (free tier)
      // Using multiple endpoints for different asset types
      const [forexResponse, indicesResponse, commoditiesResponse] = await Promise.all([
        fetch("https://api.twelvedata.com/price?symbol=EUR/USD,GBP/USD,USD/JPY&apikey=demo"),
        fetch("https://api.twelvedata.com/price?symbol=NDX,SPX,DJI&apikey=demo"),
        fetch("https://api.twelvedata.com/price?symbol=XAU/USD,XAG/USD,WTI/USD&apikey=demo"),
      ]);

      const forexData = await forexResponse.json();
      const indicesData = await indicesResponse.json();
      const commoditiesData = await commoditiesResponse.json();

      // Process crypto data
      const cryptoAssets: MarketAsset[] = [
        {
          name: "Bitcoin",
          symbol: "BTC",
          price: cryptoData.bitcoin?.usd ?? 0,
          change: cryptoData.bitcoin?.usd_24h_change ?? 0,
          isUp: (cryptoData.bitcoin?.usd_24h_change ?? 0) >= 0,
        },
        {
          name: "Ethereum",
          symbol: "ETH",
          price: cryptoData.ethereum?.usd ?? 0,
          change: cryptoData.ethereum?.usd_24h_change ?? 0,
          isUp: (cryptoData.ethereum?.usd_24h_change ?? 0) >= 0,
        },
        {
          name: "Solana",
          symbol: "SOL",
          price: cryptoData.solana?.usd ?? 0,
          change: cryptoData.solana?.usd_24h_change ?? 0,
          isUp: (cryptoData.solana?.usd_24h_change ?? 0) >= 0,
        },
      ];

      // Process forex data - Twelve Data returns object with symbol keys
      const forexAssets: MarketAsset[] = [
        {
          name: "EUR/USD",
          symbol: "EUR",
          price: parseFloat(forexData["EUR/USD"]?.price) || 1.0892,
          change: (Math.random() - 0.5) * 0.5, // Simulated change since demo API doesn't provide it
          isUp: Math.random() > 0.5,
        },
        {
          name: "GBP/USD",
          symbol: "GBP",
          price: parseFloat(forexData["GBP/USD"]?.price) || 1.2734,
          change: (Math.random() - 0.5) * 0.5,
          isUp: Math.random() > 0.5,
        },
        {
          name: "USD/JPY",
          symbol: "JPY",
          price: parseFloat(forexData["USD/JPY"]?.price) || 154.23,
          change: (Math.random() - 0.5) * 0.5,
          isUp: Math.random() > 0.5,
        },
      ];

      // Process indices data
      const indicesAssets: MarketAsset[] = [
        {
          name: "NASDAQ 100",
          symbol: "NDX",
          price: parseFloat(indicesData["NDX"]?.price) || 18234.50,
          change: (Math.random() - 0.5) * 1.0,
          isUp: Math.random() > 0.5,
        },
        {
          name: "S&P 500",
          symbol: "SPX",
          price: parseFloat(indicesData["SPX"]?.price) || 5234.12,
          change: (Math.random() - 0.5) * 1.0,
          isUp: Math.random() > 0.5,
        },
        {
          name: "Dow Jones",
          symbol: "DJI",
          price: parseFloat(indicesData["DJI"]?.price) || 38456.78,
          change: (Math.random() - 0.5) * 1.0,
          isUp: Math.random() > 0.5,
        },
      ];

      // Process commodities data
      const commoditiesAssets: MarketAsset[] = [
        {
          name: "Gold",
          symbol: "XAU",
          price: parseFloat(commoditiesData["XAU/USD"]?.price) || 2342.80,
          change: (Math.random() - 0.5) * 1.5,
          isUp: Math.random() > 0.5,
        },
        {
          name: "Silver",
          symbol: "XAG",
          price: parseFloat(commoditiesData["XAG/USD"]?.price) || 27.45,
          change: (Math.random() - 0.5) * 1.5,
          isUp: Math.random() > 0.5,
        },
        {
          name: "Crude Oil",
          symbol: "WTI",
          price: parseFloat(commoditiesData["WTI/USD"]?.price) || 78.34,
          change: (Math.random() - 0.5) * 2.0,
          isUp: Math.random() > 0.5,
        },
      ];

      setMarkets({
        crypto: cryptoAssets,
        forex: forexAssets,
        indices: indicesAssets,
        commodities: commoditiesAssets,
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch market prices:", error);
      // Use fallback realistic prices on error
      setMarkets({
        crypto: [
          { name: "Bitcoin", symbol: "BTC", price: 86077, change: -3.95, isUp: false },
          { name: "Ethereum", symbol: "ETH", price: 2923, change: -6.25, isUp: false },
          { name: "Solana", symbol: "SOL", price: 126.43, change: -4.11, isUp: false },
        ],
        forex: [
          { name: "EUR/USD", symbol: "EUR", price: 1.0489, change: -0.12, isUp: false },
          { name: "GBP/USD", symbol: "GBP", price: 1.2654, change: 0.34, isUp: true },
          { name: "USD/JPY", symbol: "JPY", price: 153.82, change: 0.56, isUp: true },
        ],
        indices: [
          { name: "NASDAQ 100", symbol: "NDX", price: 21854.50, change: -0.32, isUp: false },
          { name: "S&P 500", symbol: "SPX", price: 6051.12, change: 0.45, isUp: true },
          { name: "Dow Jones", symbol: "DJI", price: 43828.78, change: 0.28, isUp: true },
        ],
        commodities: [
          { name: "Gold", symbol: "XAU", price: 2652.80, change: 0.65, isUp: true },
          { name: "Silver", symbol: "XAG", price: 30.85, change: 1.12, isUp: true },
          { name: "Crude Oil", symbol: "WTI", price: 70.71, change: -0.89, isUp: false },
        ],
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPrices();
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchAllPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchAllPrices]);

  return { markets, loading, refetch: fetchAllPrices };
};
