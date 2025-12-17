import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Search,
  Settings,
  Bell,
  LogOut,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { useBalance } from "@/hooks/useBalance";
import { useTrades } from "@/hooks/useTrades";

const assets = [
  {
    symbol: "BTC/USD",
    name: "Bitcoin",
    price: 67542.3,
    change: "+2.45%",
    isUp: true,
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum",
    price: 3892.15,
    change: "+1.82%",
    isUp: true,
  },
  {
    symbol: "SOL/USD",
    name: "Solana",
    price: 185.42,
    change: "+5.23%",
    isUp: true,
  },
  {
    symbol: "XRP/USD",
    name: "Ripple",
    price: 0.5423,
    change: "-1.24%",
    isUp: false,
  },
  {
    symbol: "NASDAQ",
    name: "NASDAQ 100",
    price: 18234.5,
    change: "-0.32%",
    isUp: false,
  },
  { symbol: "GOLD", name: "Gold", price: 2342.8, change: "+0.65%", isUp: true },
  {
    symbol: "EUR/USD",
    name: "Euro/USD",
    price: 1.0892,
    change: "-0.12%",
    isUp: false,
  },
];

const Terminal = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [leverage, setLeverage] = useState("10");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { balance } = useBalance(user);
  const { openTrades, closeTrade, openTrade } = useTrades(user, false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    // Load TradingView widget
    if (chartContainerRef.current && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).TradingView) {
          new (window as any).TradingView.widget({
            autosize: true,
            symbol: "BINANCE:BTCUSDT",
            interval: "15",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#0a0b0d",
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            container_id: "tradingview_chart",
            backgroundColor: "rgba(10, 11, 13, 1)",
            gridColor: "rgba(42, 46, 57, 0.3)",
          });
        }
      };
      document.head.appendChild(script);
    }
  }, [loading, user]);

  const handleSubmitOrder = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const qty = parseFloat(amount);
    const entryPrice = selectedAsset.price;
    const lev = parseInt(leverage) || 1;
    const requiredMargin = (entryPrice * qty) / lev;

    if (requiredMargin > (balance?.balance ?? 0)) {
      toast.error("Insufficient margin");
      return;
    }

    setSubmitting(true);
    await openTrade({
      symbol: selectedAsset.symbol,
      side: orderSide,
      quantity: qty,
      entry_price: entryPrice,
      leverage: lev,
      stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
      take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
      order_type: orderType,
    });

    setSubmitting(false);
    setAmount("");
    setPrice("");
    setStopLoss("");
    setTakeProfit("");
  };

  const handleCloseTrade = async (trade: (typeof openTrades)[0]) => {
    const exitPrice = selectedAsset.price;
    const priceDiff =
      trade.side === "buy"
        ? exitPrice - trade.entry_price
        : trade.entry_price - exitPrice;
    const pnl = priceDiff * trade.quantity * trade.leverage;

    await closeTrade(trade.id, exitPrice, pnl);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const filteredAssets = assets.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const availableBalance = balance?.balance ?? 0;
  const marginUsed = openTrades.reduce(
    (acc, trade) => acc + (trade.entry_price * trade.quantity) / trade.leverage,
    0
  );
  const estValue = amount ? parseFloat(amount) * selectedAsset.price : 0;
  const fee = estValue * 0.001;
  const total = estValue + fee;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border glass-strong flex-shrink-0">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-gradient-primary hidden sm:block">
                Apex Pips
              </span>
            </Link>

            {/* Current Asset */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary">
              <span className="font-semibold">{selectedAsset.symbol}</span>
              <span className="font-mono">
                ${selectedAsset.price.toLocaleString()}
              </span>
              <span
                className={`text-sm ${
                  selectedAsset.isUp ? "profit-text" : "loss-text"
                }`}
              >
                {selectedAsset.change}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Dashboard
            </Link>
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Asset List */}
        <aside className="w-64 border-r border-border flex flex-col flex-shrink-0 hidden lg:flex">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredAssets.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset)}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-secondary transition-colors ${
                  selectedAsset.symbol === asset.symbol ? "bg-secondary" : ""
                }`}
              >
                <div className="text-left">
                  <p className="font-medium text-sm">{asset.symbol}</p>
                  <p className="text-xs text-muted-foreground">{asset.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">
                    ${asset.price.toLocaleString()}
                  </p>
                  <p
                    className={`text-xs ${
                      asset.isUp ? "profit-text" : "loss-text"
                    }`}
                  >
                    {asset.change}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Center - Chart */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <div
              id="tradingview_chart"
              ref={chartContainerRef}
              className="absolute inset-0"
            />
            <button className="absolute top-4 right-4 p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom - Open Positions */}
          <div className="h-48 border-t border-border overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-sm font-medium text-foreground">
                  Positions ({openTrades.length})
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  History
                </button>
              </div>
            </div>
            <div className="overflow-x-auto max-h-32">
              {openTrades.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No open positions
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left px-4 py-2">Symbol</th>
                      <th className="text-left px-4 py-2">Side</th>
                      <th className="text-right px-4 py-2">Size</th>
                      <th className="text-right px-4 py-2">Entry</th>
                      <th className="text-right px-4 py-2">Leverage</th>
                      <th className="text-right px-4 py-2">P&L</th>
                      <th className="text-right px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openTrades.map((trade) => {
                      const currentAsset =
                        assets.find((a) => a.symbol === trade.symbol) ||
                        selectedAsset;
                      const priceDiff =
                        trade.side === "buy"
                          ? currentAsset.price - trade.entry_price
                          : trade.entry_price - currentAsset.price;
                      const displayPnl =
                        trade.admin_profit_override ??
                        priceDiff * trade.quantity * trade.leverage;
                      const isProfit = displayPnl >= 0;

                      return (
                        <tr key={trade.id} className="border-t border-border">
                          <td className="px-4 py-2 font-medium">
                            {trade.symbol}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                trade.side === "buy"
                                  ? "bg-profit/20 profit-text"
                                  : "bg-loss/20 loss-text"
                              }`}
                            >
                              {trade.side === "buy" ? "Long" : "Short"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right font-mono">
                            {trade.quantity}
                          </td>
                          <td className="px-4 py-2 text-right font-mono">
                            ${trade.entry_price.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-right font-mono">
                            {trade.leverage}x
                          </td>
                          <td
                            className={`px-4 py-2 text-right font-mono ${
                              isProfit ? "profit-text" : "loss-text"
                            }`}
                          >
                            {isProfit ? "+" : ""}${displayPnl.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCloseTrade(trade)}
                            >
                              Close
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Order Form */}
        <aside className="w-80 border-l border-border flex flex-col flex-shrink-0 hidden md:flex">
          <div className="p-4 border-b border-border">
            <div className="flex gap-2">
              <Button
                variant={orderSide === "buy" ? "profit" : "secondary"}
                className="flex-1"
                onClick={() => setOrderSide("buy")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Buy
              </Button>
              <Button
                variant={orderSide === "sell" ? "loss" : "secondary"}
                className="flex-1"
                onClick={() => setOrderSide("sell")}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Sell
              </Button>
            </div>
          </div>

          <div className="p-4 flex-1 space-y-4 overflow-y-auto">
            {/* Order Type */}
            <div className="flex gap-2">
              <button
                onClick={() => setOrderType("market")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  orderType === "market"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType("limit")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  orderType === "limit"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Limit
              </button>
            </div>

            {/* Price (for limit orders) */}
            {orderType === "limit" && (
              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount ({selectedAsset.symbol.split("/")[0]})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="flex gap-2">
                {["25%", "50%", "75%", "100%"].map((pct) => {
                  const pctValue = parseInt(pct) / 100;
                  const maxAmount =
                    (availableBalance * parseInt(leverage)) /
                    selectedAsset.price;
                  return (
                    <button
                      key={pct}
                      className="flex-1 py-1 text-xs bg-secondary rounded hover:bg-secondary/80 transition-colors"
                      onClick={() =>
                        setAmount((maxAmount * pctValue).toFixed(4))
                      }
                    >
                      {pct}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Leverage */}
            <div className="space-y-2">
              <Label>Leverage</Label>
              <div className="flex gap-2">
                {["1", "5", "10", "25", "50"].map((lev) => (
                  <button
                    key={lev}
                    className={`flex-1 py-1 text-xs rounded transition-colors ${
                      leverage === lev
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                    onClick={() => setLeverage(lev)}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Loss / Take Profit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Stop Loss</Label>
                <Input
                  type="number"
                  placeholder="Optional"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Take Profit</Label>
                <Input
                  type="number"
                  placeholder="Optional"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Order Summary */}
            <Card variant="glass" className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Value</span>
                <span className="font-mono">${estValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee (0.1%)</span>
                <span className="font-mono">${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono font-semibold">
                  ${total.toFixed(2)}
                </span>
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              variant={orderSide === "buy" ? "profit" : "loss"}
              size="lg"
              className="w-full"
              onClick={handleSubmitOrder}
              disabled={submitting}
            >
              {submitting
                ? "Processing..."
                : `${orderSide === "buy" ? "Buy" : "Sell"} ${
                    selectedAsset.symbol
                  }`}
            </Button>
          </div>

          {/* Account Info */}
          <div className="p-4 border-t border-border">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="font-mono">
                  $
                  {availableBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Margin Used</span>
                <span className="font-mono">
                  $
                  {marginUsed.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Terminal;
