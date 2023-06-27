import useSWR from "swr";
import { MerkleRootResponse } from "../api/whitelist/root/route";
import { useContractRead } from "wagmi";
import { whitelistedContractAbi } from "../web3/abis";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useWhitelistMerkleRoot = () => {
  return useSWR<MerkleRootResponse>("/api/whitelist/root", fetcher);
};

export const useContractMerkleRoot = () => {
  // { data, isError, isLoading }
  return useContractRead({
    address: "0x482f265d8d850fa6440e42b0b299c044caeb879a",
    abi: whitelistedContractAbi,
    functionName: "merkleRoot",
    chainId: 5,
  });
};
