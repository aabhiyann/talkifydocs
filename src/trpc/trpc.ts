import { requireUser } from "@/lib/auth";
import { TRPCError, initTRPC } from "@trpc/server";

const t = initTRPC.create();
const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
  try {
    const user = await requireUser();

    return opts.next({
      ctx: {
        userId: user.id,
        user,
      },
    });
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
