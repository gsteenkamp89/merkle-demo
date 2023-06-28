import styles from "./page.module.css";
import { MerkleRootManager } from "~/app/components/MerkleRootManager";

export default function Home() {
  return (
    <main className={styles.main}>
      <MerkleRootManager />
    </main>
  );
}
