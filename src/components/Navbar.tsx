"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Menu,
  X,
  MessageSquare,
  Settings,
  User,
  Home,
  Zap,
  Shield,
} from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { ThemeToggle } from "./ThemeToggle";
import { buttonVariants, Button } from "./ui/button";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  const { data: adminStatus } = trpc.checkAdminStatus.useQuery(undefined, {
    enabled: !!user,
  });
  const isAdmin = adminStatus?.isAdmin || false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: "/features", label: "Features", icon: Zap },
    { href: "/about", label: "About", icon: User },
    { href: "/pricing", label: "Pricing", icon: Settings },
    { href: "/contact", label: "Contact", icon: MessageSquare },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled
        ? "bg-background/80 border-b border-border/50 shadow-sm backdrop-blur-lg"
        : "bg-background/60 backdrop-blur-md"
        }`}
    >
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group z-50 flex items-center space-x-2">
            <div className="relative h-8 w-8 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/brand/logos/square.png"
                alt="TalkifyDocs"
                fill
                className="object-contain"
                priority
                sizes="32px"
              />
            </div>
            <span className="text-heading-lg bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text font-bold text-transparent">
              TalkifyDocs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-body-sm flex items-center space-x-1 rounded-lg px-3 py-2 font-medium transition-all duration-200 ${isActive(item.href)
                    ? "dark:bg-primary-900/20 bg-primary-50 text-primary-700 dark:text-primary-300"
                    : "dark:hover:bg-secondary-800/50 text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="ml-4 flex items-center space-x-2 border-l border-secondary-200 pl-4">
              <ThemeToggle />

              <SignedIn>
                <div className="flex items-center space-x-2">
                  <Link
                    href="/dashboard"
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 border border-border/60 shadow-sm rounded-full",
                      },
                    }}
                  />
                </div>
              </SignedIn>

              <SignedOut>
                <>
                  <Link
                    href="/sign-in"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Sign in
                  </Link>
                  <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
                    Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </>
              </SignedOut>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="bg-background/95 border-t border-border backdrop-blur-lg md:hidden">
            <div className="flex flex-col space-y-1 p-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive(item.href)
                      ? "dark:bg-primary-900/20 bg-primary-50 text-primary-700 dark:text-primary-300"
                      : "dark:hover:bg-secondary-800/50 text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="border-t border-secondary-200 pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Theme
                  </span>
                  <ThemeToggle />
                </div>

                <SignedIn>
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="dark:hover:bg-secondary-800/50 flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 dark:text-secondary-300 dark:hover:text-secondary-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/billing"
                      className="dark:hover:bg-secondary-800/50 flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 dark:text-secondary-300 dark:hover:text-secondary-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Billing</span>
                    </Link>
                    <div className="flex items-center justify-between rounded-lg border border-secondary-200 px-3 py-2 dark:border-secondary-700">
                      <span className="text-sm font-medium">Account</span>
                      <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                          elements: { avatarBox: "w-8 h-8" },
                        }}
                      />
                    </div>
                  </div>
                </SignedIn>

                <SignedOut>
                  <div className="space-y-2">
                    <Link
                      href="/sign-in"
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      className={buttonVariants({ size: "sm" })}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </div>
                </SignedOut>
              </div>
            </div>
          </div>
        )}
      </MaxWidthWrapper>
    </nav>
  );
};
