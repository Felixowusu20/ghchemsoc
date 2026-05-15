import Image from "next/image"
import { Search, ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const facilities = [
    {
        id: 1,
        tag: "Emergency Care",
        title: "Emergency Care: \"24/7 ambulance\"",
        image: "https://plus.unsplash.com/premium_photo-1723708841860-5b00cc402a62?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZnJlZSUyMGFtYnVsYW5jZSUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D", // Ambulance/Emergency
        span: "col-span-1"
    },
    {
        id: 2,
        tag: "Outpatient Services",
        title: "Comfortable rooms with excellent care",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop", // Patient room placeholder
        span: "col-span-1"
    },
    {
        id: 3,
        tag: "Inpatient Services",
        title: "Advanced medical testing and imaging",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop", // Medical testing placeholder
        span: "col-span-1"
    },
    {
        id: 4,
        tag: "Pharmacy and Medication",
        title: "On-site pharmacies with quick delivery options",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=600&auto=format&fit=crop", // Pharmacy placeholder
        span: "col-span-1"
    }
]

export function FacilitiesSection() {
    return (
        <section className="w-full py-24 px-6 md:px-12 bg-[#F8F9FB] text-black" data-aos="fade-up">
            <div className="max-w-[1440px] mx-auto">

                {/* Header */}
                <div className="flex flex-col lg:flex-row items-center justify-between mb-8 md:mb-12 gap-6 w-full">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                        <div className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-medium">
                            Facilities
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
                            Explore Our Facilities
                        </h2>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative group w-full sm:w-80">
                            <Input
                                type="search"
                                placeholder="Search here..."
                                className="w-full pl-5 pr-10 bg-white border-gray-200 rounded-full h-12 focus:bg-white transition-all shadow-sm"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <Button className="h-12 w-full sm:w-auto rounded-full bg-black text-white hover:bg-black/90 pl-6 pr-2 gap-3 text-sm shrink-0">
                            View All
                            <div className="bg-white/20 rounded-full h-8 w-8 flex items-center justify-center">
                                <ArrowUpRight className="h-4 w-4 text-white" />
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Facilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {facilities.map((facility) => (
                        <div key={facility.id} className="relative h-[350px] md:h-[500px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
                            <Image
                                src={facility.image}
                                alt={facility.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                            {/* Top Tag */}
                            <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium">
                                {facility.tag}
                            </div>

                            {/* Bottom Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-start gap-4 transition-transform duration-500 transform translate-y-2 group-hover:translate-y-0">
                                {/* Hover Pill - Example on Inpatient card or all */}
                                {facility.id === 3 && (
                                    <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs mb-2">
                                        Nice Pool
                                    </div>
                                )}

                                <h3 className="text-2xl font-medium text-white leading-tight max-w-[90%]">
                                    {facility.title}
                                </h3>

                                {/* Arrow Button - Reveals on hover */}
                                <div className="absolute bottom-8 right-8 h-12 w-12 bg-black rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                    <ArrowUpRight className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Navigation / Hint */}
                <div className="flex items-center justify-between mt-12 bg-transparent text-gray-500 text-sm">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-gray-200 hover:bg-black hover:text-white transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-gray-200 hover:bg-black hover:text-white transition-colors">
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="text-right max-w-sm hidden md:block">
                        <p>
                            Book an appointment for personalized consultations, specialized treatments, or routine checkups.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    )
}
