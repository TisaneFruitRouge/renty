"use client"

import { useEffect, useState } from "react"
import { PageTitle } from "@/components/ui/typography"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Bonjour"
  if (hour >= 12 && hour < 18) return "Bon après-midi"
  return "Bonsoir"
}

export function TimeGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Bonjour")

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  return (
    <PageTitle>
      {greeting},{" "}
      <span className="text-primary">{name}</span>
    </PageTitle>
  )
}
