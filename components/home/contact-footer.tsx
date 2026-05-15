import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Linkedin, Globe } from "lucide-react"

export function ContactFooter() {
    return (
        <footer className="w-full bg-white text-black relative pt-12 mt-12 overflow-hidden pb-12" data-aos="fade-up">

            {/* Big Text Container */}
            <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-8 mb-24">
                <div className="relative z-10 flex flex-wrap justify-center text-center">
                    <h2 className="text-[12vw] leading-[0.85] font-medium tracking-tighter text-black uppercase">
                        GHANA CHEM - CONTACT
                    </h2>
                </div>

                {/* Floating Images (Parallax/Absolute) */}
                {/* Left Image */}
                <div className="absolute top-[10%] left-[5%] md:left-[10%] w-[20vw] md:w-[15vw] h-[20vw] md:h-[15vw] rounded-3xl overflow-hidden shadow-2xl z-20 hidden md:block rotate-[-6deg]">
                    <Image
                        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop"
                        alt="Building"
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Right Image */}
                <div className="absolute bottom-[20%] right-[5%] md:right-[15%] w-[25vw] md:w-[18vw] h-[25vw] md:h-[18vw] rounded-3xl overflow-hidden shadow-2xl z-20 translate-y-1/4">
                    <Image
                        src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=600&auto=format&fit=crop"
                        alt="Modern Hospital"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>

            {/* Footer Links & Info */}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-end gap-12 relative z-30">

                {/* Left: Contact Info */}
                <div className="flex flex-col gap-1 text-sm font-medium">
                    <p>Helpline: +1 234 567 890</p>
                </div>

                {/* Center: Links & Desc */}
                <div className="flex flex-col items-center text-center gap-8">
                    {/* Nav */}
                    <nav className="flex items-center gap-8">
                        {["About us", "FAQ", "Contact us"].map((item) => (
                            <Link key={item} href="#" className="text-sm font-semibold flex items-center gap-1 group">
                                {item}
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Desc */}
                    <p className="text-gray-500 text-xs max-w-md mx-auto leading-relaxed">
                        FI Ghana Chem connects professionals across research,
                        industry, and education—advancing chemistry and supporting
                        members through networking, resources, and shared expertise.
                    </p>

                    {/* Socials */}
                    <div className="flex items-center gap-4">
                        {[Linkedin, Instagram, Twitter, Globe].map((Icon, i) => (
                            <div key={i} className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer">
                                <Icon className="h-4 w-4" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Copyright */}
                <div className="text-sm font-medium text-right">
                    © 2026 FI Ghana Chem. All Rights Reserved.
                </div>
            </div>
        </footer>
    )
}
