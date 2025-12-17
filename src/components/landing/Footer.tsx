import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: "Trading Platform", href: "#" },
      { name: "Mobile App", href: "#" },
      { name: "API", href: "#" },
      { name: "Fees", href: "#fees" },
    ],
    Resources: [
      { name: "Help Center", href: "#" },
      { name: "Trading Guide", href: "#" },
      { name: "Market News", href: "#" },
      { name: "Blog", href: "#" },
    ],
    Company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Press", href: "#" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Risk Disclosure", href: "#" },
      { name: "Cookies", href: "#" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">
                Apex Pips
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Trade crypto, forex, stocks, and more with the most trusted
              trading platform. Fast, secure, and regulated.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Apex Pips. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground max-w-xl text-center md:text-right">
            Risk Warning: Trading in financial instruments carries a high level
            of risk. Only trade with money you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
