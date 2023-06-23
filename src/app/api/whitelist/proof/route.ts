import { fetchAndParseWhitelistFile, generateRoot } from "../utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const address = params.get("address");

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "no adress in query", status: 400 });
    }

    const whitelist = await fetchAndParseWhitelistFile();

    const merkleRoot = generateRoot(whitelist.map((user) => user.address));

    return NextResponse.json({ data: merkleRoot, status: 200 });
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error), status: 500 });
  }
}

export interface MerkleProofResponse {
  data: string[] | undefined;
  status: string;
  error: string | undefined;
}
