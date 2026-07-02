"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book" },
  { href: "/live", label: "Live" },
  { href: "/shop", label: "Shop" },
  { href: "/news", label: "News" },
  { href: "/account", label: "Account" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-primary-900/10 bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/fpc-crest.png"
            alt=""
            width={44}
            height={42}
            priority
            className="h-11 w-auto"
          />
          <span className="leading-tight">
            <span className="block text-lg text-primary-900">
              Frankfurter Polo Club
            </span>
            <span className="block text-[11px] tracking-[0.25em] uppercase text-ink-faint">
              est. 1902
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`block px-4 py-2 text-base transition-colors ${
                    active
                      ? "text-primary-900"
                      : "text-ink-muted hover:text-primary-800"
                  }`}
                >
                  {item.label}
                </Link>
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-px h-0.5 bg-accent-500"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </li>
            );
          })}
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <motion.span
            animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
            className="block h-px w-6 bg-primary-900"
          />
          <motion.span
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            className="block h-px w-6 bg-primary-900"
          />
          <motion.span
            animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="block h-px w-6 bg-primary-900"
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-primary-900/10 md:hidden"
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-6 py-3 text-lg ${
                    isActive(item.href)
                      ? "text-primary-900"
                      : "text-ink-muted"
                  }`}
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}

export default SiteNav;
