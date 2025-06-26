import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import {
  daoLiquidityPoolSchema,
  eligibleAddressesSchema,
} from "@/lib/db/schema";
import { eq, or, inArray } from "drizzle-orm";
import { isAddress } from "viem";
import { GetDaoAddressesResponse } from "@/lib/types/api";

interface AddressListRequest {
  daoName: string;
  poolId: string;
  poolOwner: string;
  eligibleAddresses: string[];
  daoTokenAddress: string;
  daoTokenName: string;
  daoTokenSymbol: string;
  daoTokenDecimals: number;
  liquidityTokenAddress: string;
  liquidityTokenName: string;
  liquidityTokenSymbol: string;
  liquidityTokenDecimals: number;
  tickSpacing: number;
  lpFee: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AddressListRequest = await request.json();

    // Validate required fields
    if (
      !body.poolId ||
      !body.daoName ||
      !body.eligibleAddresses ||
      body.lpFee === undefined ||
      body.tickSpacing === undefined ||
      !body.poolOwner ||
      !body.daoTokenAddress ||
      !body.daoTokenName ||
      !body.daoTokenSymbol ||
      !body.daoTokenDecimals ||
      !body.liquidityTokenAddress ||
      !body.liquidityTokenName ||
      !body.liquidityTokenSymbol ||
      !body.liquidityTokenDecimals
    ) {
      return NextResponse.json(
        {
          error: "400 Bad Request",
        },
        { status: 400 }
      );
    }

    // Validate that eligibleAddresses is an array and not empty
    if (
      !Array.isArray(body.eligibleAddresses) ||
      body.eligibleAddresses.length === 0
    ) {
      return NextResponse.json(
        { error: "eligibleAddresses must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate address format (basic check for 0x prefix and length)
    const invalidAddresses = body.eligibleAddresses.filter(
      (address) => !address.startsWith("0x") || address.length !== 42
    );

    if (invalidAddresses.length > 0) {
      return NextResponse.json(
        { error: "Invalid address format detected", invalidAddresses },
        { status: 400 }
      );
    }

    // Insert the DAO liquidity pool record
    const [daoResult] = await db
      .insert(daoLiquidityPoolSchema)
      .values({
        poolId: body.poolId,
        daoName: body.daoName,
        poolOwner: body.poolOwner.toLowerCase(),
        daoTokenAddress: body.daoTokenAddress.toLowerCase(),
        daoTokenName: body.daoTokenName,
        daoTokenSymbol: body.daoTokenSymbol,
        daoTokenDecimals: body.daoTokenDecimals,
        liquidityTokenAddress: body.liquidityTokenAddress.toLowerCase(),
        liquidityTokenName: body.liquidityTokenName,
        liquidityTokenSymbol: body.liquidityTokenSymbol,
        liquidityTokenDecimals: body.liquidityTokenDecimals,
        tickSpacing: body.tickSpacing,
        lpFee: body.lpFee,
      })
      .returning();

    // Insert eligible addresses
    const eligibleAddressesData = body.eligibleAddresses.map((address) => ({
      daoId: daoResult.id,
      address: address.toLowerCase(),
    }));

    await db.insert(eligibleAddressesSchema).values(eligibleAddressesData);

    return NextResponse.json({
      success: true,
      message: "Address list saved successfully",
      data: {
        id: daoResult.id,
        daoName: daoResult.daoName,
        addressCount: body.eligibleAddresses.length,
        savedAt: daoResult.createdAt,
      },
    });
  } catch (error) {
    console.error("Error saving address list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GetDaoAddressesResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const daoName = searchParams.get("daoName");
    const daoTokenAddress = searchParams.get("daoTokenAddress");
    const eligibleAddress = searchParams.get("eligibleAddress");

    let daoRecords;

    if (eligibleAddress) {
      // Validate address format for eligibleAddress
      if (!isAddress(eligibleAddress)) {
        return NextResponse.json(
          { error: "Invalid eligibleAddress format" },
          { status: 400 }
        );
      }

      // Fetch DAOs that have the specified eligible address
      const eligibleAddressRecords = await db
        .select()
        .from(eligibleAddressesSchema)
        .where(
          eq(eligibleAddressesSchema.address, eligibleAddress.toLowerCase())
        );

      if (eligibleAddressRecords.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No DAOs found with the specified eligible address",
          data: [],
        });
      }

      const daoIds = eligibleAddressRecords.map((record) => record.daoId);

      daoRecords = await db
        .select()
        .from(daoLiquidityPoolSchema)
        .where(inArray(daoLiquidityPoolSchema.id, daoIds));
    } else {
      // Build query conditions for daoName and daoTokenAddress
      const conditions = [];
      if (daoName) {
        conditions.push(eq(daoLiquidityPoolSchema.daoName, daoName));
      }
      if (daoTokenAddress) {
        conditions.push(
          eq(
            daoLiquidityPoolSchema.daoTokenAddress,
            daoTokenAddress.toLowerCase()
          )
        );
      }

      // Fetch DAO records
      daoRecords = await db
        .select()
        .from(daoLiquidityPoolSchema)
        .where(or(...conditions));
    }

    // Fetch eligible addresses for each DAO
    const transformedData = await Promise.all(
      daoRecords.map(async (dao) => {
        const eligibleAddresses = await db
          .select({ address: eligibleAddressesSchema.address })
          .from(eligibleAddressesSchema)
          .where(eq(eligibleAddressesSchema.daoId, dao.id));

        return {
          ...dao,
          eligibleAddresses: eligibleAddresses.map((ea) => ea.address),
        };
      })
    );

    const response: GetDaoAddressesResponse = {
      success: true,
      message: "Address list retrieved successfully",
      data: transformedData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error retrieving address list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
