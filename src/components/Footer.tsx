"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Mail, Phone, MapPin, Twitter, Linkedin, Github, ArrowRight, Heart } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { companyConfig } from "@/config/company";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "API", href: "/api" },
      { name: "Integrations", href: "/integrations" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
    resources: [
      { name: "Help Center", href: "/help" },
      { name: "Documentation", href: "/docs" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Community", href: "/community" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  // Build social links array only for configured social media
  const socialLinks = [];
  if (companyConfig.social.twitter) {
    socialLinks.push({ name: "Twitter", href: companyConfig.social.twitter, icon: Twitter });
  }
  if (companyConfig.social.linkedin) {
    socialLinks.push({ name: "LinkedIn", href: companyConfig.social.linkedin, icon: Linkedin });
  }
  if (companyConfig.social.github) {
    socialLinks.push({ name: "GitHub", href: companyConfig.social.github, icon: Github });
  }

  return (
    <footer className="border-t border-secondary-200 bg-gradient-to-b from-white to-secondary-50 dark:border-secondary-800 dark:from-secondary-50 dark:to-black">
      <MaxWidthWrapper>
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
                  <span className="text-sm font-bold text-white">T</span>
                </div>
                <span className="text-xl font-bold text-secondary-900">
                  TalkifyDocs
                </span>
              </Link>
              <p className="text-body-md mb-6 max-w-sm text-secondary-600">
                Transform your documents into intelligent conversations with AI-powered analysis and
                insights.
              </p>

              {/* Contact Info */}
              {(companyConfig.contact.email || companyConfig.contact.phone || companyConfig.contact.location) && (
                <div className="space-y-3">
                  {companyConfig.contact.email && (
                    <div className="text-body-sm flex items-center gap-3 text-secondary-600">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${companyConfig.contact.email}`} className="hover:text-primary-600">
                        {companyConfig.contact.email}
                      </a>
                    </div>
                  )}
                  {companyConfig.contact.phone && (
                    <div className="text-body-sm flex items-center gap-3 text-secondary-600">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${companyConfig.contact.phone.replace(/\s/g, "")}`} className="hover:text-primary-600">
                        {companyConfig.contact.phone}
                      </a>
                    </div>
                  )}
                  {companyConfig.contact.location && (
                    <div className="text-body-sm flex items-center gap-3 text-secondary-600">
                      <MapPin className="h-4 w-4" />
                      <span>{companyConfig.contact.location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-heading-md mb-4 text-secondary-900">
                Product
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-secondary-600 transition-colors duration-200 hover:text-primary-600"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-heading-md mb-4 text-secondary-900">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-secondary-600 transition-colors duration-200 hover:text-primary-600"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-heading-md mb-4 text-secondary-900">
                Resources
              </h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-secondary-600 transition-colors duration-200 hover:text-primary-600"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-heading-md mb-4 text-secondary-900">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-secondary-600 transition-colors duration-200 hover:text-primary-600"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-12 border-t border-secondary-200 pt-8 dark:border-secondary-800">
            <div className="glass rounded-2xl p-8">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-heading-lg mb-2 text-secondary-900">
                    Stay Updated
                  </h3>
                  <p className="text-body-md text-secondary-600">
                    Get the latest updates, features, and tips delivered to your inbox.
                  </p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 rounded-xl border border-secondary-200 bg-white px-4 py-3 text-secondary-900 placeholder:text-secondary-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-secondary-100"
                  />
                  <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:from-primary-700 hover:to-accent-700">
                    Subscribe
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-secondary-200 py-6 dark:border-secondary-800">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-body-sm flex items-center gap-2 text-secondary-600">
              <span className="flex items-center gap-1">
                © {currentYear} TalkifyDocs. Made with <Heart className="h-4 w-4 text-red-500 fill-current" />
                {companyConfig.footer.showLocation && companyConfig.footer.location && ` in ${companyConfig.footer.location}.`}
              </span>
            </div>

            <div className="flex items-center gap-6">
              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-4">
                  {socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-100 transition-colors duration-200 hover:bg-primary-100 dark:bg-secondary-800 dark:hover:bg-primary-900"
                      aria-label={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <social.icon className="h-4 w-4 text-secondary-600" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
