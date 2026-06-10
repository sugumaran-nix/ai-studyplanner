import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/layout/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudyMind AI — Smart Learning Assistant",
  description:
    "AI-powered study planner with spaced repetition, weak topic analysis, and a personal learning assistant.",
  keywords: ["study planner", "AI tutor", "spaced repetition", "exam prep"],
  openGraph: {
    title: "StudyMind AI",
    description: "Study smarter, not harder.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className:
                "!bg-dark-raised !text-white !border !border-dark-border !shadow-card text-sm",
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
