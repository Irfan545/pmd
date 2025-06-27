import { CarIcon, Disc2Icon, FilterIcon, PanelRightClose, WrenchIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import oilIcon from "../../../public/SVGs/oil-can-solid.svg"
import { Button } from '../ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const UsefulLinks = () => {
    const Links = [
        {
            name: "Filter",
            // icon: <FilterIcon/>,
            href: "/listing",
        },
        {
            name: "Engine Oil",
            // icon: oilIcon,
            href: "/listing",
        },
        {
            name: "Tools",
            // icon: <WrenchIcon/>,
            href: "/listing",
        },
        {
            name: "Oils and Fluids",
            // icon: oilIcon,
            href: "/listing",
        },
        {
            name: "Suspension",
            // icon: <CarIcon/>,
            href: "/listing",
        },
        {
            name: "Brakes",
            // icon: <Disc2Icon/>,
            href: "/listing",
        },
        {
            name: "Other Parts",
            // icon: <PanelRightClose/>,
            href: "/listing",
        },
    ]
    const router = useRouter()

    return (
        <div className='bg-primary'>
            {/* Scrollable container for mobile, flex for desktop */}
            <div className='flex overflow-x-auto md:overflow-visible md:justify-between items-center text-white py-2 px-4 md:px-10 scrollbar-hide'>
                {Links.map((link) => (
                    <Button 
                        variant="ghost" 
                        className='text-secondary hover:text-accent hover:bg-transparent whitespace-nowrap mx-1 md:mx-0' 
                        key={link.name} 
                        onClick={() => router.push(link.href)}
                    >
                        {link.name}
                    </Button>
                ))}
            </div>
        </div>
    )
}

export default UsefulLinks
