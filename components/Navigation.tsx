"use client";

import { ArrowDown, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const links = [
    { href: "/", label: "Home", section: "" },
    { href: "/#education", label: "Education", section: "education" },
    { href: "/#projects", label: "Projects", section: "projects" },
    { href: "/#experience", label: "Experience", section: "experience" },
    { href: "/#tech", label: "Tech", section: "tech" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection observer for active section
  useEffect(() => {
    if (path !== "/") return;

    const sectionIds = ["education", "projects", "experience", "tech"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-30% 0px -60% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [path]);

  const isActive = (link: (typeof links)[0]) => {
    if (path !== "/") return false;
    if (link.section === "") return activeSection === "";
    return activeSection === link.section;
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="fixed top-0 z-50 h-16 w-full">
      {/* Glass that fades away downward, so the bar has no hard edge. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-[rgb(30_38_90/0.3)] to-transparent backdrop-blur-[3px] transition-opacity duration-300 [mask-image:linear-gradient(180deg,#000_45%,transparent)] ${
          scrolled ? "opacity-100" : "opacity-70"
        }`}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" data-cursor="HOME">
          <span className="font-serif text-2xl leading-none tracking-tight text-foreground">
            M<span className="text-primary transition-colors group-hover:text-foreground">T</span>N
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 font-mono text-[13px] uppercase tracking-[0.12em] transition-colors duration-200 ${
                isActive(link) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              {isActive(link) && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute -bottom-px left-3 right-3 h-px bg-primary"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
            </Link>
          ))}
          <a
            href="/Resume_Minh_Tam_Nguyen.pdf"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="DOWNLOAD"
            className="group ml-3 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-serif text-base leading-none text-[#1c2340] shadow-[0_6px_20px_rgb(30_38_90/0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgb(30_38_90/0.38)]"
          >
            Resume
            <ArrowDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
          </a>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-1 md:hidden">
        <button
          className="p-2 text-foreground hover:text-primary transition-colors"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        </div>
      </div>

      {/* Mobile Nav - Slide from right */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[60] min-h-screen w-screen bg-background md:hidden flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <span className="annot">Index</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 flex flex-col gap-1">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-baseline gap-4 border-b border-border px-2 py-4 transition-colors ${
                        isActive(link) ? "text-primary" : "text-foreground hover:text-primary"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="font-serif text-5xl leading-none">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="p-4 border-t border-border/30">
                <a
                  href="/Resume_Minh_Tam_Nguyen.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-full bg-white px-4 py-3 text-center font-serif text-lg text-[#1c2340]"
                >
                  Resume PDF
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
