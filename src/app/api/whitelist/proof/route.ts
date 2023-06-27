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
