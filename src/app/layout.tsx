import "@/styles/globals.css";

import { TRPCReactProvider } from "@/trpc/react";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "react-hot-toast";
export const metadata: Metadata = {
  title: "Composer AIIII - Like Cursor, for Writing",
  description: "A writing assistant that helps you write better",
  icons: [
    { rel: "icon", url: "/icons8-quill-color-pixels-96.png", sizes: "96x96" },
    { rel: "icon", url: "/icons8-quill-color-pixels-32.png", sizes: "32x32" },
    { rel: "icon", url: "/icons8-quill-color-pixels-16.png", sizes: "16x16" },
  ],
  openGraph: {
    title: "Composer AIIIII - Like Cursor, for Writing",
    description: "A writing assistant that helps you write better",
    url: "https://copilot-for-writing.vercel.app",
    siteName: "Composer AI",
    images: [
      {
        url: "https://copilot-for-writing.vercel.app/og.png", // Must be an absolute URL
        width: 1280,
        height: 720,
      },
    ],
    videos: [
      {
        url: "https://copilot-for-writing.vercel.app/copilot-for-writing.mp4", // Must be an absolute URL
        width: 2806,
        height: 1814,
      },
    ],

    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          {children}
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
