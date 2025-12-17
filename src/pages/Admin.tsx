import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  LogOut,
  Search,
  Edit2,
  Ban,
  Check,
  X,
  ArrowUpRight,
  RefreshCw,
  Eye,
  Trash2,
  Image,
  Signal,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAdmin, UserWithBalance } from "@/hooks/useAdmin";
import AdminChat from "@/components/admin/AdminChat";

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "users" | "deposits" | "withdrawals" | "trades" | "chat"
  >("users");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit states
  const [editingUser, setEditingUser] = useState<UserWithBalance | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [editTodayPl, setEditTodayPl] = useState("");
  const [editSignalStrength, setEditSignalStrength] = useState(3);

  // View user modal
  const [viewingUser, setViewingUser] = useState<UserWithBalance | null>(null);

  // Screenshot modal
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(
    null
  );

  const navigate = useNavigate();

  const {
    isAdmin,
    loading: adminLoading,
    users,
    deposits,
    withdrawals,
    trades,
    approveDeposit,
    rejectDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    updateUserBalance,
    updateKycStatus,
    updateUserStatus,
    updateTodayProfitLoss,
    updateSignalStrength,
    updateAllBalanceFields,
    deleteUser,
    refetchUsers,
    refetchDeposits,
    refetchWithdrawals,
    refetchTrades,
  } = useAdmin();

  useEffect(() => {
    // Check admin auth on mount
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth) {
      navigate("/admin-login");
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminPassword");
    await supabase.auth.signOut();
    navigate("/");
  };

  const openEditModal = (u: UserWithBalance) => {
    setEditingUser(u);
    setEditBalance((u.balance_data?.balance ?? 0).toString());
    setEditTodayPl((u.balance_data?.today_profit_loss ?? 0).toString());
    setEditSignalStrength(u.balance_data?.signal_strength ?? 3);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    const balanceNum = parseFloat(editBalance);
    const plNum = parseFloat(editTodayPl);

    if (isNaN(balanceNum) || isNaN(plNum)) {
      toast.error("Please enter valid numbers");
      return;
    }

    // Use combined update to prevent race conditions
    await updateAllBalanceFields(
      editingUser.id,
      balanceNum,
      plNum,
      editSignalStrength
    );

    setEditingUser(null);
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${email}? This action cannot be undone and will delete ALL user data.`
      )
    ) {
      return;
    }
    await deleteUser(userId);
  };

  const handleBlockUser = async (userId: string, currentlyActive: boolean) => {
    await updateUserStatus(userId, !currentlyActive);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingDeposits = deposits.filter((d) => d.status === "pending");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-gradient-primary">
                  Apex Pips
                </span>
              </Link>
              <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm font-medium">
                Admin Panel
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Total Users</span>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{users.length}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">
                Total Volume
              </span>
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold">
              $
              {deposits
                .filter((d) => d.status === "approved")
                .reduce((a, d) => a + d.amount, 0)
                .toLocaleString()}
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">
                Pending Deposits
              </span>
              <Shield className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{pendingDeposits.length}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">
                Pending Withdrawals
              </span>
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{pendingWithdrawals.length}</p>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap border-b border-border pb-4">
          {(
            ["users", "deposits", "withdrawals", "trades", "chat"] as const
          ).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab === "chat" && <MessageCircle className="w-4 h-4 mr-2" />}
              {tab}
            </Button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold">Manage Users</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={refetchUsers}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="w-full">
              <table className="w-full">
                <thead>
                  <tr className="text-muted-foreground text-sm border-b border-border">
                    <th className="text-left pb-4 font-medium">User</th>
                    <th className="text-right pb-4 font-medium hidden md:table-cell">
                      Balance
                    </th>
                    <th className="text-right pb-4 font-medium hidden lg:table-cell">
                      Today P/L
                    </th>
                    <th className="text-center pb-4 font-medium hidden lg:table-cell">
                      Signal
                    </th>
                    <th className="text-center pb-4 font-medium">Status</th>
                    <th className="text-right pb-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4">
                        <p className="font-medium">
                          {u.full_name || "No name"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {u.email}
                        </p>
                      </td>
                      <td className="py-4 text-right hidden md:table-cell">
                        <span className="font-mono font-medium">
                          ${(u.balance_data?.balance ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 text-right hidden lg:table-cell">
                        <span
                          className={`font-mono ${
                            (u.balance_data?.today_profit_loss ?? 0) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          $
                          {(
                            u.balance_data?.today_profit_loss ?? 0
                          ).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-0.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                            <div
                              key={i}
                              className={`w-0.5 rounded-full ${
                                i <= (u.balance_data?.signal_strength ?? 3)
                                  ? "bg-primary"
                                  : "bg-muted"
                              }`}
                              style={{ height: `${6 + i * 1.5}px` }}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            u.is_active !== false
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {u.is_active !== false ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            Manage
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewingUser(u)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => openEditModal(u)}
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 ${
                              u.is_active !== false
                                ? "text-yellow-500 hover:text-yellow-400"
                                : "text-green-500 hover:text-green-400"
                            }`}
                            onClick={() =>
                              handleBlockUser(u.id, u.is_active !== false)
                            }
                            title={
                              u.is_active !== false
                                ? "Block User"
                                : "Unblock User"
                            }
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                            onClick={() =>
                              handleDeleteUser(u.id, u.email || "this user")
                            }
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Deposits Tab */}
        {activeTab === "deposits" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Manage Deposits</h2>
              <Button variant="outline" size="icon" onClick={refetchDeposits}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-muted-foreground text-sm border-b border-border">
                    <th className="text-left pb-4 font-medium">User</th>
                    <th className="text-right pb-4 font-medium">Amount</th>
                    <th className="text-center pb-4 font-medium">Method</th>
                    <th className="text-center pb-4 font-medium">Screenshot</th>
                    <th className="text-center pb-4 font-medium">Status</th>
                    <th className="text-center pb-4 font-medium">Date</th>
                    <th className="text-right pb-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-4">
                        <p className="font-medium">
                          {d.profile?.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {d.profile?.email}
                        </p>
                      </td>
                      <td className="py-4 text-right font-mono font-medium">
                        ${d.amount.toLocaleString()}
                      </td>
                      <td className="py-4 text-center">
                        <span className="px-2 py-1 bg-secondary rounded text-xs">
                          {d.method} - {d.currency}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        {d.screenshot_url ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setViewingScreenshot(d.screenshot_url!)
                            }
                          >
                            <Image className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            d.status === "approved"
                              ? "bg-green-500/20 text-green-500"
                              : d.status === "rejected"
                              ? "bg-red-500/20 text-red-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-4 text-center text-sm text-muted-foreground">
                        {new Date(d.created_at!).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right">
                        {d.status === "pending" && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-500 hover:text-green-400"
                              onClick={() => approveDeposit(d.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-400"
                              onClick={() => rejectDeposit(d.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {deposits.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No deposits found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Withdrawals Tab */}
        {activeTab === "withdrawals" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Manage Withdrawals</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={refetchWithdrawals}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-muted-foreground text-sm border-b border-border">
                    <th className="text-left pb-4 font-medium">User</th>
                    <th className="text-right pb-4 font-medium">Amount</th>
                    <th className="text-center pb-4 font-medium">Method</th>
                    <th className="text-left pb-4 font-medium">
                      Wallet Address
                    </th>
                    <th className="text-center pb-4 font-medium">Status</th>
                    <th className="text-center pb-4 font-medium">Date</th>
                    <th className="text-right pb-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr
                      key={w.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-4">
                        <p className="font-medium">
                          {w.profile?.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {w.profile?.email}
                        </p>
                      </td>
                      <td className="py-4 text-right font-mono font-medium">
                        ${w.amount.toLocaleString()}
                      </td>
                      <td className="py-4 text-center">
                        <span className="px-2 py-1 bg-secondary rounded text-xs">
                          {w.method}
                        </span>
                      </td>
                      <td className="py-4 text-left">
                        <span className="text-xs font-mono text-muted-foreground">
                          {w.wallet_address || "-"}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            w.status === "approved"
                              ? "bg-green-500/20 text-green-500"
                              : w.status === "rejected"
                              ? "bg-red-500/20 text-red-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-4 text-center text-sm text-muted-foreground">
                        {new Date(w.created_at!).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right">
                        {w.status === "pending" && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-500 hover:text-green-400"
                              onClick={() => approveWithdrawal(w.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-400"
                              onClick={() => rejectWithdrawal(w.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No withdrawals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Trades Tab */}
        {activeTab === "trades" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Manage Trades</h2>
              <Button variant="outline" size="icon" onClick={refetchTrades}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="text-muted-foreground text-sm border-b border-border">
                    <th className="text-left pb-4 font-medium">User</th>
                    <th className="text-left pb-4 font-medium">Symbol</th>
                    <th className="text-center pb-4 font-medium">Side</th>
                    <th className="text-right pb-4 font-medium">Entry</th>
                    <th className="text-right pb-4 font-medium">Qty</th>
                    <th className="text-right pb-4 font-medium">P/L</th>
                    <th className="text-center pb-4 font-medium">Status</th>
                    <th className="text-center pb-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-4">
                        <p className="font-medium text-sm">
                          {t.profile?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.profile?.email}
                        </p>
                      </td>
                      <td className="py-4 font-medium">{t.symbol}</td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            t.side === "buy"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {t.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono text-sm">
                        ${t.entry_price.toLocaleString()}
                      </td>
                      <td className="py-4 text-right font-mono text-sm">
                        {t.quantity}
                      </td>
                      <td className="py-4 text-right">
                        <span
                          className={`font-mono text-sm ${
                            (t.admin_profit_override ?? t.profit_loss) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          $
                          {(
                            t.admin_profit_override ?? t.profit_loss
                          ).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            t.status === "open"
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 text-center text-sm text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {trades.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No trades found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && <AdminChat />}
      </div>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit User: {editingUser?.full_name || editingUser?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Total Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
                placeholder="Enter balance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="todayPl">Today's P/L ($)</Label>
              <Input
                id="todayPl"
                type="number"
                value={editTodayPl}
                onChange={(e) => setEditTodayPl(e.target.value)}
                placeholder="Enter today's P/L"
              />
            </div>
            <div className="space-y-3">
              <Label>Signal Strength: {editSignalStrength}</Label>
              <div className="flex items-center gap-4">
                <Signal className="w-5 h-5 text-muted-foreground" />
                <Slider
                  value={[editSignalStrength]}
                  onValueChange={(value) => setEditSignalStrength(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full ${
                        i <= editSignalStrength ? "bg-primary" : "bg-muted"
                      }`}
                      style={{ height: `${6 + i * 2}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{viewingUser.full_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{viewingUser.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewingUser.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {viewingUser.date_of_birth || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{viewingUser.country || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{viewingUser.city || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-medium">{viewingUser.state || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Postal Code</p>
                  <p className="font-medium">
                    {viewingUser.postal_code || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{viewingUser.address || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="font-medium font-mono">
                    ${(viewingUser.balance_data?.balance ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's P/L</p>
                  <p
                    className={`font-medium font-mono ${
                      (viewingUser.balance_data?.today_profit_loss ?? 0) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    $
                    {(
                      viewingUser.balance_data?.today_profit_loss ?? 0
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Deposited
                  </p>
                  <p className="font-medium font-mono">
                    $
                    {(
                      viewingUser.balance_data?.total_deposited ?? 0
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Withdrawn
                  </p>
                  <p className="font-medium font-mono">
                    $
                    {(
                      viewingUser.balance_data?.total_withdrawn ?? 0
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KYC Status</p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      viewingUser.kyc_status === "verified"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {viewingUser.kyc_status || "pending"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      viewingUser.is_active !== false
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {viewingUser.is_active !== false ? "Active" : "Blocked"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {viewingUser.created_at
                      ? new Date(viewingUser.created_at).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                {(viewingUser as any).government_id_type && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Government ID Type
                    </p>
                    <p className="font-medium">
                      {(viewingUser as any).government_id_type}
                    </p>
                  </div>
                )}
                {(viewingUser as any).government_id_url && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Government ID Document
                    </p>
                    <img
                      src={(viewingUser as any).government_id_url}
                      alt="Government ID"
                      className="max-w-full max-h-48 rounded-lg object-contain border border-border"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setViewingUser(null);
                    openEditModal(viewingUser);
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
                {viewingUser.kyc_status !== "verified" && (
                  <Button
                    variant="outline"
                    className="text-green-500 border-green-500/50"
                    onClick={() => {
                      updateKycStatus(viewingUser.id, "verified");
                      setViewingUser(null);
                    }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify KYC
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Screenshot Modal */}
      <Dialog
        open={!!viewingScreenshot}
        onOpenChange={() => setViewingScreenshot(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deposit Screenshot</DialogTitle>
          </DialogHeader>
          {viewingScreenshot && (
            <div className="flex items-center justify-center p-4">
              <img
                src={viewingScreenshot}
                alt="Deposit screenshot"
                className="max-w-full max-h-[70vh] rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
