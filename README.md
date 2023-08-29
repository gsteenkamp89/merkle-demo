## Introduction

All source code for this example can be found [here](https://github.com/gsteenkamp89/merkle-demo), fork away!

In the web3 industry, employing a whitelist to control access to specific parts of your protocol is a widely adopted practice. Implementing this involves restricting access to certain functions within our smart contract, limiting it solely to a select few wallet addresses.

For gas saving reasons, the most efficient way of doing this is by using a [merkle tree](https://en.wikipedia.org/wiki/Merkle_tree).

![merkle tree](https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Hash_Tree.svg/1200px-Hash_Tree.svg.png)

The reason we use a merkle tree is because **storing data on-chain is expensive.** Meaning, for every byte we store or change, the more gas we pay for that state-change transaction. If we didn't use a merkle tree, but instead we just set a huge mapping of, say, a thousand whitelisted addresses we would pay a ton of gas. And the longer the list, the more gas we pay.

It would be a lot cheaper to set **one hash**, only once, no matter the size of this list, and use that hash to prove that a user is in the list.

### The process

In order to do this we need to create a merkle tree using our whitelisted **addresses as the leaf nodes**. We then generate a root hash and store that in our contract. If the whitelist ever changes, we need to update this root.

Then, if a user wants to call a function in our contract that is for whitelisted users only, they need to send along a **merkle proof**. Think of this as a set of directions to follow from the root of the tree all the way to the correct leaf node for that user. If the address in that leaf node matches the address that sent the transaction ( `msg.sender` ), then we proceed with the transaction! Each proof is unique to each user.

So using our merkle tree is fairly simple, right? To summarize, we need to do 2 things:

1. Store the merkle root in our contract
2. Generate a merkle proof using the user's address and send that along with other functions arguments. The contract can then use the root to verify the merkle proof, providing on-chain whitelisting. 🚀

Simple right?

## Headaches abound

![bang head on desk](https://media.giphy.com/media/xxCNsOokj8Rxp8EtUL/giphy.gif)

There are simply too many points of failure in this process:

1. Running a script manually to generate a merkle root is clunky and time consuming.
2. Someone can add entries to the whitelist in an incorrect format, causing the script to fail unexpectedly
3. You are not guaranteed that the person who owns the owner wallet will actually update the root, or do it in a timely manner.
4. It can be difficult to know if the current root saved in the contract reflects the current state of the whitelist. (you can update the JSON file, but forget to generate the new root and call `setRoot()` on your contract! 🤦‍♂️)
5. This means it can often take **several team members** to: update the whitelist, store it on S3 (or IPFS) and set the new root.

## There is hope

With some clever engineering and UX, we can make this process much easier to use and less prone to failure. We can:

- Move all the merkle tree logic from a script to an API route,
- Store the whitelist on S3 (or other storage provider)
- Create an easy-to-use admin panel for the owner wallet to use set the merkle root on-chain.

![diagram](https://raw.githubusercontent.com/gsteenkamp89/merkle-demo/main/public/screenshots/diagram.png)

In this example we'll be using **Next.js** with **typecsript**, **merkletreejs**, **viem**, **wagmi** and **zod** as our validation library. All the code for this example can be found [here](https://github.com/gsteenkamp89/merkle-demo). Now let's jump in to some code!

first start our project (nextjs 13 with app dir.)

```bash
yarn create next-app --typescript
```

And create this folder structure:

```bash
.
└── app
    ├── admin
    ├── api
    │   └── whitelist
    │       ├── proof
    │       │   └── route.ts
    │       ├── root
    │       │   └── route.ts
    │       └── utils.ts
```

And before we start building our UI, let's get working on our 2 API routes:

First, let's get our logic together for fetching the whitelist file generating the merkle root.

This is what our whitelist file looks like:

```json
// whitelist.json

[
  { "name": "alice", "address": "0x443056c98c6C290596807293E10Ebc158b10f561" },
  { "name": "bob", "address": "0xb9b6b33424594181EAE1F18F9b4d58050d894534" },
  { "name": "charlie", "address": "0x883d9347E8B27AE12870c464939395EDCfdE98e5" }
]
```

Given the shape of our whitelist file, let's get some logic together for fetching and parsing this file in a type-safe way.

```typescript
// src/app/api/merkletree/utils.ts
import { z } from "zod";
import { MerkleTree } from "merkletreejs";
import { keccak256, toHex } from "viem";

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

export const fetchAndParseWhitelistFile = async () => {
  const whitelistFileLocation = "https://probably-on-aws.com";
  const file = await fetch(whitelistFileLocation).then((res) => res.json());

  const parsed = parseWhitelistFile(file);
  if (parsed.error) {
    throw new Error("Validation Error");
  } else {
    return parsed.data;
  }
};
```

Here we're using [zod](https://github.com/colinhacks/zod) to parse our json file and generate some types around it. We create a schema used to validate the file and export a type generated from that schema.

Here, the return type of `fetchAndParseWhitelistFile` is:

```typescript
Promise<{
    address: string;
    name: string;
}[]
```

Now that we can safely fetch and parse our file, let's add some logic to generate the merkle root from an array of adresses:

```typescript
import { Hex } from "viem";

export function generateRoot(addresses: string[]) {
  const leaves = addresses.map((address) => keccak256(toHex(address)));
  const trie = new MerkleTree(leaves, keccak256, {
    sortLeaves: true,
    sortPairs: true,
  });
  const root = trie.getHexRoot();
  return root as Hex;
}
```

And finally an api route we can call to fetch the root!

```typescript
// src/app/api/whitelist/root/route.ts

import { Hex } from "viem";
import {
  fetchAndParseWhitelistFile,
  generateRoot,
  isErrorWithMessage,
} from "../utils";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const whitelist = await fetchAndParseWhitelistFile();

    const merkleRoot = generateRoot(whitelist.map((user) => user.address));

    return NextResponse.json({ data: merkleRoot, status: 200 });
  } catch (error) {
    // any validation errors from Zod will be caught here
    if (isErrorWithMessage(error)) {
      return NextResponse.json({ error: error.message, status: 500 });
    }
    return NextResponse.json({ error: JSON.stringify(error), status: 500 });
  }
}

export interface MerkleRootResponse extends Response {
  data: Hex | undefined;
  error: string | undefined;
}
```

Let's test it by running our app locally

```bash
curl http://localhost:3000/api/whitelist/root

# {"data":"0xd628622469a3013a947a7599f0ddc52809860bf69633a3f6d021e0850fc8e788","status":200}
```

Amazing! 🚀

And we also need to generate a merkle proof given a user's address:

```typescript
// src/app/api/merkletree/utils.ts

export function generateProof(addresses: string[], addressToCheck: string) {
  try {
    const leaves = addresses.map((address) => keccak256(toHex(address)));
    const trie = new MerkleTree(leaves, keccak256, {
      sortLeaves: true,
      sortPairs: true,
    });
    const proof = trie.getHexProof(keccak256(toHex(addressToCheck))) as Hex[];
    return { proof };
  } catch (error) {
    return { error: "user not in whitelist" };
  }
}
```

And an API route to call:

```typescript
// src/app/api/whitelist/proof/route.ts

import { fetchAndParseWhitelistFile, generateProof } from "../utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const address = params.get("address");

    if (!address) {
      return NextResponse.json({ error: "no address in query", status: 400 });
    }

    const whitelist = await fetchAndParseWhitelistFile();

    const proofResult = generateProof(
      whitelist.map((user) => user.address),
      address
    );

    if (!proofResult.proof) {
      return NextResponse.json({ error: proofResult.error, status: 404 });
    }

    return NextResponse.json({ data: proofResult.proof, status: 200 });
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error), status: 500 });
  }
}

export interface MerkleProofResponse extends Response {
  data: string[] | undefined;
  error: string | undefined;
}
```

Again let's test it with bob's address (passed as a query parameter "address"):

```bash
curl http://localhost:3000/api/whitelist/proof\?address\=0xb9b6b33424594181EAE1F18F9b4d58050d894534

# {"data":["0x4029c73464c22200693323893e3ce1643d6feb59227a4a7e880160302ad342b5","0xc8e0d7e91862d8f501d0423a1fa17e428854b8812e3a7122a7b816ffe9cf9c13"],"status":200}
```

![happy dance](https://media.giphy.com/media/JltOMwYmi0VrO/giphy.gif)

Okay so now let's build some UI for our admin panel so that the owner wallet can manage the merkle root.

But first let's make some hooks to get the merkle root (from the whitelist)

```typescript
// src/app/hooks/whitelist.ts

import useSWR from "swr";
import { MerkleRootResponse } from "../api/whitelist/root/route";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useWhitelistMerkleRoot = () => {
  return useSWR<MerkleRootResponse>("/api/whitelist/root", fetcher);
};
```

Great! now we know what the merkle root _should_ be. But what is the latest merkle root stored on-chain? Let's create a hook to read that value from the contract.

```typescript
// src/app/hooks/whitelist.ts

import { useContractRead } from "wagmi";
import { whitelistedContractAbi } from "../web3/abis";

export const useContractMerkleRoot = () => {
  return useContractRead({
    address: "0x4c01896e63AB221CD99A406D2F617ad9135F44b4",
    abi: whitelistedContractAbi,
    functionName: "merkleRoot",
    chainId: 5,
  });
};
```

Awesome! Now to the same file we can add a function to **set** the merkle root on-chain to what it should be according to the whitelist.

```typescript
// src/app/hooks/whitelist.ts

import { useContractWrite, useContractRead } from "wagmi";
import { whitelistedContractAbi } from "../web3/abis";

export const useContractMerkleRoot = () => {
  return useContractRead({
    address: "0x4c01896e63AB221CD99A406D2F617ad9135F44b4",
    abi: whitelistedContractAbi,
    functionName: "merkleRoot",
    chainId: 5,
  });
};

export const useSetContractMerkleRoot = () => {
  return useContractWrite({
    address: "0x482f265d8d850fa6440e42b0b299c044caeb879a",
    abi: whitelistedContractAbi,
    functionName: "setMerkleRoot",
  });
};
```

And finally let's create a simple UI the admin wallet can use to:

1. Check if the on-chain merkle root is up to date and if not,
2. Set it to what it should be!

```tsx
// src/app/components/MerkleRootManager/MerkleRootManager.tsx

"use client";

import { ComponentProps } from "react";
import styles from "./MerkleRootManager.module.css";
import {
  useContractMerkleRoot,
  useSetContractMerkleRoot,
  useWhitelistMerkleRoot,
} from "~/app/hooks/whitelist";
import { truncateEthAddress } from "~/app/web3/utils";

interface MerkleRootManagerProps extends ComponentProps<"div"> {
  className?: string;
}

export const MerkleRootManager = ({
  className,
  ...props
}: MerkleRootManagerProps) => {
  const { data: whitelistRoot } = useWhitelistMerkleRoot();
  const { data: contractMerkleRoot } = useContractMerkleRoot();
  const { write, isLoading } = useSetContractMerkleRoot();
  const synced = contractMerkleRoot === whitelistRoot?.data;

  const handleSync = () => {
    if (!whitelistRoot?.data) {
      return;
    }
    write({
      args: [whitelistRoot.data],
    });
  };

  const isValidationError = whitelistRoot?.error
    ?.toLowerCase()
    ?.includes("validation");

  return (
    <div className={`${styles.merkleRootManager} ${className}`} {...props}>
      <h3>Merkle Root Manager</h3>
      <div className={styles.container}>
        <p>Contract: {truncateEthAddress(contractMerkleRoot)}</p>
        <span style={{ fontSize: "2em", color: synced ? "green" : "red" }}>
          {synced ? "=" : "≠"}
        </span>
        <p>Whitelist: {truncateEthAddress(whitelistRoot?.data)}</p>
      </div>

      {isValidationError && (
        <p className={styles.error}>Error parsing whitelist file</p>
      )}

      {synced ? (
        <h2>Synced ✅</h2>
      ) : (
        <button
          disabled={isLoading}
          className={styles.syncButton}
          onClick={handleSync}
        >
          {isLoading ? "busy..." : "Sync whitelist"}
        </button>
      )}
    </div>
  );
};
```

The Result:

Out of Sync

![Merkle roots out of sync](https://raw.githubusercontent.com/gsteenkamp89/merkle-demo/main/public/screenshots/not_synced.png)

Oh no I messed up the json file oops.

![Validation Error](https://raw.githubusercontent.com/gsteenkamp89/merkle-demo/main/public/screenshots/validation_error.png)

Now they are in sync

![In Sync](https://raw.githubusercontent.com/gsteenkamp89/merkle-demo/main/public/screenshots/synced.png)

## Closing thoughts

I know what you're thinking: This is completely over-engineered! And you might be right... BUT when your protocol start growing at a rapid rate and you have several contracts each with their own whitelists, things can get hairy VERY quickly.

This solution is a lot of boilerplate, but it scales really well and cuts down on room for error which is exactly what you want when you have a discord full of mad people aping into your NFT project.

Hope this helps. Happy coding frens.
