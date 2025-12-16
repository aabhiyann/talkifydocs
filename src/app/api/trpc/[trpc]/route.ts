import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/trpc";
import { getCurrentUser } from "@/lib/auth";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      // Get the current user - this will be null if not authenticated
      // The middleware protects the route, so this should usually have a user
      const user = await getCurrentUser();

      return {
        user: user || null,
      };
    },
  });

export { handler as GET, handler as POST };
