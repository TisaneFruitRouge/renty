"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import type { getChannelsOfUser } from "../db"
import { ChannelsSidebar } from "./ChannelsSidebar"

interface ChannelsLayoutClientProps {
  channels: Awaited<ReturnType<typeof getChannelsOfUser>>
  children: React.ReactNode
}

export function ChannelsLayoutClient({ channels, children }: ChannelsLayoutClientProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Desktop: inline sidebar */}
      <div className="hidden md:flex">
        <ChannelsSidebar channels={channels} />
      </div>

      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile: Sheet trigger */}
        <div className="md:hidden flex items-center gap-2 border-b px-4 py-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Ouvrir les conversations">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0">
              <ChannelsSidebar channels={channels} onClose={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
        {children}
      </main>
    </div>
  )
}
