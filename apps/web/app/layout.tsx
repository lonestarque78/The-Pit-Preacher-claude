import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import { Playfair_Display, Libre_Baskerville, Oswald } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});
const body = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-body",
});
const ui = Oswald({
  subsets: ["latin"],
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: {
    default: 'The Pit Preacher — BBQ Cook Planner for Serious Pitmasters',
    template: '%s | The Pit Preacher'
  },
  description: 'The Pit Preacher is a BBQ cook planner, smoker cook timer, and cook log built for backyard pitmasters and competition cooks. Plan your brisket timeline, track your cook, and get real pitmaster coaching from fire to table.',
  keywords: ['BBQ cook planner', 'brisket cook planner', 'smoker cook timer', 'BBQ cook log', 'BBQ cook journal', 'brisket stall fix', 'wood pairing for smoking meat', 'best wood for smoking brisket', 'BBQ troubleshooting', 'pellet smoker guide', 'offset smoker guide', 'BBQ app for pitmasters', 'pitmaster app', 'when to wrap brisket', 'smoke color guide BBQ'],
  authors: [{ name: 'Lone Star Que LLC' }],
  creator: 'Lone Star Que LLC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thepitpreacher.com',
    siteName: 'The Pit Preacher',
    title: 'The Pit Preacher — BBQ Cook Planner for Serious Pitmasters',
    description: 'Plan your cook. Track your fire. Log every lesson. The Pit Preacher is the BBQ cook planner built by a pitmaster for pitmasters.',
    images: [{ url: '/logo.jpeg', width: 1200, height: 630, alt: 'The Pit Preacher BBQ Cook Planner' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Pit Preacher — BBQ Cook Planner',
    description: 'Plan your cook. Track your fire. Log every lesson.',
    images: ['/logo.jpeg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${ui.variable}`}>
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
