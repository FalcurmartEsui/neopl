import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useRef } from "react";

interface TradingViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
}

const symbolMap: Record<string, string> = {
  "BTC/USD": "BINANCE:BTCUSDT",
  "ETH/USD": "BINANCE:ETHUSDT",
  "SOL/USD": "BINANCE:SOLUSDT",
  "XRP/USD": "BINANCE:XRPUSDT",
};

const TradingViewModal = ({ open, onOpenChange, symbol }: TradingViewModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    const tradingViewSymbol = symbolMap[symbol] || "BINANCE:BTCUSDT";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tradingViewSymbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);
  }, [open, symbol]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{symbol} Chart</DialogTitle>
        </DialogHeader>
        <div 
          ref={containerRef} 
          className="tradingview-widget-container flex-1 min-h-0"
          style={{ height: "calc(100% - 60px)" }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TradingViewModal;
