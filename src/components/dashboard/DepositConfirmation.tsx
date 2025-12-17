import { useEffect, useState } from "react";
import { Check, Clock } from "lucide-react";

interface DepositConfirmationProps {
  show: boolean;
  onComplete: () => void;
}

const DepositConfirmation = ({ show, onComplete }: DepositConfirmationProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) {
      setProgress(0);
      return;
    }

    const duration = 4000; // 4 seconds
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 200);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="text-center space-y-6 p-8">
        {/* Animated Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            {progress < 100 ? (
              <Clock className="w-12 h-12 text-primary-foreground animate-pulse" />
            ) : (
              <Check className="w-12 h-12 text-primary-foreground animate-in zoom-in duration-300" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {progress < 100 ? "Hold for Confirmation" : "Submitted!"}
          </h2>
          <p className="text-muted-foreground">
            {progress < 100 
              ? "Processing your deposit request..." 
              : "Your deposit is awaiting admin confirmation"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.min(Math.round(progress), 100)}%
          </p>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepositConfirmation;
