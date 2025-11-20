import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/tailwind.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { CookieArea } from "@/components/shared/CookieArea";
import { Navbar } from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
              <main className="flex h-screen min-h-screen w-full max-w-3xl flex-col items-center bg-white sm:items-start sm:overflow-hidden dark:bg-black">
                <CookieArea>
                  <Navbar navigationLinks={[]} />
                </CookieArea>
                {children}
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
