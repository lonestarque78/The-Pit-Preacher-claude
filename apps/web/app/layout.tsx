import "./globals.css";
import React from "react";
import { Playfair_Display, Libre_Baskerville, Oswald } from "next/font/google";
import Nav from "@/components/Nav";

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

export const metadata = {
  title: "Pit Preacher",
  description: "Your BBQ coaching companion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${ui.variable}`}>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
