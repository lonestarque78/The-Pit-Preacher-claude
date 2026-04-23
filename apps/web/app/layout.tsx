import "./globals.css";
import { Playfair_Display, Libre_Baskerville, Oswald } from "next/font/google";

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
  description: "Your AI BBQ companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
