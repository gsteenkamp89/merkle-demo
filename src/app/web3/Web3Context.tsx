"use client";

import { PropsWithChildren } from "react";
import { WagmiConfig } from "wagmi";
import { config } from "./config";

export const Web3Context = ({ children }: PropsWithChildren) => {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
};
