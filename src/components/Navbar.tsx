"use client";

import React, { useState } from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "./ui/button";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span className="text-xl">TalkifyDocs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-4 sm:flex">
            <Link
              href="/pricing"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Pricing
            </Link>
            <LoginLink
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Sign in
            </LoginLink>
            <RegisterLink className={buttonVariants({ size: "sm" })}>
              Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
            </RegisterLink>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-zinc-200 bg-white/95 backdrop-blur-lg">
            <div className="flex flex-col space-y-2 p-4">
              <Link
                href="/pricing"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <LoginLink
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </LoginLink>
              <RegisterLink
                className={buttonVariants({ size: "sm" })}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
              </RegisterLink>
            </div>
          </div>
        )}
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
