import type { Metadata } from "next";
import "./globals.css";
// import { Navbar } from "@/components/_layout/navbar";
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/sonner"
import { headers } from "next/headers"; 
import ContextProvider from "@/context";
const inter = Inter({ subsets: ['latin'] })
import GoogleAnalytics from "@/lib/googleanalytics";

export const metadata: Metadata = {
  title: "SuperAgents",
  description: "supercharged ai agents",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Await headers and extract cookies
  const headersList = await headers();
  const cookies = headersList.get('cookie');

  return (
    <html lang="en">
      <body className={inter.className}>
      <GoogleAnalytics GA_MEASUREMENT_ID="G-BQBHVW3308" />

        <ContextProvider cookies={cookies}>
          {/* <Navbar /> */}
          <main className="min-h-screen bg-background ">
            {children}
            <Toaster />
          </main>
        </ContextProvider>
      </body>
    </html>
  );
}
