import type { Metadata } from "next";
import ThemeProvider from "./components/ThemeProvider";
import Navbar from "./components/Navbar/Navbar";
import "./globals.css";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";
import AuthContext from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";

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
        <AuthContext>
          <ToasterContext />
          <Navbar />
          <ThemeProvider>
            <main>{children} </main>
            <ScrollToTop />
            <Footer />
          </ThemeProvider>
        </AuthContext>
      </body>
    </html>
  );
}
