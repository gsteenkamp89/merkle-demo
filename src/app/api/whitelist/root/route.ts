import { fetchAndParseWhitelistFile, generateRoot } from "../utils";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const whitelist = await fetchAndParseWhitelistFile();

    const merkleRoot = generateRoot(whitelist.map((user) => user.address));

    return NextResponse.json({ data: merkleRoot, status: 200 });
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error), status: 500 });
  }
}

export interface MerkleRootResponse extends Response {
  data: string | undefined;
  error: string | undefined;
}
