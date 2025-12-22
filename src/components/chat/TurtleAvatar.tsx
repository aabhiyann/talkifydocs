"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface TurtleAvatarProps {
    className?: string;
    size?: "xs" | "sm" | "md" | "lg";
    state?: "thinking" | "happy" | "neutral";
}

const sizeMap = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-24 w-24",
};

const stateMap = {
    thinking: "/brand/states/processing.png",
    happy: "/brand/states/success.png",
    neutral: "/brand/icons/icon-192.png",
};

export const TurtleAvatar = ({
    className,
    size = "sm",
    state = "neutral"
}: TurtleAvatarProps) => {
    return (
        <div
            className={cn(
                "relative flex-shrink-0",
                sizeMap[size],
                state === "thinking" && "animate-pulse",
                className
            )}
        >
            <Image
                src={stateMap[state]}
                alt="Turtle Mascot"
                fill
                className="object-contain"
                sizes={size === "lg" ? "96px" : "48px"}
            />
        </div>
    );
};
