"use client";

import { Menu, X, Terminal } from "lucide-react";
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
    <header
      className={`fixed top-0 w-full z-50 h-16 border-b transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-border/50"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors border border-primary/20">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight text-white">
            minhtam
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(link)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
              {isActive(link) && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
            </Link>
          ))}
          <a
            href="/Resume_Minh_Tam_Nguyen.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 px-4 py-2 rounded-lg border border-primary/40 text-primary font-mono text-sm hover:bg-primary/10 hover:border-primary/60 transition-all duration-200"
          >
            Resume
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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
              className="fixed inset-0 z-[60] min-h-screen w-screen bg-[#0b0f19] md:hidden flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <span className="font-heading font-bold gradient-text">Menu</span>
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(link)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="font-mono text-xs text-primary/60">
                        0{i + 1}
                      </span>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="p-4 border-t border-border/30">
                <a
                  href="/Resume_Minh_Tam_Nguyen.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full px-4 py-3 rounded-lg border border-primary/40 text-primary font-mono text-sm hover:bg-primary/10 transition-all"
                >
                  Download Resume
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
