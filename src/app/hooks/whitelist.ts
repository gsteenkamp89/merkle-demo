import useSWR from "swr";
import { MerkleRootResponse } from "../api/whitelist/root/route";
import { useContractRead, useContractWrite } from "wagmi";
import { whitelistedContractAbi } from "../web3/abis";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useWhitelistMerkleRoot = () => {
  return useSWR<MerkleRootResponse>("/api/whitelist/root", fetcher);
};

export const useContractMerkleRoot = () => {
  return useContractRead({
    address: "0x828DA3378891Df13d578D841adbEf8863E667051",
    abi: whitelistedContractAbi,
    functionName: "merkleRoot",
    chainId: 5,
  });
};

export const useSetContractMerkleRoot = () => {
  return useContractWrite({
    address: "0x828DA3378891Df13d578D841adbEf8863E667051",
    abi: whitelistedContractAbi,
    functionName: "setMerkleRoot",
  });
};
