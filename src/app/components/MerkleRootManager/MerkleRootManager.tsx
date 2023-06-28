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

  const isValidationError = whitelistRoot?.error
    ?.toLowerCase()
    ?.includes("validation");

  return (
    <div className={`${styles.merkleRootManager} ${className}`} {...props}>
      <h3>Merkle Root Manager</h3>
      <div className={styles.container}>
        <p>Contract: {truncateEthAddress(contractMerkleRoot)}</p>
        <span style={{ fontSize: "2em", color: synced ? "green" : "red" }}>
          {synced ? "=" : "≠"}
        </span>
        <p>Whitelist: {truncateEthAddress(whitelistRoot?.data)}</p>
      </div>

      {isValidationError && (
        <p className={styles.error}>Error parsing whitelist file</p>
      )}

      {synced ? (
        <h2>Synced ✅</h2>
      ) : (
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
