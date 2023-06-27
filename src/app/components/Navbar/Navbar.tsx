import { ConnectButton } from "../ConnectButton/ConnectButton";
import styles from "./Navbar.module.css";

export const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <ConnectButton className={styles.connectButton} />
    </nav>
  );
};
