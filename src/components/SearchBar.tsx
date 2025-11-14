import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  file_type: string;
  thumbnail_url: string | null;
}

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchItems = async () => {
      const { data } = await supabase
        .from("download_items")
        .select("id, title, file_type, thumbnail_url")
        .ilike("title", `%${query}%`)
        .limit(5);

      if (data) setResults(data);
    };

    const debounce = setTimeout(searchItems, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (itemId: string) => {
    navigate(`/download/${itemId}`);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search downloads..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(e.target.value.length >= 2);
            }}
            className="pl-10"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandList>
            {results.length === 0 && query.length >= 2 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup heading="Results">
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result.id)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {result.thumbnail_url && (
                      <img
                        src={result.thumbnail_url}
                        alt={result.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-xs text-muted-foreground">{result.file_type}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};