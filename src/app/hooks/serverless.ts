import useSWR from "swr";
import { MerkleRootResponse } from "../api/whitelist/root/route";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useMerkleRoot = () => {
  return useSWR<MerkleRootResponse>("/api/whitelist/root", fetcher);
};
