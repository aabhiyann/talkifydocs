"use client";

import React from "react";
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from "react-resizable-panels";
import { ChatWrapper } from "../chat/ChatWrapper";
import AsyncPdfRenderer from "../AsyncPdfRenderer";

interface ResizableChatLayoutProps {
  fileUrl: string;
  fileId: string;
}

export function ResizableChatLayout({ fileUrl, fileId }: ResizableChatLayoutProps) {
  return (
    <PanelGroup direction="horizontal" className="flex-1 bg-slate-50/20 dark:bg-black/20">
      <Panel defaultSize={50} minSize={30} className="relative">
        <div className="h-full px-4 py-6 sm:px-6 lg:pl-8 xl:pl-6 backdrop-blur-[2px]">
          <AsyncPdfRenderer url={fileUrl} />
        </div>
      </Panel>
      
      <PanelResizeHandle className="group relative w-1 transition-all hover:w-1.5 duration-300">
        <div className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-border group-hover:bg-primary-500/50 group-active:bg-primary-500 transition-colors" />
        {/* Glow effect for the handle */}
        <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-primary-500/0 via-primary-500 to-primary-500/0 transition-opacity" />
      </PanelResizeHandle>

      <Panel defaultSize={50} minSize={30}>
        <div className="h-full border-l border-white/10 dark:border-white/5 bg-white/10 dark:bg-zinc-900/10 backdrop-blur-md">
          <ChatWrapper fileId={fileId} />
        </div>
      </Panel>
    </PanelGroup>
  );
}
