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
