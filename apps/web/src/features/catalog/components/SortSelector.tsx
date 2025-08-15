
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCatalog } from '../useCatalog';
import type { CatalogState } from '../types';

const sortOptions: Array<{
  value: CatalogState['sortBy'];
  label: string;
}> = [
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'publishedYear', label: 'Published Year' },
  { value: 'category', label: 'Category' },
];

export function SortSelector() {
  const { sortBy, sortOrder, setSorting } = useCatalog();

  const handleSortChange = (newSortBy: CatalogState['sortBy']) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field is selected
      setSorting(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with ascending order
      setSorting(newSortBy, 'asc');
    }
  };

  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Title';

  const getSortIcon = () => {
    if (sortOrder === 'asc') {
      return <ArrowUp className="h-4 w-4" />;
    } else {
      return <ArrowDown className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-foreground/80">Sort by:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            {currentSortLabel}
            {getSortIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className="flex items-center justify-between"
            >
              <span>{option.label}</span>
              {sortBy === option.value && (
                <span className="ml-2">
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}