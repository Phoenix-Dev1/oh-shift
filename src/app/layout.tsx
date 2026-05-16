// app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "./context/ThemeContext";
import NavSwitcher from "./components/Navbar/NavSwitcher";
import "./globals.css";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";
import AuthContext from "./context/AuthContext";
import ToastProvider from "./context/ToastProvider";
import ReactQueryProvider from "./context/ReactQueryProvider";

export const metadata: Metadata = {
  title: "Oh-Shift",
  description: "Enterprise shift management made simple.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased">
        <ThemeProvider>
          <AuthContext>
            <ReactQueryProvider>
              <ToastProvider />
              <div className="flex flex-col min-h-screen">
                <NavSwitcher />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <ScrollToTop />
            </ReactQueryProvider>
          </AuthContext>
        </ThemeProvider>
      </body>
    </html>
  );
}
