import { useState, useEffect, useCallback } from "react";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  isUp: boolean;
}

// Extended list of supported cryptocurrencies
const SUPPORTED_CRYPTOS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "Ripple" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap" },
  { id: "polygon", symbol: "MATIC", name: "Polygon" },
  { id: "tron", symbol: "TRX", name: "TRON" },
  { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu" },
  { id: "stellar", symbol: "XLM", name: "Stellar" },
  { id: "cosmos", symbol: "ATOM", name: "Cosmos" },
  { id: "near", symbol: "NEAR", name: "NEAR Protocol" },
  { id: "aptos", symbol: "APT", name: "Aptos" },
  { id: "sui", symbol: "SUI", name: "Sui" },
];

export const useExtendedCryptoPrices = () => {
  const [allCryptos, setAllCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    try {
      const ids = SUPPORTED_CRYPTOS.map(c => c.id).join(",");
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      const data = await response.json();

      const updatedCryptos: CryptoData[] = SUPPORTED_CRYPTOS.map((crypto) => {
        const priceData = data[crypto.id];
        return {
          id: crypto.id,
          symbol: crypto.symbol,
          name: crypto.name,
          price: priceData?.usd ?? 0,
          change24h: priceData?.usd_24h_change ?? 0,
          isUp: (priceData?.usd_24h_change ?? 0) >= 0,
        };
      }).filter(c => c.price > 0); // Filter out cryptos with no price data

      setAllCryptos(updatedCryptos);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch extended crypto prices:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { allCryptos, loading, refetch: fetchPrices };
};
