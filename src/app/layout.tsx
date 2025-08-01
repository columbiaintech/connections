import type { Metadata } from "next";
import {Fragment_Mono} from "next/font/google";
import {Source_Sans_3} from "next/font/google";
import Navbar from "@/components/Navbar";

import "./styles/globals.css";
import React from "react";

const fragmentMono = Fragment_Mono({
    variable: "--font-fragment-mono",
    subsets: ["latin"],
    weight: "400",
});


const sourceSans3 = Source_Sans_3({
    variable: "--font-source-sans-3",
    subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Connections",
  description: "A Tiny Little Community App",
};

export default async function RootLayout({children}: Readonly<{children: React.ReactNode;}>)
{
    return (
    <html lang="en">
      <body
        className={`${fragmentMono.variable} ${sourceSans3.variable} antialiased w-screen min-h-screen bg-style1 bg-cover bg-no-repeat bg-center`}
      >
      <Navbar></Navbar>
        {children}
      </body>
    </html>
  );
}
