import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectButton } from "@/features/wallet/components/connect-button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "StackPot - No-Loss Lottery on Stacks",
  description: "Win Bitcoin. Keep Your STX. The no-loss lottery powered by Stacks blockchain.",
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
          <nav className="border-b border-border-purple bg-dark-purple/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-8">
                <Link href="/">
                  <span className="text-h3 bg-hero-gradient bg-clip-text text-transparent font-bold cursor-pointer">
                    StackPot
                  </span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link
                    href="/"
                    className="text-body text-purple-gray hover:text-soft-lavender transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/history"
                    className="text-body text-purple-gray hover:text-soft-lavender transition-colors"
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
