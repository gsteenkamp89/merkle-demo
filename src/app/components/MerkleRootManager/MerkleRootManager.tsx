"use client";

import { ComponentProps } from "react";
import styles from "./MerkleRootManager.module.css";
import {
  useContractMerkleRoot,
  useSetContractMerkleRoot,
  useWhitelistMerkleRoot,
} from "~/app/hooks/whitelist";
import { truncateEthAddress } from "~/app/web3/utils";

interface MerkleRootManagerProps extends ComponentProps<"div"> {
  className?: string;
}

export const MerkleRootManager = ({
  className,
  ...props
}: MerkleRootManagerProps) => {
  const { data: whitelistRoot } = useWhitelistMerkleRoot();
  const { data: contractMerkleRoot } = useContractMerkleRoot();
  const { write, isLoading, isSuccess } = useSetContractMerkleRoot();
  const synced = contractMerkleRoot === whitelistRoot;

  const handleSync = () => {
    if (!write || !whitelistRoot?.data) {
      return;
    }
    write({
      args: [whitelistRoot.data],
    });
  };

  return (
    <div className={`${styles.merkleRootManager} ${className}`} {...props}>
      <h3>Merkle Root Manager</h3>
      <p>from contract: {truncateEthAddress(contractMerkleRoot)}</p>
      <p>from whitelist: {truncateEthAddress(whitelistRoot?.data)}</p>
      <p style={{ color: synced ? "green" : "red" }}>
        {synced ? "synced" : "not synced"}
      </p>
      {!synced && (
        <button
          disabled={isLoading}
          className={styles.syncButton}
          onClick={handleSync}
        >
          {isLoading ? "busy..." : "Sync whitelist"}
        </button>
      )}
    </div>
  );
};
