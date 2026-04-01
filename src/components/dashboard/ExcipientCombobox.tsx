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

/* 🔹 Extended excipient list (pharma-relevant, editable) */
const EXCIPIENTS: string[] = [
  "Lactose Monohydrate",
  "Microcrystalline Cellulose",
  "Magnesium Stearate",
  "Starch",
  "Povidone (PVP)",
  "HPMC",
  "Sodium Starch Glycolate",
  "Croscarmellose Sodium",
  "Crospovidone",
  "Mannitol",
  "Sorbitol",
  "Dicalcium Phosphate",
  "Calcium Phosphate",
  "Colloidal Silicon Dioxide",
  "Talc",
  "Stearic Acid",
  "Sodium Bicarbonate",
  "Citric Acid",
  "PEG 400",
  "PEG 6000",
  "Polysorbate 80",
  "Sodium Lauryl Sulfate",
];

interface ExcipientComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function ExcipientCombobox({
  value,
  onChange,
  disabled,
}: ExcipientComboboxProps) {
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
          {value ? value : "Select or type excipient"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          {/* 🔹 Search + free typing */}
          <CommandInput
            placeholder="Search or type excipient..."
            onValueChange={(val) => {
              // Allow free text entry
              onChange(val);
            }}
          />

          <CommandEmpty>No excipient found.</CommandEmpty>

          <CommandGroup>
            {EXCIPIENTS.map((excipient) => (
              <CommandItem
                key={excipient}
                value={excipient}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === excipient ? "opacity-100" : "opacity-0"
                  )}
                />
                {excipient}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
