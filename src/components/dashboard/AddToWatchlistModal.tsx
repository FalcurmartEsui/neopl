import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, Search, TrendingUp, TrendingDown } from "lucide-react";

interface CryptoOption {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

interface AddToWatchlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableCryptos: CryptoOption[];
  watchlist: string[];
  onAddToWatchlist: (cryptoId: string) => void;
  loading: boolean;
}

const AddToWatchlistModal = ({
  open,
  onOpenChange,
  availableCryptos,
  watchlist,
  onAddToWatchlist,
  loading,
}: AddToWatchlistModalProps) => {
  const [search, setSearch] = useState("");

  const filteredCryptos = availableCryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(search.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add to Watchlist</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cryptocurrencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredCryptos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cryptocurrencies found
            </div>
          ) : (
            filteredCryptos.map((crypto) => {
              const isInWatchlist = watchlist.includes(crypto.id);
              const isUp = crypto.change24h >= 0;

              return (
                <div
                  key={crypto.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isInWatchlist
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {crypto.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{crypto.symbol}/USD</p>
                      <p className="text-sm text-muted-foreground">{crypto.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono text-sm">
                        ${crypto.price.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: crypto.price < 1 ? 4 : 2 
                        })}
                      </p>
                      <p className={`text-xs flex items-center justify-end gap-1 ${
                        isUp ? "text-green-500" : "text-red-500"
                      }`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? "+" : ""}{crypto.change24h.toFixed(2)}%
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant={isInWatchlist ? "secondary" : "default"}
                      onClick={() => onAddToWatchlist(crypto.id)}
                      disabled={isInWatchlist}
                    >
                      {isInWatchlist ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToWatchlistModal;
