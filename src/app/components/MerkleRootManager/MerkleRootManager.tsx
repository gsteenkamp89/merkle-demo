"use client";

import { ComponentProps } from "react";
import styles from "./MerkleRootManager.module.css";
import { useMerkleRoot } from "~/app/hooks/serverless";

interface MerkleRootManagerProps extends ComponentProps<"div"> {}

export const MerkleRootManager = ({
  className,
  ...props
}: MerkleRootManagerProps) => {
  const { data: whitelistRoot } = useMerkleRoot();
  const synced = true;

  const handleSync = () => {};

  return (
    <div className={`${styles.merkleRootManager} ${className}`} {...props}>
      <h3>Merkle Root Manager</h3>
      <p>from contract: {}</p>
      <p>from whitelist: {whitelistRoot?.data}</p>
      <p style={{ color: synced ? "green" : "red" }}>
        {synced ? "synced" : "not synced"}
      </p>
      {!synced && <button onClick={handleSync}>Sync whitelist</button>}
    </div>
  );
};
