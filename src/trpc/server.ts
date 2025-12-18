import { appRouter } from "./index";
import { getCurrentUser } from "@/lib/auth";

export const createServerClient = async () => {
  const user = await getCurrentUser();
  const caller = appRouter.createCaller({
    user: user,
  });
  return caller;
};
