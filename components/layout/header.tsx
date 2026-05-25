"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Search,
    Menu,
    ArrowUpRight,
    X,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { SearchModal } from "@/components/ui/search-modal";

const NAV_LINKS = [
    { label: "About", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "News", href: "/news" },
    { label: "Contact", href: "/contact" },
] as const;

const MEMBERSHIP_DROPDOWN = [
    { label: "Join & membership", href: "/membership" },
    { label: "Executives", href: "/executives" },
] as const;

const RESOURCES_DROPDOWN = [
    { label: "Resources library", href: "/resources" },
    { label: "Publications", href: "/publications" },
] as const;

const MEMBERSHIP_PATHS = ["/membership", "/executives"] as const;
const RESOURCES_PATHS = ["/resources", "/publications"] as const;

function isPathActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, paths: readonly string[]) {
    return paths.some((p) => isPathActive(pathname, p));
}

const LIGHT_HEADER_PATHS = [
    "/about",
    "/executives",
    "/contact",
    "/membership",
    "/membership/account",
    "/resources",
    "/publications",
    "/events",
    "/news",
    "/login",
];

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [membershipOpen, setMembershipOpen] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [mobileMembershipOpen, setMobileMembershipOpen] = useState(false);
    const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
    const membershipRef = useRef<HTMLDivElement>(null);
    const resourcesRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const isMembershipActive = isGroupActive(pathname, MEMBERSHIP_PATHS);
    const isResourcesActive = isGroupActive(pathname, RESOURCES_PATHS);

    const isLightPage = LIGHT_HEADER_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    /** Light pages + scrolled hero: solid bar and dark-on-light nav (not white-on-white). */
    const useReadableChrome = isLightPage || scrolled;
    const pillOnHero = !useReadableChrome;
    const solidHeaderBar = useReadableChrome;

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        setMembershipOpen(false);
        setResourcesOpen(false);
        setMobileMembershipOpen(false);
        setMobileResourcesOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!membershipOpen && !resourcesOpen) return;
        function handlePointerDown(e: MouseEvent) {
            const target = e.target as Node;
            if (membershipOpen && membershipRef.current && !membershipRef.current.contains(target)) {
                setMembershipOpen(false);
            }
            if (resourcesOpen && resourcesRef.current && !resourcesRef.current.contains(target)) {
                setResourcesOpen(false);
            }
        }
        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [membershipOpen, resourcesOpen]);

    function navPillClass(active: boolean) {
        if (pillOnHero) {
            return active
                ? "rounded-full border border-white/55 bg-white/22 px-3 py-2 text-sm font-semibold capitalize text-white shadow-sm backdrop-blur-md xl:px-4"
                : "rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium capitalize text-white/90 backdrop-blur-md transition-all hover:border-white/35 hover:bg-white/18 xl:px-4";
        }
        return active
            ? "rounded-full border border-gcs-primary/40 bg-gcs-primary/10 px-3 py-2 text-sm font-semibold capitalize text-gcs-primary shadow-md ring-1 ring-gcs-primary/15 xl:px-4"
            : "rounded-full border border-gcs-border bg-neutral-50/95 px-3 py-2 text-sm font-medium capitalize text-gcs-foreground shadow-sm transition-all hover:border-gcs-primary/30 hover:bg-white hover:shadow-md xl:px-4";
    }

    function navLinkClass(href: string) {
        return navPillClass(isPathActive(pathname, href));
    }

    const pillClass = pillOnHero
        ? "border-white/25 bg-white/12 text-white backdrop-blur-md hover:bg-white/20"
        : "border-gcs-border bg-neutral-50/95 text-gcs-foreground shadow-md backdrop-blur-sm hover:border-gcs-primary/25 hover:bg-white";

    function dropdownItemClass(href: string) {
        const active = isPathActive(pathname, href);
        return cn(
            "block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
            active
                ? "bg-gcs-primary/10 text-gcs-primary"
                : "text-gcs-foreground hover:bg-neutral-50 hover:text-gcs-primary"
        );
    }

    function dropdownMenuClass() {
        return cn(
            "absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] overflow-hidden rounded-2xl border py-1.5 shadow-lg",
            pillOnHero ? "border-white/20 bg-slate-900/95 text-white backdrop-blur-md" : "border-gcs-border bg-white"
        );
    }

    function dropdownLinkClass(href: string) {
        return cn(
            dropdownItemClass(href),
            pillOnHero &&
                !isPathActive(pathname, href) &&
                "text-white/90 hover:bg-white/10 hover:text-white"
        );
    }

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-4 py-4 pt-6 transition-all duration-300 sm:px-6 ${
                    solidHeaderBar
                        ? "border-b border-gcs-border/80 bg-white/95 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.12)] backdrop-blur-md"
                        : "bg-transparent"
                } ${!scrolled && !isLightPage ? "pointer-events-none" : ""}`}
            >

                <nav className="pointer-events-auto flex items-center gap-0.5 md:gap-1">
                    <Link href="/" className="group mr-3 flex shrink-0 items-center gap-2.5 sm:mr-6">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${
                                useReadableChrome
                                    ? "bg-white ring-1 ring-gcs-border/60"
                                    : "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.35)] ring-2 ring-white/45"
                            }`}
                        >
                            <div className="relative h-[76%] w-[76%]">
                                <Image
                                    src="/logo/ghana-chemical-society-logo.png"
                                    alt="Ghana Chemical Society logo"
                                    fill
                                    className="object-contain object-center"
                                    sizes="48px"
                                    priority
                                />
                            </div>
                        </div>
                        <span
                            className={`flex flex-col leading-tight transition-colors ${
                                useReadableChrome ? "text-gcs-foreground" : "text-white drop-shadow-md"
                            }`}
                        >
                            <span className="text-base font-bold tracking-tight sm:text-xl">GCS</span>
                            <span className="hidden text-[0.65rem] font-medium uppercase tracking-[0.2em] text-current/80 sm:block">
                                Ghana Chemical Society
                            </span>
                        </span>
                    </Link>

                    <div className="hidden items-center gap-1.5 lg:flex">
                        {NAV_LINKS.slice(0, 1).map((item) => (
                            <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
                                {item.label}
                            </Link>
                        ))}

                        <div ref={membershipRef} className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setResourcesOpen(false);
                                    setMembershipOpen((open) => !open);
                                }}
                                aria-expanded={membershipOpen}
                                aria-haspopup="true"
                                className={cn(navPillClass(isMembershipActive), "inline-flex items-center gap-1")}
                            >
                                Membership
                                <ChevronDown
                                    className={cn("h-4 w-4 transition-transform", membershipOpen && "rotate-180")}
                                    aria-hidden
                                />
                            </button>
                            {membershipOpen ? (
                                <div role="menu" className={dropdownMenuClass()}>
                                    {MEMBERSHIP_DROPDOWN.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            role="menuitem"
                                            className={dropdownLinkClass(item.href)}
                                            onClick={() => setMembershipOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <div ref={resourcesRef} className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setMembershipOpen(false);
                                    setResourcesOpen((open) => !open);
                                }}
                                aria-expanded={resourcesOpen}
                                aria-haspopup="true"
                                className={cn(navPillClass(isResourcesActive), "inline-flex items-center gap-1")}
                            >
                                Resources
                                <ChevronDown
                                    className={cn("h-4 w-4 transition-transform", resourcesOpen && "rotate-180")}
                                    aria-hidden
                                />
                            </button>
                            {resourcesOpen ? (
                                <div role="menu" className={dropdownMenuClass()}>
                                    {RESOURCES_DROPDOWN.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            role="menuitem"
                                            className={dropdownLinkClass(item.href)}
                                            onClick={() => setResourcesOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        {NAV_LINKS.slice(1).map((item) => (
                            <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(true)}
                        className={`hidden h-11 items-center gap-2 rounded-full border px-4 transition-all lg:flex xl:h-12 xl:gap-3 xl:px-5 ${pillClass}`}
                    >
                        <Search className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">Search…</span>
                        <kbd
                            className={`hidden items-center gap-0.5 rounded px-2 py-1 font-mono text-xs xl:inline-flex ${
                                pillOnHero ? "bg-white/20" : "border border-gcs-border/60 bg-white text-gcs-muted-text"
                            }`}
                        >
                            ⌘K
                        </kbd>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(true)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all lg:hidden xl:h-12 xl:w-12 ${pillClass}`}
                    >
                        <Search className="h-5 w-5" />
                    </button>

                    <Link href="/membership" className="hidden sm:block">
                        <Button className="h-11 gap-2 rounded-full border-0 bg-gcs-primary pl-5 pr-1.5 text-base text-white shadow-sm hover:bg-gcs-primary-hover xl:h-12 xl:pl-6 xl:pr-2">
                            Join GCS
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                                <ArrowUpRight className="h-4 w-4 text-gcs-primary" />
                            </div>
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setIsMenuOpen(true)}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-gcs-primary text-white hover:bg-gcs-primary-hover lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </header>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed inset-0 z-[60] flex flex-col bg-[#020617] p-6 text-white lg:hidden"
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white/30">
                                    <div className="relative h-[76%] w-[76%]">
                                        <Image
                                            src="/logo/ghana-chemical-society-logo.png"
                                            alt="Ghana Chemical Society logo"
                                            fill
                                            className="object-contain object-center"
                                            sizes="44px"
                                        />
                                    </div>
                                </div>
                                <span className="text-lg font-bold tracking-tight">GCS</span>
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => setIsMenuOpen(false)}
                                className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setIsMenuOpen(false);
                                setTimeout(() => setIsSearchOpen(true), 300);
                            }}
                            className="mb-8 flex h-14 w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 text-left text-white/70"
                        >
                            <Search className="h-5 w-5 shrink-0 text-white/50" />
                            <span>Search the society site…</span>
                        </button>

                        <nav className="flex flex-col gap-5 text-2xl font-medium">
                            {NAV_LINKS.slice(0, 1).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="border-b border-white/10 pb-4"
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <div className="border-b border-white/10 pb-4">
                                <button
                                    type="button"
                                    onClick={() => setMobileMembershipOpen((open) => !open)}
                                    className="flex w-full items-center justify-between gap-3 text-left"
                                    aria-expanded={mobileMembershipOpen}
                                >
                                    <span className={isMembershipActive ? "text-white" : "text-white/90"}>
                                        Membership
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            "h-6 w-6 shrink-0 text-white/60 transition-transform",
                                            mobileMembershipOpen && "rotate-180"
                                        )}
                                        aria-hidden
                                    />
                                </button>
                                {mobileMembershipOpen ? (
                                    <div className="mt-4 flex flex-col gap-3 border-l-2 border-white/20 pl-4 text-lg">
                                        {MEMBERSHIP_DROPDOWN.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={
                                                    isPathActive(pathname, item.href)
                                                        ? "font-semibold text-white"
                                                        : "text-white/75 hover:text-white"
                                                }
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <div className="border-b border-white/10 pb-4">
                                <button
                                    type="button"
                                    onClick={() => setMobileResourcesOpen((open) => !open)}
                                    className="flex w-full items-center justify-between gap-3 text-left"
                                    aria-expanded={mobileResourcesOpen}
                                >
                                    <span className={isResourcesActive ? "text-white" : "text-white/90"}>Resources</span>
                                    <ChevronDown
                                        className={cn(
                                            "h-6 w-6 shrink-0 text-white/60 transition-transform",
                                            mobileResourcesOpen && "rotate-180"
                                        )}
                                        aria-hidden
                                    />
                                </button>
                                {mobileResourcesOpen ? (
                                    <div className="mt-4 flex flex-col gap-3 border-l-2 border-white/20 pl-4 text-lg">
                                        {RESOURCES_DROPDOWN.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={
                                                    isPathActive(pathname, item.href)
                                                        ? "font-semibold text-white"
                                                        : "text-white/75 hover:text-white"
                                                }
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            {NAV_LINKS.slice(1).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="border-b border-white/10 pb-4"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto flex flex-col gap-4">
                            <Button
                                asChild
                                className="h-14 w-full gap-3 rounded-full bg-gcs-primary text-lg font-semibold text-white hover:bg-gcs-primary-hover"
                            >
                                <Link href="/membership" onClick={() => setIsMenuOpen(false)}>
                                    Join Ghana Chemical Society
                                    <ArrowUpRight className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
