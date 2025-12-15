import { TRPCError, initTRPC } from "@trpc/server";
import type { AuthUser } from "@/lib/auth";

const t = initTRPC.context<{
  user?: AuthUser | null;
}>().create();
const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
  const { ctx } = opts;
  
  // Check if user exists in context
  if (!ctx.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED",
      message: "User not authenticated"
    });
  }

  return opts.next({
    ctx: {
      userId: ctx.user.id,
      user: ctx.user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
