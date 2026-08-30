import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#07090e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "GymTracker — Tactical Workout & Progressive Overload Tracker",
    template: "%s · GymTracker",
  },
  description:
    "Tactile workout tracking designed for the gym floor. Log working sets in seconds, calculate progressive overload automatically, and switch busy machines without losing tempo.",
  keywords: [
    "GymTracker",
    "workout tracker",
    "gym tracker",
    "weightlifting log",
    "progressive overload",
    "gym routine planner",
    "muscle volume analytics",
  ],
  authors: [{ name: "GymTracker" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "GymTracker — Tactical Workout & Progressive Overload Tracker",
    description:
      "Plan your splits, log every set in seconds, and track real athletic progression on the gym floor.",
    siteName: "GymTracker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GymTracker — Tactical Workout & Progressive Overload Tracker",
    description:
      "Plan your splits, log every set in seconds, and track real athletic progression on the gym floor.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
