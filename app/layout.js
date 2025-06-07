import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Cashbook & Inventory Manager",
  description: "A smarter way to track sales, inventory, and compliance—all in one place.",
    generator: 'v0.dev'
}

export const dynamic = "force-dynamic"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>{children}</body>
    </html>
  )
}
