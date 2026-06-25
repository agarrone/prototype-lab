import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const marianne = localFont({
  src: [
    {
      path: "./fonts/Marianne-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Marianne-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Marianne-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-marianne",
  display: "swap",
});

const inconsolata = localFont({
  src: "./fonts/Inconsolata-VariableFont_wdth,wght.ttf",
  variable: "--font-inconsolata",
  weight: "200 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prototype Lab",
  description: "Laboratoire de prototypes pour data.gouv.fr.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${marianne.variable} ${inconsolata.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
