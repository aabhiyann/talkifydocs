"use client";

import React, { useState, useEffect } from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { ArrowRight, Menu, X, FileText, MessageSquare, Settings, User, LogOut } from "lucide-react";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated } = useKindeBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    // Kinde sign out logic
    router.push("/api/auth/logout");
  };

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-200 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm" 
        : "bg-white/80 backdrop-blur-sm"
    }`}>
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              TalkifyDocs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 md:flex">
            <Link
              href="/features"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Features
            </Link>
            <Link
              href="/about"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              About
            </Link>
            <Link
              href="/pricing"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Pricing
            </Link>
                <Link
                  href="/contact"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Contact
                </Link>
                <ThemeToggle />
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
                    href="/features"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="/about"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/pricing"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/contact"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-gray-600">Theme</span>
                    <ThemeToggle />
                  </div>
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
