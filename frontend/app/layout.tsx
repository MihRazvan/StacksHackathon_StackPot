import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectButton } from "@/features/wallet/components/connect-button";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "StackPot - No-Loss Lottery on Stacks",
  description: "Earn Yield from Bitcoin Stacking. Keep Your STX. The no-loss lottery powered by Stacks blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Providers>
          <nav className="border-b border-border-subtle bg-bg-card/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-3 group">
                  <Image
                    src="/stacks_logo.png"
                    alt="Stacks Logo"
                    width={32}
                    height={32}
                    className="group-hover:opacity-80 transition-opacity"
                  />
                  <span className="text-h3 font-bold cursor-pointer group-hover:opacity-80 transition-opacity">
                    <span className="text-text-primary">Stack</span><span className="text-cyber-teal">Pot</span>
                  </span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link
                    href="/"
                    className="text-body text-text-secondary hover:text-cyber-teal transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/pool"
                    className="text-body text-text-secondary hover:text-cyber-teal transition-colors"
                  >
                    Pool
                  </Link>
                  <Link
                    href="/history"
                    className="text-body text-text-secondary hover:text-cyber-teal transition-colors"
                  >
                    History
                  </Link>
                </div>
              </div>
              <ConnectButton />
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
