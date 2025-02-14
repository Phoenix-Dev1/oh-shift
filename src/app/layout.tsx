import type { Metadata } from "next";
import ThemeProvider from "./components/ThemeProvider";
import Navbar from "./components/Navbar/Navbar";
import "./globals.css";

/*
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
*/

// className={`${geistSans.variable} ${geistMono.variable} antialiased`}

export const metadata: Metadata = {
  title: "Oh-Shift",
  description: "It's only logical",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-bg-900 dark:bg-bg-900">
        <Navbar />
        <ThemeProvider>{children} </ThemeProvider>
      </body>
    </html>
  );
}
