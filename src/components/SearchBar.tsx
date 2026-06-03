import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { makes } from "@/lib/mock-cars";

export function SearchBar() {
  const navigate = useNavigate();
  const [make, setMake] = useState("all");
  const [maxPrice, setMaxPrice] = useState("all");

  const onSearch = () => {
    navigate({
      to: "/listings",
      search: {
        make: make === "all" ? undefined : make,
        maxPrice: maxPrice === "all" ? undefined : Number(maxPrice),
      } as never,
    });
  };

  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-xl sm:grid-cols-2 md:grid-cols-[1fr_1fr_auto]">
      <Select value={make} onValueChange={setMake}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="მწარმოებელი" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ყველა მწარმოებელი</SelectItem>
          {makes.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={maxPrice} onValueChange={setMaxPrice}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="მაქს. ფასი" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ნებისმიერი ფასი</SelectItem>
          <SelectItem value="15000">$15,000-მდე</SelectItem>
          <SelectItem value="30000">$30,000-მდე</SelectItem>
          <SelectItem value="50000">$50,000-მდე</SelectItem>
          <SelectItem value="100000">$100,000-მდე</SelectItem>
        </SelectContent>
      </Select>

      <Button size="lg" className="h-12 gap-2" onClick={onSearch}>
        <Search className="h-4 w-4" />
        ძებნა
      </Button>
    </div>
  );
}
