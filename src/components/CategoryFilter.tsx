import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) => {
  const getIcon = (iconName: string): LucideIcon => {
    return (Icons[iconName as keyof typeof Icons] as LucideIcon) || Icons.Folder;
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => onSelectCategory(null)}
          className={selectedCategory === null ? "bg-accent hover:bg-accent/90" : ""}
        >
          All
        </Button>
        {categories.map((category) => {
          const IconComponent = getIcon(category.icon);
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              onClick={() => onSelectCategory(category.slug)}
              className={selectedCategory === category.slug ? "bg-accent hover:bg-accent/90" : ""}
            >
              <IconComponent className="mr-2 h-4 w-4" />
              {category.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
