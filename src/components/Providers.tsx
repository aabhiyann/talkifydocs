"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { httpBatchLink } from "@trpc/client";
import { ThemeProvider } from "./ThemeProvider";
import { KeyboardShortcutsProvider } from "./KeyboardShortcuts";
import { useNotifications, NotificationContainer } from "./ui/notification";

const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "/api/trpc" })],
    })
  );

  return (
    <ThemeProvider defaultTheme="system" storageKey="talkifydocs-ui-theme">
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <KeyboardShortcutsProvider>
            {children}
          </KeyboardShortcutsProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ThemeProvider>
  );
};

export default Providers;
