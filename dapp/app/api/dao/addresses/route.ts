import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import {
  daoLiquidityPoolSchema,
  eligibleAddressesSchema,
} from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

interface AddressListRequest {
  daoName: string;
  daoTokenAddress: string;
  eligibleAddresses: string[];
  liquidityTokenAddress?: string;
  tickSpacing?: number;
  lpFee?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AddressListRequest = await request.json();

    // Validate required fields
    if (!body.daoName || !body.daoTokenAddress || !body.eligibleAddresses) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: daoName, daoTokenAddress, or eligibleAddresses",
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
        daoName: body.daoName,
        daoTokenAddress: body.daoTokenAddress,
        liquidityTokenAddress:
          body.liquidityTokenAddress ||
          "0xA0b86a33E6411e70e5b9Ec8c1DB5F4a1e8c6f1e9", // Default USDC
        tickSpacing: body.tickSpacing || 1,
        lpFee: body.lpFee || 0,
      })
      .returning();

    // Insert eligible addresses
    const eligibleAddressesData = body.eligibleAddresses.map((address) => ({
      daoId: daoResult.id,
      address,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daoName = searchParams.get("daoName");
    const daoTokenAddress = searchParams.get("daoTokenAddress");

    if (!daoName && !daoTokenAddress) {
      return NextResponse.json(
        {
          error:
            "Please provide either daoName or daoTokenAddress as query parameter",
        },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [];
    if (daoName) {
      conditions.push(eq(daoLiquidityPoolSchema.daoName, daoName));
    }
    if (daoTokenAddress) {
      conditions.push(
        eq(daoLiquidityPoolSchema.daoTokenAddress, daoTokenAddress)
      );
    }

    // Fetch DAO records
    const daoRecords = await db
      .select()
      .from(daoLiquidityPoolSchema)
      .where(or(...conditions));

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

    return NextResponse.json({
      success: true,
      message: "Address list retrieved successfully",
      data: transformedData,
    });
  } catch (error) {
    console.error("Error retrieving address list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
