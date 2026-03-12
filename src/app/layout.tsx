import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata: Metadata = {
  title: "Khasi OCR Platform — Dataset Collection for Khasi Language OCR",
  description: "Collect, validate, and manage high-quality scanned document datasets for training OCR models on the Khasi language. A student-led initiative from Meghalaya.",
  keywords: ["Khasi", "OCR", "dataset", "Meghalaya", "language technology", "document scanning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
