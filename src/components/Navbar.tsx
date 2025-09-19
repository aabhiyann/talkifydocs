"use client";

import React, { useState, useEffect } from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {
  ArrowRight,
  Menu,
  X,
  FileText,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Home,
  Zap,
} from "lucide-react";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated } = useKindeBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    router.push("/api/auth/logout");
  };

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: "/features", label: "Features", icon: Zap },
    { href: "/about", label: "About", icon: User },
    { href: "/pricing", label: "Pricing", icon: Settings },
    { href: "/contact", label: "Contact", icon: MessageSquare },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
        ? "bg-white/95 backdrop-blur-md border-b border-secondary-200 shadow-sm" 
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
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
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                      : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-secondary-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-secondary-200">
              <ThemeToggle />

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="hidden sm:inline">
                        {user?.given_name || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">
                        {user?.given_name} {user?.family_name}
                      </p>
                      <p className="text-xs text-secondary-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-2"
                      >
                        <Home className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/billing"
                        className="flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Billing</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <LoginLink
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Sign in
                  </LoginLink>
                  <RegisterLink className={buttonVariants({ size: "sm" })}>
                    Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                  </RegisterLink>
                </>
              )}
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
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
          {isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 bg-white/95 backdrop-blur-lg">
            <div className="flex flex-col space-y-1 p-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                        : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-secondary-800/50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-secondary-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Theme
                  </span>
                  <ThemeToggle />
                </div>

                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                      <p className="text-sm font-medium">
                        {user?.given_name} {user?.family_name}
                      </p>
                      <p className="text-xs text-secondary-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-secondary-800/50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/billing"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-secondary-800/50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Billing</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <LoginLink
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </LoginLink>
                    <RegisterLink
                      className={buttonVariants({ size: "sm" })}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                    </RegisterLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
