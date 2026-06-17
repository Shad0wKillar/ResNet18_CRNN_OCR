import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResNet18-CRNN-OCR",
  description: "OCR inference interface for a ResNet18-CRNN model.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var key="resnet18-crnn-ocr-theme";var requested=new URLSearchParams(location.search).get("theme");var stored=localStorage.getItem(key);var theme=requested==="dark"||requested==="light"?requested:stored==="dark"||stored==="light"?stored:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");if(requested==="dark"||requested==="light"){localStorage.setItem(key,requested)}document.documentElement.classList.toggle("dark",theme==="dark");document.documentElement.style.colorScheme=theme;}catch(e){}})();`,
          }}
          id="theme-init"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
