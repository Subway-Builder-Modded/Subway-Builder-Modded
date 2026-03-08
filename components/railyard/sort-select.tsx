"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SortOption } from "@/hooks/use-filtered-items"

interface SortSelectProps {
  value: SortOption
  onChange: (value: SortOption) => void
  options: { value: SortOption; label: string }[]
}

export function SortSelect({ value, onChange, options }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className="w-36 h-8 text-xs">
        <SelectValue placeholder="Sort by…" />
      </SelectTrigger>
      <SelectContent position="popper" side="bottom" sideOffset={6} align="end" className="z-[120]">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
