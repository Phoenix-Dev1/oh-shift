// app/layout.tsx
import type { Metadata } from "next";
import ThemeProvider from "./components/ThemeProvider";
import Navbar from "./components/Navbar/Navbar";
import "./globals.css";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";
import AuthContext from "./context/AuthContext";
import ToastProvider from "./context/ToastProvider";

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
      <body className="h-screen bg-bg-900 dark:bg-bg-800 flex flex-col min-h-screen">
        <ThemeProvider>
          <AuthContext>
            <Navbar />
            <ToastProvider />
            <main className="flex-1">{children}</main>
            <ScrollToTop />
          </AuthContext>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
