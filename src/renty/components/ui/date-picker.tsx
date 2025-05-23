"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useLocale } from 'next-intl'
import * as dateFnsLocales from 'date-fns/locale'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date
    onChange?: (date?: Date) => void
    placeholder?: string,
}

const localeMap: Record<string, dateFnsLocales.Locale> = {
  fr: dateFnsLocales.fr
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const locale = useLocale()
  const dateLocale = localeMap[locale] || dateFnsLocales.fr

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP", { locale: dateLocale }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          locale={dateLocale}
        />
      </PopoverContent>
    </Popover>
  )
}
