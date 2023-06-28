import { goerli } from "viem/chains";
import { configureChains, createConfig, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()]
);

export const config = createConfig({
  autoConnect: false,
  publicClient,
  webSocketPublicClient,
  persister: null,
});
