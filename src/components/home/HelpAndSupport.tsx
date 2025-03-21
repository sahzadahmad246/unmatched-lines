import Link from "next/link";
import {
    Feather,
    Github,
    Twitter,
    Instagram,
    Mail,
    ArrowRight,
  } from "lucide-react";
export function HelpAndSupport() {
    return (
      <div className="bg-muted/30 p-4 rounded-lg border border-primary/10">
        <h3 className="font-bold mb-4 text-base font-serif text-center">
          Help & Support
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-3 text-sm font-serif text-primary">
              Resources
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/faq", label: "FAQ" },
                { href: "/blog", label: "Blog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="h-2.5 w-2.5 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-sm font-serif text-primary">
              Legal
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/terms", label: "Terms of Service" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/cookies", label: "Cookie Policy" },
                { href: "/copyright", label: "Copyright" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="h-2.5 w-2.5 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }