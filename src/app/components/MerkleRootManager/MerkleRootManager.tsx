"use client";

import { ComponentProps } from "react";
import styles from "./MerkleRootManager.module.css";
import {
  useContractMerkleRoot,
  useWhitelistMerkleRoot,
} from "~/app/hooks/whitelist";

interface MerkleRootManagerProps extends ComponentProps<"div"> {}

export const MerkleRootManager = ({
  className,
  ...props
}: MerkleRootManagerProps) => {
  const { data: whitelistRoot } = useWhitelistMerkleRoot();
  const { data: contractMerkleRoot } = useContractMerkleRoot();
  const synced = contractMerkleRoot === whitelistRoot;

  const handleSync = () => {};

  return (
    <div className={`${styles.merkleRootManager} ${className}`} {...props}>
      <h3>Merkle Root Manager</h3>
      <p>from contract: {contractMerkleRoot}</p>
      <p>from whitelist: {whitelistRoot?.data}</p>
      <p style={{ color: synced ? "green" : "red" }}>
        {synced ? "synced" : "not synced"}
      </p>
      {!synced && <button onClick={handleSync}>Sync whitelist</button>}
    </div>
  );
};
