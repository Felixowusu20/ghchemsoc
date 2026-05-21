"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ArrowRight, Clock, TrendingUp, FlaskConical, Users, BookOpen, Calendar, Newspaper, MapPin, FolderOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Placeholder index — replace with API-backed search when ready
const searchData = {
    programs: [
        { id: 1, title: "Membership", description: "Join or renew your GCS membership", href: "/membership", icon: Users },
        { id: 2, title: "Resources", description: "Videos, documents, and reference materials", href: "/resources", icon: FolderOpen },
        { id: 3, title: "Publications hub", description: "Journals, articles, and research outputs", href: "/publications", icon: BookOpen },
        { id: 4, title: "Conferences & symposia", description: "Upcoming scientific meetings", href: "/events", icon: Calendar },
        { id: 5, title: "News & announcements", description: "Society news and outreach", href: "/news", icon: Newspaper },
    ],
    pages: [
        { id: 1, title: "About the Society", description: "Mission, structure, and leadership", href: "/about", icon: MapPin },
        { id: 2, title: "Contact & inquiries", description: "Reach the secretariat", href: "/contact", icon: MapPin },
        { id: 3, title: "Ghana Chemical Society", description: "Return to the homepage", href: "/", icon: FlaskConical },
    ],
}

const quickActions = [
    { label: "Membership", href: "/membership", icon: Users },
    { label: "Publications", href: "/publications", icon: BookOpen },
    { label: "Contact", href: "/contact", icon: MapPin },
]

const trendingSearches = [
    "Membership",
    "Conference",
    "Publications",
    "About GCS",
]

interface SearchResult {
    id: number
    title: string
    description: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    category: string
}

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("gcs-recent-searches")
        if (saved) {
            setRecentSearches(JSON.parse(saved))
        }
    }, [])

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
        if (!isOpen) {
            setQuery("")
            setResults([])
            setSelectedIndex(0)
        }
    }, [isOpen])

    // Search logic
    const performSearch = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([])
            return
        }

        const q = searchQuery.toLowerCase()
        const allResults: SearchResult[] = []

        searchData.programs.forEach((item) => {
            if (item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
                allResults.push({ ...item, category: "Programs" })
            }
        })

        searchData.pages.forEach((item) => {
            if (item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
                allResults.push({ ...item, category: "Pages" })
            }
        })

        setResults(allResults)
        setSelectedIndex(0)
    }, [])

    useEffect(() => {
        performSearch(query)
    }, [query, performSearch])

    // Save to recent searches
    const saveRecentSearch = (searchTerm: string) => {
        const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
        setRecentSearches(updated)
        localStorage.setItem("gcs-recent-searches", JSON.stringify(updated))
    }

    // Handle result selection
    const handleSelect = (result: SearchResult) => {
        saveRecentSearch(result.title)
        onClose()
        router.push(result.href)
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setSelectedIndex(prev => Math.max(prev - 1, 0))
                    break
                case "Enter":
                    e.preventDefault()
                    if (results[selectedIndex]) {
                        handleSelect(results[selectedIndex])
                    }
                    break
                case "Escape":
                    onClose()
                    break
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, results, selectedIndex, onClose])

    // Clear recent search
    const clearRecentSearch = (searchTerm: string) => {
        const updated = recentSearches.filter(s => s !== searchTerm)
        setRecentSearches(updated)
        localStorage.setItem("gcs-recent-searches", JSON.stringify(updated))
    }

    // Group results by category
    const groupedResults = results.reduce((acc: Record<string, SearchResult[]>, result) => {
        if (!acc[result.category]) {
            acc[result.category] = []
        }
        acc[result.category].push(result)
        return acc
    }, {})

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        className="fixed top-4 md:top-[10%] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-[101] bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                    >
                        {/* Search Input */}
                        <div className="p-4 md:p-6 border-b border-neutral-100">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gcs-muted-text" />
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search programs, pages, and resources…"
                                    className="h-14 w-full rounded-xl border-gcs-border bg-white pl-12 pr-12 text-base text-gcs-foreground placeholder:text-gcs-muted-text focus:border-gcs-primary focus:bg-white focus-visible:ring-gcs-primary/25 md:text-lg shadow-sm"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                                    >
                                        <X className="h-4 w-4 text-gcs-muted-text" />
                                    </button>
                                )}
                            </div>

                            {/* Keyboard hints - Desktop only */}
                            <div className="hidden md:flex items-center gap-4 mt-3 text-xs text-gcs-muted-text">
                                <span className="flex items-center gap-1">
                                    <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-gcs-foreground shadow-sm">↑↓</kbd> Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-gcs-foreground shadow-sm">Enter</kbd> Select
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-gcs-foreground shadow-sm">Esc</kbd> Close
                                </span>
                            </div>
                        </div>

                        {/* Results Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            {query ? (
                                results.length > 0 ? (
                                    <div className="space-y-6">
                                        {Object.entries(groupedResults).map(([category, categoryResults]) => (
                                            <div key={category}>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-gcs-muted-text mb-3">
                                                    {category}
                                                </h3>
                                                <div className="space-y-1">
                                                    {categoryResults.map((result, idx) => {
                                                        const globalIndex = results.indexOf(result)
                                                        return (
                                                            <button
                                                                key={result.id}
                                                                onClick={() => handleSelect(result)}
                                                                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${globalIndex === selectedIndex
                                                                    ? "bg-gcs-primary text-white shadow-sm"
                                                                    : "bg-white text-gcs-foreground hover:bg-neutral-50 border border-transparent hover:border-gcs-border/60"
                                                                    }`}
                                                            >
                                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${globalIndex === selectedIndex
                                                                    ? "bg-white/20"
                                                                    : "bg-neutral-50"
                                                                    }`}>
                                                                    <result.icon className={`h-5 w-5 ${globalIndex === selectedIndex ? "text-white" : "text-gcs-muted-text"}`} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold truncate">{result.title}</p>
                                                                    <p className={`text-sm truncate ${globalIndex === selectedIndex ? "text-white/85" : "text-gcs-muted-text"}`}>
                                                                        {result.description}
                                                                    </p>
                                                                </div>
                                                                <ArrowRight className={`h-4 w-4 shrink-0 ${globalIndex === selectedIndex ? "text-white" : "text-gcs-muted-text"}`} />
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="h-16 w-16 rounded-full bg-neutral-50 border border-gcs-border/60 flex items-center justify-center mx-auto mb-4">
                                            <Search className="h-8 w-8 text-gcs-muted-text/50" />
                                        </div>
                                        <p className="text-gcs-muted-text font-medium">No results found for &quot;{query}&quot;</p>
                                        <p className="text-gcs-muted-text/80 text-sm mt-1">Try another keyword or browse quick actions below</p>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-8">
                                    {/* Quick Actions */}
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gcs-muted-text mb-3">
                                            Quick Actions
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {quickActions.map((action) => (
                                                <Link
                                                    key={action.label}
                                                    href={action.href}
                                                    onClick={onClose}
                                                    className="flex items-center gap-3 p-3 rounded-xl border border-gcs-border/60 bg-white text-gcs-foreground hover:border-gcs-primary hover:bg-gcs-primary hover:text-white transition-all group shadow-sm"
                                                >
                                                    <action.icon className="h-5 w-5 shrink-0 text-gcs-primary group-hover:text-white" />
                                                    <span className="font-medium text-sm">{action.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gcs-muted-text mb-3 flex items-center gap-2">
                                                <Clock className="h-3 w-3" /> Recent Searches
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map((search) => (
                                                    <div
                                                        key={search}
                                                        className="group flex items-center gap-1 rounded-full border border-gcs-border/70 bg-white px-3 py-1.5 text-sm text-gcs-foreground shadow-sm"
                                                    >
                                                        <button
                                                            onClick={() => setQuery(search)}
                                                            className="transition-colors hover:text-gcs-primary"
                                                        >
                                                            {search}
                                                        </button>
                                                        <button
                                                            onClick={() => clearRecentSearch(search)}
                                                            className="h-4 w-4 rounded-full hover:bg-neutral-100 flex items-center justify-center ml-1"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Trending */}
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gcs-muted-text mb-3 flex items-center gap-2">
                                            <TrendingUp className="h-3 w-3" /> Trending
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {trendingSearches.map((search) => (
                                                <button
                                                    key={search}
                                                    onClick={() => setQuery(search)}
                                                    className="rounded-full border border-gcs-border bg-white px-4 py-2 text-sm font-medium text-gcs-foreground transition-all hover:border-gcs-primary hover:bg-gcs-primary hover:text-white shadow-sm"
                                                >
                                                    {search}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-neutral-100 bg-white">
                            <div className="flex items-center justify-between text-xs text-gcs-muted-text">
                                <span>Ghana Chemical Society</span>
                                <button
                                    onClick={onClose}
                                    className="px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors font-medium text-gcs-foreground"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
