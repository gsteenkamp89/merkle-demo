import { z } from "zod";
import { MerkleTree } from "merkletreejs";
import { ethers } from "ethers";
import path from "path";
import { promises as fs } from "fs";

export const WhitelistSchema = z.array(
  z.object({
    name: z.string(),
    address: z.string(),
  })
);

export type WhitelistFile = z.infer<typeof WhitelistSchema>;

export function parseWhitelistFile(file: unknown) {
  const parsed = WhitelistSchema.safeParse(file);

  if (parsed.success) {
    return {
      success: true,
      data: parsed.data,
      error: undefined,
    };
  }

  return {
    success: false,
    data: undefined,
    error: parsed.error,
  };
}

export const fetchFile = async () => {
  const dir = path.resolve("./public");

  const file = await fs.readFile(`${dir}/whitelist.json`, "utf8");
  return JSON.parse(file);
};

export const fetchAndParseWhitelistFile = async () => {
  //const whitelistFileLocation = "https://probably-on-aws.com";
  const file = await fetchFile();

  const parsed = parseWhitelistFile(file);
  if (parsed.error) {
    throw new Error(parsed.error.toString());
  } else {
    return parsed.data;
  }
};

export function generateRoot(addresses: string[]) {
  const leaves = addresses.map((address) => ethers.keccak256(address));
  const trie = new MerkleTree(leaves, ethers.keccak256, {
    sortLeaves: true,
    sortPairs: true,
  });
  const root = trie.getHexRoot();
  return root;
}

export function generateProof(addresses: string[], addressToCheck: string) {
  const leaves = addresses.map((address) => ethers.keccak256(address));
  const trie = new MerkleTree(leaves, ethers.keccak256, {
    sortLeaves: true,
    sortPairs: true,
  });
  const proof = trie.getHexProof(ethers.keccak256(addressToCheck));
  return proof;
}
