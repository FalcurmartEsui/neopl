import { Card } from "@/components/ui/card";
import {
  Zap,
  Shield,
  BarChart3,
  Wallet,
  Globe,
  Smartphone,
  Lock,
  HeadphonesIcon,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Execution",
    description:
      "Execute trades in under 50ms with our advanced matching engine. Never miss a trading opportunity.",
    color: "primary",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "256-bit encryption, 2FA authentication, and cold storage for 95% of assets. Your funds are safe.",
    color: "accent",
  },
  {
    icon: BarChart3,
    title: "Advanced Charts",
    description:
      "Professional TradingView charts with 100+ indicators, drawing tools, and multiple timeframes.",
    color: "primary",
  },
  {
    icon: Wallet,
    title: "Easy Deposits",
    description:
      "Fund your account instantly via bank transfer, card, or crypto. Withdraw anytime.",
    color: "accent",
  },
  {
    icon: Globe,
    title: "24/7 Trading",
    description:
      "Trade crypto markets around the clock. Forex and stocks during market hours.",
    color: "primary",
  },
  {
    icon: Smartphone,
    title: "Mobile Trading",
    description:
      "Trade on the go with our fully-featured mobile app. Available on iOS and Android.",
    color: "accent",
  },
  {
    icon: Lock,
    title: "Regulated Platform",
    description:
      "Fully licensed and regulated. We comply with international financial standards.",
    color: "primary",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description:
      "Our expert support team is available around the clock via live chat, email, and phone.",
    color: "accent",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-secondary/20 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 trading-grid opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-gradient-gold">Apex Pips</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for traders who demand the best. Our platform combines
            cutting-edge technology with institutional-grade security.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              variant="bordered"
              className="p-6 group hover:scale-[1.02] transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  feature.color === "primary"
                    ? "bg-primary/10 group-hover:bg-primary/20"
                    : "bg-accent/10 group-hover:bg-accent/20"
                }`}
              >
                <feature.icon
                  className={`w-7 h-7 ${
                    feature.color === "primary" ? "text-primary" : "text-accent"
                  }`}
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
