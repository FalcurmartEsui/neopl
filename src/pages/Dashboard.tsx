import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Plus,
  ChevronRight,
  Activity,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { useBalance } from "@/hooks/useBalance";
import { useTrades } from "@/hooks/useTrades";
import { useProfile } from "@/hooks/useProfile";
import { useExtendedCryptoPrices } from "@/hooks/useExtendedCryptoPrices";
import DepositModal from "@/components/dashboard/DepositModal";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import OnboardingFlow from "@/components/dashboard/OnboardingFlow";
import LiveChat from "@/components/dashboard/LiveChat";
import TradingViewModal from "@/components/dashboard/TradingViewModal";
import AddToWatchlistModal from "@/components/dashboard/AddToWatchlistModal";

const DEFAULT_WATCHLIST = ["bitcoin", "ethereum", "solana", "ripple"];

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [tradesTab, setTradesTab] = useState<"open" | "closed">("closed");
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USD");
  const [addWatchlistOpen, setAddWatchlistOpen] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
  });
  const navigate = useNavigate();

  const { balance, loading: balanceLoading } = useBalance(user);
  const { trades, openTrades, loading: tradesLoading } = useTrades(user, false);
  const { profile, loading: profileLoading } = useProfile(user);
  const { allCryptos, loading: pricesLoading } = useExtendedCryptoPrices();

  // Filter watchlist items from all cryptos
  const watchlistData = allCryptos.filter((c) => watchlistIds.includes(c.id));

  const closedTrades = trades.filter((t) => t.status === "closed");

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
    if (!loading && !profileLoading && profile && !profile.profile_completed) {
      setOnboardingOpen(true);
    }
  }, [loading, user, navigate, profile, profileLoading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading || balanceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalBalance = balance?.balance ?? 0;
  const totalProfitLoss = balance?.total_profit_loss ?? 0;
  const todayProfitLoss = balance?.today_profit_loss ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass-strong sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">
                Apex Pips
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-foreground font-medium">
                Dashboard
              </Link>
              <Link
                to="/terminal"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terminal
              </Link>
              <button
                onClick={() => setDepositOpen(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Wallet
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {profile?.full_name || "Trader"}
          </h1>
          <p className="text-muted-foreground">Here's your trading overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card variant="gradient" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Total Balance</span>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mb-1">
              $
              {totalBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            <p
              className={`text-sm flex items-center gap-1 ${
                totalProfitLoss >= 0 ? "profit-text" : "loss-text"
              }`}
            >
              {totalProfitLoss >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {totalProfitLoss >= 0 ? "+" : ""}$
              {totalProfitLoss.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{" "}
              total P/L
            </p>
          </Card>

          <Card variant="gradient" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Today's P&L</span>
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <p
              className={`text-3xl font-bold mb-1 ${
                todayProfitLoss >= 0 ? "profit-text" : "loss-text"
              }`}
            >
              {todayProfitLoss >= 0 ? "+" : ""}$
              {todayProfitLoss.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-muted-foreground">Daily profit/loss</p>
          </Card>
        </div>

        {/* Signal Strength & Trades Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Signal Strength Card */}
          <Card variant="gradient" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-semibold">Signal Strength</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-sm ${
                      i <= (balance?.signal_strength ?? 3)
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                    style={{ height: `${8 + i * 2}px` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Market Signal</p>
          </Card>

          {/* Open/Closed Trades */}
          <Card variant="gradient" className="p-6 lg:col-span-3">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setTradesTab("open")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tradesTab === "open"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Open Trades
              </button>
              <button
                onClick={() => setTradesTab("closed")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tradesTab === "closed"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Closed Trades
              </button>
            </div>

            <div className="overflow-x-auto">
              {tradesTab === "open" ? (
                openTrades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">No open trades</p>
                    <Link to="/terminal">
                      <Button variant="outline">Start Trading</Button>
                    </Link>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-muted-foreground text-sm border-b border-border">
                        <th className="text-left pb-3 font-medium">Symbol</th>
                        <th className="text-left pb-3 font-medium">Type</th>
                        <th className="text-right pb-3 font-medium">Entry</th>
                        <th className="text-right pb-3 font-medium">Size</th>
                        <th className="text-right pb-3 font-medium">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openTrades.slice(0, 5).map((trade) => {
                        const pnl =
                          trade.admin_profit_override ?? trade.profit_loss;
                        const isProfit = pnl >= 0;
                        return (
                          <tr
                            key={trade.id}
                            className="border-b border-border/50"
                          >
                            <td className="py-3 font-medium">{trade.symbol}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  trade.side === "buy"
                                    ? "bg-green-500/20 text-green-500"
                                    : "bg-red-500/20 text-red-500"
                                }`}
                              >
                                {trade.side === "buy" ? "Long" : "Short"}
                              </span>
                            </td>
                            <td className="py-3 text-right font-mono">
                              ${trade.entry_price.toLocaleString()}
                            </td>
                            <td className="py-3 text-right font-mono">
                              {trade.quantity}
                            </td>
                            <td
                              className={`py-3 text-right font-mono ${
                                isProfit ? "text-green-500" : "text-red-500"
                              }`}
                            >
                              {isProfit ? "+" : ""}$
                              {pnl.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              ) : closedTrades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No closed trades yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-muted-foreground text-sm border-b border-border">
                      <th className="text-left pb-3 font-medium">Symbol</th>
                      <th className="text-left pb-3 font-medium">Type</th>
                      <th className="text-right pb-3 font-medium">Entry</th>
                      <th className="text-right pb-3 font-medium">Exit</th>
                      <th className="text-right pb-3 font-medium">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedTrades.slice(0, 5).map((trade) => {
                      const pnl =
                        trade.admin_profit_override ?? trade.profit_loss;
                      const isProfit = pnl >= 0;
                      return (
                        <tr
                          key={trade.id}
                          className="border-b border-border/50"
                        >
                          <td className="py-3 font-medium">{trade.symbol}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                trade.side === "buy"
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-red-500/20 text-red-500"
                              }`}
                            >
                              {trade.side === "buy" ? "Long" : "Short"}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono">
                            ${trade.entry_price.toLocaleString()}
                          </td>
                          <td className="py-3 text-right font-mono">
                            ${trade.exit_price?.toLocaleString() ?? "-"}
                          </td>
                          <td
                            className={`py-3 text-right font-mono ${
                              isProfit ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {isProfit ? "+" : ""}$
                            {pnl.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Watchlist */}
        <Card variant="gradient" className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Watchlist</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddWatchlistOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricesLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : watchlistData.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p className="mb-2">No cryptocurrencies in watchlist</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddWatchlistOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Cryptocurrency
                </Button>
              </div>
            ) : (
              watchlistData.map((item) => (
                <div
                  key={item.id}
                  className="relative flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                  onClick={() => {
                    setSelectedSymbol(`${item.symbol}/USD`);
                    setChartModalOpen(true);
                  }}
                >
                  <button
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-destructive/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newWatchlist = watchlistIds.filter(
                        (id) => id !== item.id
                      );
                      setWatchlistIds(newWatchlist);
                      localStorage.setItem(
                        "watchlist",
                        JSON.stringify(newWatchlist)
                      );
                      toast.success(`${item.symbol} removed from watchlist`);
                    }}
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                  <div>
                    <p className="font-medium">{item.symbol}/USD</p>
                    <p className="text-sm text-muted-foreground">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono">
                      $
                      {item.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: item.price < 1 ? 4 : 2,
                      })}
                    </p>
                    <p
                      className={`text-sm flex items-center justify-end gap-1 ${
                        item.isUp ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {item.isUp ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {item.change24h >= 0 ? "+" : ""}
                      {item.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link to="/terminal">
            <Button variant="outline" className="w-full mt-6">
              Open Terminal
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="default"
            size="lg"
            className="h-auto py-4"
            onClick={() => setDepositOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Deposit Funds
          </Button>
          <Link to="/terminal" className="w-full">
            <Button
              variant="secondary"
              size="lg"
              className="w-full h-auto py-4"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Open Trading Terminal
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-auto py-4"
            onClick={() => setWithdrawOpen(true)}
          >
            <ArrowUpRight className="w-5 h-5 mr-2" />
            Withdraw Funds
          </Button>
        </div>
      </main>

      <DepositModal
        open={depositOpen}
        onOpenChange={setDepositOpen}
        user={user}
      />
      <WithdrawModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        user={user}
        balance={balance}
      />
      <OnboardingFlow
        open={onboardingOpen}
        user={user}
        onComplete={() => {
          setOnboardingOpen(false);
          window.location.reload();
        }}
      />
      <LiveChat user={user} />
      <TradingViewModal
        open={chartModalOpen}
        onOpenChange={setChartModalOpen}
        symbol={selectedSymbol}
      />
      <AddToWatchlistModal
        open={addWatchlistOpen}
        onOpenChange={setAddWatchlistOpen}
        availableCryptos={allCryptos}
        watchlist={watchlistIds}
        onAddToWatchlist={(cryptoId) => {
          const newWatchlist = [...watchlistIds, cryptoId];
          setWatchlistIds(newWatchlist);
          localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
          const crypto = allCryptos.find((c) => c.id === cryptoId);
          toast.success(`${crypto?.symbol} added to watchlist`);
        }}
        loading={pricesLoading}
      />
    </div>
  );
};

export default Dashboard;
