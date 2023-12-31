import "./globals.css";
import { Inter } from "next/font/google";
import { Web3Context } from "./web3/Web3Context";
import { Navbar } from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Whitelist Demo",
  description: "How to manage your whitelist like a pro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3Context>
      <html lang="en">
        <body className={inter.className}>
          <>
            <Navbar />
            {children}
          </>
        </body>
      </html>
    </Web3Context>
  );
}
