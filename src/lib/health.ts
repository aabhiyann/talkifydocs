import { db } from "@/lib/db";
import { loggers } from "./logger";

interface HealthCheck {
  name: string;
  status: "healthy" | "unhealthy";
  message?: string;
  duration?: number;
}

export async function checkDatabaseHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
    const duration = Date.now() - startTime;

    return {
      name: "database",
      status: "healthy",
      message: "Database connection successful",
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    loggers.db.error("Database health check failed", { error });

    return {
      name: "database",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Unknown database error",
      duration,
    };
  }
}

export async function checkOpenAIHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    // Simple check - just verify API key is present
    if (!process.env.OPENAI_API_KEY) {
      return {
        name: "openai",
        status: "unhealthy",
        message: "OpenAI API key not configured",
        duration: Date.now() - startTime,
      };
    }

    const duration = Date.now() - startTime;
    return {
      name: "openai",
      status: "healthy",
      message: "OpenAI API key configured",
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    loggers.api.error("OpenAI health check failed", { error });

    return {
      name: "openai",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Unknown OpenAI error",
      duration,
    };
  }
}

export async function checkPineconeHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    if (!process.env.PINECONE_API_KEY) {
      return {
        name: "pinecone",
        status: "unhealthy",
        message: "Pinecone API key not configured",
        duration: Date.now() - startTime,
      };
    }

    const duration = Date.now() - startTime;
    return {
      name: "pinecone",
      status: "healthy",
      message: "Pinecone API key configured",
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    loggers.api.error("Pinecone health check failed", { error });

    return {
      name: "pinecone",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Unknown Pinecone error",
      duration,
    };
  }
}

export async function getSystemHealth(): Promise<{
  status: "healthy" | "unhealthy";
  checks: HealthCheck[];
  timestamp: string;
}> {
  const checks = await Promise.all([
    checkDatabaseHealth(),
    checkOpenAIHealth(),
    checkPineconeHealth(),
  ]);

  const allHealthy = checks.every((check) => check.status === "healthy");

  return {
    status: allHealthy ? "healthy" : "unhealthy",
    checks,
    timestamp: new Date().toISOString(),
  };
}
