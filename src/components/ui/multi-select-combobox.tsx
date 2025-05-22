
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { SelectOption } from "@/types/search-form-types"

interface MultiSelectComboboxProps {
  options: SelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  notFoundMessage = "No option found.",
  className,
  disabled = false,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("") 

  const handleSelect = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((val) => val !== optionValue))
    } else {
      onChange([...selected, optionValue])
    }
    setInputValue("") 
  }

  const handleRemove = (optionValue: string) => {
    onChange(selected.filter((val) => val !== optionValue))
  }

  const selectedOptions = selected
    .map(val => options.find(opt => opt.value === val))
    .filter(Boolean) as SelectOption[];

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between h-auto min-h-10 py-2", selectedOptions.length > 0 ? "flex-col items-start" : "")}
            onClick={() => setOpen(!open)}
            disabled={disabled}
          >
            <div className={cn("flex justify-between w-full", selectedOptions.length > 0 && "mb-1")}>
              <span className={cn(selectedOptions.length === 0 && "text-muted-foreground")}>
                {selectedOptions.length > 0 ? `${selectedOptions.length} selected` : placeholder}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
            {selectedOptions.length > 0 && (
               <div className="flex flex-wrap gap-1 w-full">
                {selectedOptions.map(option => (
                  <Badge
                    variant="secondary"
                    key={option.value}
                    className="px-2 py-0.5"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      if (!disabled) handleRemove(option.value);
                    }}
                  >
                    {option.icon && <option.icon className="mr-1 h-3 w-3" />}
                    {option.label}
                    {!disabled && <X className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" />}
                  </Badge>
                ))}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput 
              placeholder={searchPlaceholder} 
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>{notFoundMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} 
                    onSelect={() => handleSelect(option.value)}
                    disabled={disabled}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
