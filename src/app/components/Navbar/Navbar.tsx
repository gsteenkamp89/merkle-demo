import { ComponentProps } from "react";
import { ConnectButton } from "../ConnectButton";
import styles from "./Navbar.module.css";

interface NavbarProps extends ComponentProps<"nav"> {
  className?: string;
}

export const Navbar = ({ className, ...props }: NavbarProps) => {
  return (
    <nav className={`${styles.navbar} ${className}`} {...props}>
      <ConnectButton className={styles.connectButton} />
    </nav>
  );
};
