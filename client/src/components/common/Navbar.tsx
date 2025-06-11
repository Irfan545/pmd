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
    <div className='flex justify-between items-center text-white py-2 bg-primary px-10'>
      {Links.map((link) => (
        <Button variant="ghost" className='text-secondary hover:text-accent hover:bg-transparent' key={link.name} onClick={() => router.push(link.href)}>
          {/* <Image src={link.icon} alt={link.name} width={20} height={20} /> */}
          {link.name}
        </Button>
      ))}
    </div>
  )
}

export default UsefulLinks
