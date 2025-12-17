import { useState, useEffect, useCallback } from "react";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  isUp: boolean;
}

// Prices in USD per 1 unit of crypto
interface CryptoPriceData {
  BTC: number;
  ETH: number;
  SOL: number;
  XRP: number;
  USDT: number;
}

export const useCryptoPrices = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>([
    { symbol: "BTC/USD", name: "Bitcoin", price: 0, change24h: 0, isUp: true },
    { symbol: "ETH/USD", name: "Ethereum", price: 0, change24h: 0, isUp: true },
    { symbol: "SOL/USD", name: "Solana", price: 0, change24h: 0, isUp: true },
    { symbol: "XRP/USD", name: "Ripple", price: 0, change24h: 0, isUp: true },
  ]);
  const [priceData, setPriceData] = useState<CryptoPriceData>({
    BTC: 0,
    ETH: 0,
    SOL: 0,
    XRP: 0,
    USDT: 1
  });
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,tether&vs_currencies=usd&include_24hr_change=true"
      );
      const data = await response.json();

      const updatedPrices: CryptoPrice[] = [
        {
          symbol: "BTC/USD",
          name: "Bitcoin",
          price: data.bitcoin?.usd ?? 0,
          change24h: data.bitcoin?.usd_24h_change ?? 0,
          isUp: (data.bitcoin?.usd_24h_change ?? 0) >= 0,
        },
        {
          symbol: "ETH/USD",
          name: "Ethereum",
          price: data.ethereum?.usd ?? 0,
          change24h: data.ethereum?.usd_24h_change ?? 0,
          isUp: (data.ethereum?.usd_24h_change ?? 0) >= 0,
        },
        {
          symbol: "SOL/USD",
          name: "Solana",
          price: data.solana?.usd ?? 0,
          change24h: data.solana?.usd_24h_change ?? 0,
          isUp: (data.solana?.usd_24h_change ?? 0) >= 0,
        },
        {
          symbol: "XRP/USD",
          name: "Ripple",
          price: data.ripple?.usd ?? 0,
          change24h: data.ripple?.usd_24h_change ?? 0,
          isUp: (data.ripple?.usd_24h_change ?? 0) >= 0,
        },
      ];

      // Store raw prices for conversion calculations
      setPriceData({
        BTC: data.bitcoin?.usd ?? 0,
        ETH: data.ethereum?.usd ?? 0,
        SOL: data.solana?.usd ?? 0,
        XRP: data.ripple?.usd ?? 0,
        USDT: data.tether?.usd ?? 1
      });

      setPrices(updatedPrices);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch crypto prices:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Helper function to convert USD to crypto
  const usdToCrypto = useCallback((usdAmount: number, crypto: keyof CryptoPriceData): number => {
    const price = priceData[crypto];
    if (price === 0) return 0;
    return usdAmount / price;
  }, [priceData]);

  // Helper function to convert crypto to USD
  const cryptoToUsd = useCallback((cryptoAmount: number, crypto: keyof CryptoPriceData): number => {
    return cryptoAmount * priceData[crypto];
  }, [priceData]);

  return { 
    prices, 
    priceData,
    loading, 
    refetch: fetchPrices,
    usdToCrypto,
    cryptoToUsd
  };
};
