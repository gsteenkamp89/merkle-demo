"use client";

import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import styles from "./ConnectButton.module.css";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ComponentProps } from "react";
import { truncateEthAddress } from "~/app/web3/utils";

interface ConnectButtonProps extends ComponentProps<"button"> {
  className?: string;
}

export const ConnectButton = ({ className }: ConnectButtonProps) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const handleClick = () => {
    if (isConnected) {
      disconnect();
      return;
    }
    connect();
  };

  return (
    <button
      className={`${styles.ConnectButton} ${className}`}
      onClick={handleClick}
    >
      {isConnected
        ? `${ensName ?? truncateEthAddress(address)}`
        : "Connect Wallet"}
    </button>
  );
};
