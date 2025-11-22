import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    // Find the user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Enable AI when trial or premium plan is selected
    // Note: Premium also enables AI, but premium is handled via payment webhook
    if (plan === 'trial' && !user.aiEnabled) {
      await db.user.update({
        where: { id: user.id },
        data: {
          aiEnabled: true,
        },
      });

      console.log(`AI enabled for user ${user.id} (Trial plan)`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error enabling AI:", error);
    return NextResponse.json(
      { error: "Failed to enable AI" },
      { status: 500 }
    );
  }
}
