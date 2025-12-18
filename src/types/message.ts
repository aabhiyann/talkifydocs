import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";
import { ReactElement } from "react";
import { Citation } from "./chat";

type RouterOutput = inferRouterOutputs<AppRouter>;

type Messages = RouterOutput["getFileMessages"]["messages"];

type OmitText = Omit<Messages[number], "text">;

type ExtendedText = {
  text: string | ReactElement;
  citations?: Citation[];
};

export type ExtendedMessage = OmitText & ExtendedText;
