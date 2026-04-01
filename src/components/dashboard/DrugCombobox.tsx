import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/* 🔹 Drug suggestions (editable) */
const DRUGS: string[] = [
  "Aspirin",
  "Ibuprofen",
  "Paracetamol",
  "Metformin",
  "Amoxicillin",
  "Atorvastatin",
  "Ciprofloxacin",
  "Omeprazole",
  "Losartan",
  "Diclofenac",
  "Clopidogrel",
  "Azithromycin",
  "Pantoprazole",
  "Levothyroxine",
  "Warfarin",
];

interface DrugComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function DrugCombobox({
  value,
  onChange,
  disabled,
}: DrugComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          {value || "Select or type drug name"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search or type drug name..."
            onValueChange={(val) => onChange(val)}
          />

          <CommandEmpty>No drug found.</CommandEmpty>

          <CommandGroup>
            {DRUGS.map((drug) => (
              <CommandItem
                key={drug}
                value={drug}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === drug ? "opacity-100" : "opacity-0"
                  )}
                />
                {drug}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
