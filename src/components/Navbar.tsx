import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

export const Navbar = () => {
  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Download className="h-6 w-6 text-accent" />
            <span className="hidden sm:inline">Up4Down</span>
          </Link>

          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <Link to="/browse">
              <Button variant="ghost" size="sm">Browse</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
