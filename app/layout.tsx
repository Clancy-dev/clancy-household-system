import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: "Clancy's Household System",
    template: "%s | Clancy's Household System",
  },

  description:
    "Clancy's Household System is a smart household management platform for tracking expenses, managing budgets, monitoring maintenance, and organizing daily household finances.",

  keywords: [
    "Clancy's Household System",
    "Clancy Household System",
    "Household Management System",
    "Household Expense Tracker",
    "Personal Finance Management System",
    "Family Budget Tracker",
    "Expense Tracker Uganda",
    "Home Expense Management",
    "Household Budget Management",
    "Income and Expense Tracker",
    "Personal Budget Software",
    "House Maintenance Tracker",
    "Daily Expense Management",
    "Financial Management System Uganda",
  ],

  authors: [
    {
      name: "Clancy Ssekisambu",
    },
  ],

  creator: "Clancy Ssekisambu",

  applicationName: "Clancy's Household System",

  metadataBase: new URL(
    "https://clancyhouseholdsystem.vercel.app"
  ),

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clancyhouseholdsystem.vercel.app",
    title: "Clancy's Household System",
    description:
      "Manage household expenses, budgets, maintenance records, and personal finances in one simple system.",
    siteName: "Clancy's Household System",
  },

  twitter: {
    card: "summary_large_image",
    title: "Clancy's Household System",
    description:
      "A smart household management system for tracking expenses, budgets, and home maintenance.",
  },

  icons: {
    icon: [
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],

    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}


export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#0f172a",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>

        {process.env.NODE_ENV === "production" && (
          <Analytics />
        )}
      </body>
    </html>
  )
}