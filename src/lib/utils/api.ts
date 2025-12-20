import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ApiResponseOptions = {
  status?: number;
  headers?: Record<string, string>;
};

export function successResponse<T>(data: T, options: ApiResponseOptions = {}) {
  return NextResponse.json(data, {
    status: options.status || 200,
    headers: options.headers,
  });
}

export function errorResponse(error: unknown, options: ApiResponseOptions = {}) {
  console.error(error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation Error", details: error.errors },
      { status: 400, ...options }
    );
  }

  const message = error instanceof Error ? error.message : "Internal Server Error";
  const status = options.status || 500;

  return NextResponse.json({ error: message }, { status, ...options });
}
