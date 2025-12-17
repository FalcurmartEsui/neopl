import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const feeStructure = [
  {
    title: "Crypto",
    fees: [
      { label: "Trading Fee", value: "0.1%" },
      { label: "Deposit Fee", value: "Free" },
      { label: "Withdrawal Fee", value: "Network fee only" },
       { label: "Signal Streangth", value: "$300 - $700" },
    ],
  },
  {
    title: "Forex",
    fees: [
      { label: "Spread", value: "From 0.1 pips" },
      { label: "Commission", value: "$0" },
      { label: "Overnight Fee", value: "Varies" },
       { label: "Signal Streangth", value: "$300 - $700" },
    ],
  },
  {
    title: "Stocks & Indices",
    fees: [
      { label: "Commission", value: "0.05%" },
      { label: "Min. Fee", value: "$1" },
      { label: "CFD Spread", value: "From 0.5 pts" },
       { label: "Signal Streangth", value: "$300 - $700" },
    ],
  },
];

const benefits = [
  "No hidden fees or charges",
  "Transparent pricing structure",
  "Volume discounts available",
  "Competitive spreads 24/7",
];

const FeesSection = () => {
  return (
    <section id="fees" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, <span className="text-gradient-primary">Transparent</span> Fees
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden charges. Know exactly what you're paying before you trade.
          </p>
        </div>

        {/* Fee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {feeStructure.map((category) => (
            <Card key={category.title} variant="gradient" className="p-6">
              <h3 className="text-xl font-semibold mb-6 text-center">{category.title}</h3>
              <div className="space-y-4">
                {category.fees.map((fee) => (
                  <div key={fee.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">{fee.label}</span>
                    <span className="font-semibold text-foreground">{fee.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <Card variant="bordered" className="p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 text-center">Our Promise</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FeesSection;
