import { Metadata } from "next"
import Image from "next/image"

import { Separator } from '@/components/ui/separator'
import { SidebarNav } from "@/app/settings/components/sidebar-nav"

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
}

const sidebarNavItems = [
  {
    title: "Form",
    href: "/events/createEvent",
  },
  {
    title: "Additional Information",
    href: "/events/createEvent/additionalInformation",
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
    <div className="md:container md:max-w-7xl md:mx-auto ">
      
      <div className=" space-y-6 p-10 pb-16  bg-white dark:bg-[#262626] rounded-md font-dmsans shadow-[0px_0px_0px_1px_rgba(8,112,184,0.06),0px_1px_1px_-0.5px_rgba(8,112,184,0.06),0px_3px_3px_-1.5px_rgba(8,112,184,0.06),_0px_6px_6px_-3px_rgba(8,112,184,0.06),0px_12px_12px_-6px_rgba(8,112,184,0.06),0px_24px_24px_-12px_rgba(8,112,184,0.06)] mt-3">
        <div className="space-y-0.5">
          <h2 className="text-[24px] font-[500] tracking-tight">Create your event here</h2>
          <p className="text-muted-foreground text-[17px]">
            Fill the form to create your event.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5 overflow-auto">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
      </div>
    </>
  )
}