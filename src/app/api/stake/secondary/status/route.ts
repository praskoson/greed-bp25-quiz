import { logError } from "@/lib/logger";
import { AuthContext, withAuth } from "@/lib/middleware/with-auth";
import { StakeService } from "@/lib/stake/stake.service";
import { NextRequest, NextResponse } from "next/server";

const handler = async (request: NextRequest, _context: AuthContext) => {
  try {
    const { searchParams } = new URL(request.url);
    const stakeId = searchParams.get("stakeId");

    if (!stakeId) {
      return NextResponse.json(
        { error: "stakeId is required" },
        { status: 400 },
      );
    }

    const stake = await StakeService.getSecondaryStake(stakeId);

    if (!stake) {
      return NextResponse.json({ error: "Stake not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: stake.verification,
      totalStakeSol: stake.totalStakeLamports / 1e9,
    });
  } catch (error: any) {
    logError(error, "secondary-stake-status");

    return NextResponse.json(
      { error: error.message || "Failed to get stake status" },
      { status: 500 },
    );
  }
};

export const GET = withAuth(handler);
