"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

const AuthCallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, isLoading } = trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (success) {
        //user is synced to the database
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        router.push("/sign-in");
      }
    },
    retry: true,
    retryDelay: 500,
  });

  return (
    <div className="mt-24 flex w-full justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-gray-800" />
        <h3 className="text-xl font-semibold">Setting up your new account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="mt-24 flex w-full justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-gray-800" />
            <h3 className="text-xl font-semibold">Loading...</h3>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
};

export default Page;
