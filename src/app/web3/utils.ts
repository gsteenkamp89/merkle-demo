export const truncateEthAddress = (address: string | undefined) => {
  if (address) {
    return `${address.substring(0, 5)}...${address.substring(
      address.length - 4
    )}`;
  }
};
