import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudCast — Modern Weather App",
  description: "Elegant cloud-based weather application with Apple-inspired design, real-time weather data, and persistent user preferences",
  keywords: ["weather", "forecast", "cloudcast", "weather app"],
  authors: [{ name: "CloudCast" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className="font-sans antialiased overflow-x-hidden"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
