import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/user/activate-premium
 * Manually activate premium for the current user (fallback for when webhook doesn't work)
 * This is a development fallback - in production, only the webhook should update premium status
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has premium
    if (user.hasPremium) {
      return NextResponse.json({
        success: true,
        message: "User already has premium",
        hasPremium: true,
        aiEnabled: user.aiEnabled,
      });
    }

    // Update user to have premium access AND enable AI
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        hasPremium: true,
        aiEnabled: true,
      },
    });

    console.log(`✅ [MANUAL ACTIVATION] User ${user.id} (${user.email}) upgraded to premium successfully`);

    return NextResponse.json({
      success: true,
      message: "Premium activated successfully",
      hasPremium: updatedUser.hasPremium,
      aiEnabled: updatedUser.aiEnabled,
    });
  } catch (error) {
    console.error("❌ [MANUAL ACTIVATION] Error activating premium:", error);
    return NextResponse.json(
      { error: "Failed to activate premium" },
      { status: 500 }
    );
  }
}
