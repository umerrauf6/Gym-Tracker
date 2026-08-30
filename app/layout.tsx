import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({ variable: "--font-display", weight: ["500", "600", "700", "800"], subsets: ["latin"], display: "swap" });
const barlow = Barlow({ variable: "--font-body", weight: ["400", "500", "600", "700"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "GymTracker", template: "%s · GymTracker" },
  description: "Plan your workouts, log every set, and track real training progress.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${barlowCondensed.variable} ${barlow.variable}`}><body>{children}</body></html>;
}
