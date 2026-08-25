import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scan2Save | Emergency Medical ID",
  description: "Your ID Card Can Save Your Life. Scan2Save turns any standard badge into an instant first-responder lifesaver.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.className} antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
