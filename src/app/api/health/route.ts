import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPineconeClient } from "@/lib/ai/pinecone";
import { loggers } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  try {
    // Check database
    const dbStart = Date.now();
    try {
      await db.$queryRaw`SELECT 1`;
      checks.database = {
        status: "up",
        latency: Date.now() - dbStart,
      };
    } catch (error) {
      checks.database = {
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Check Pinecone
    const pineconeStart = Date.now();
    try {
      const pinecone = getPineconeClient();
      await pinecone.listIndexes();
      checks.pinecone = {
        status: "up",
        latency: Date.now() - pineconeStart,
      };
    } catch (error) {
      checks.pinecone = {
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Check Redis/Cache (optional)
    try {
      const { cacheService } = await import("@/lib/cache");
      const testKey = `health:check:${Date.now()}`;
      await cacheService.set(testKey, { test: true }, 10);
      const cached = await cacheService.get(testKey);
      await cacheService.del(testKey);
      checks.cache = {
        status: cached ? "up" : "down",
      };
    } catch (error) {
      checks.cache = {
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    const allHealthy = Object.values(checks).every((check) => check.status === "up");
    const totalLatency = Date.now() - startTime;

    const health = {
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: checks,
      latency: totalLatency,
    };

    loggers.api.info(
      {
        health: health.status,
        checks: Object.keys(checks).length,
        latency: totalLatency,
      },
      "Health check requested"
    );

    return NextResponse.json(health, {
      status: allHealthy ? 200 : 503,
    });
  } catch (error) {
    loggers.api.error({ error }, "Health check failed");

    return NextResponse.json(
      {
        status: "unhealthy",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
        services: checks,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
