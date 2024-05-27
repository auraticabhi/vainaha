import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {DM_Sans} from 'next/font/google'
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Providers from "@/components/ThemeProvider";
import { StoreProvider } from "@/store/StoreProvider";
import { Toaster } from "@/components/ui/toaster";
import { GoogleTagManager } from '@next/third-parties/google'
// import {useRouter} from "next/router";

import { GeistSans } from 'geist/font/sans';

const dmSans_init = DM_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'],
  variable: '--font-dmsans',
})

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vainaha - Medical Conference",
  description: "Get all your answers here.",
  openGraph: {
    title: "Devotional-B",
    description: "Get all your answers here.",
    type: "website",
    locale: "en_US",
    url: "https://devotional-b.vercel.app",
    // images: [
    //   {
    //     url: "https://devotional-b.vercel.app/og.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "Devotional-B",
    //   },
    // ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // const router = useRouter();
  // const currPath = router.pathname;
  // console.log("path: ", currPath);
  return (
    <StoreProvider>
      <html lang="en">
      <GoogleTagManager gtmId="GTM-5L5XG2V6" />
        <body className={cn(GeistSans.className, `antialiased min-h-screen pt-12 bg-[#F1F2F2] dark:bg-[#181818] ${dmSans_init.variable}`)}>
          <Providers>
            <Navbar />
            <div className="h-full pt-4 font-jakarta">
            {children}
            </div>
            <Toaster />
          </Providers> 
        </body>
      </html>
    </StoreProvider>
  );
}
