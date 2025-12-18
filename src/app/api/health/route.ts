import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/trpc/server";
import { loggers } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const serverClient = await createServerClient();
    const health = await serverClient.healthCheck();

    return NextResponse.json(health, {
      status: health.status === "healthy" ? 200 : 503,
    });
  } catch (error) {
    loggers.api.error({ error }, "Health check failed");

    return NextResponse.json(
      {
        status: "unhealthy",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
