
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCatalog } from '../useCatalog';

const categories = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Mystery',
  'Romance',
  'Fantasy',
  'Self-Help',
];

const availabilityOptions = [
  { value: 'all', label: 'All Books' },
  { value: 'available', label: 'Available Only' },
  { value: 'unavailable', label: 'Unavailable Only' },
] as const;

export function FilterPanel() {
  const { filters, setFilters, resetFilters } = useCatalog();

  const handleCategoryChange = (category: string) => {
    setFilters({ category: category === filters.category ? '' : category });
  };

  const handleAuthorChange = (author: string) => {
    setFilters({ author });
  };

  const handleAvailabilityChange = (availability: typeof filters.availability) => {
    setFilters({ availability });
  };

  const handleYearRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    setFilters({
      publishedYear: {
        ...filters.publishedYear,
        [field]: numValue,
      },
    });
  };

  const hasActiveFilters = 
    filters.category || 
    filters.author || 
    filters.availability !== 'all' ||
    filters.publishedYear?.min ||
    filters.publishedYear?.max;

  return (
    <div className="space-y-6 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-3 text-foreground" style={{ color: 'white' }} >
          <Filter className="h-6 w-6 text-primary" style={{ color: 'white' }}  />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground uppercase tracking-wide">Category</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start h-12 text-base font-medium bg-background/80 hover:bg-background">
              {filters.category || 'Select Category'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleCategoryChange('')}>
              All Categories
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Author Filter */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground uppercase tracking-wide">Author</label>
        <Input
          type="text"
          placeholder="Filter by author..."
          value={filters.author}
          onChange={(e) => handleAuthorChange(e.target.value)}
          className="h-12 text-base font-medium bg-background/80 border-border/60 focus:border-primary" style={{ color: 'white' }}  
        />
      </div>

      {/* Availability Filter */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground uppercase tracking-wide">Availability</label>
        <div className="flex flex-wrap gap-3">
          {availabilityOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filters.availability === option.value ? 'default' : 'outline'}
              className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                filters.availability === option.value 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                  : 'bg-background/60 text-foreground/80 hover:bg-background/80 hover:text-foreground border-border/60'
              }`}
              onClick={() => handleAvailabilityChange(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Published Year Range */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground uppercase tracking-wide">Published Year</label>
        <div className="flex gap-3" style={{ color: 'white' }}>
          <Input
            type="number"
            placeholder="From"
            value={filters.publishedYear?.min || ''}
            onChange={(e) => handleYearRangeChange('min', e.target.value)}
            min="1800"
            max={new Date().getFullYear()}
            className="h-12 text-base font-medium bg-background/80 border-border/60 focus:border-primary"
          />
          <Input
            type="number"
            placeholder="To"
            value={filters.publishedYear?.max || ''}
            onChange={(e) => handleYearRangeChange('max', e.target.value)}
            min="1800"
            max={new Date().getFullYear()}
            className="h-12 text-base font-medium bg-background/80 border-border/60 focus:border-primary"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Active Filters</label>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {filters.category}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters({ category: '' })}
                />
              </Badge>
            )}
            {filters.author && (
              <Badge variant="secondary" className="gap-1">
                Author: {filters.author}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters({ author: '' })}
                />
              </Badge>
            )}
            {filters.availability !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {availabilityOptions.find(opt => opt.value === filters.availability)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters({ availability: 'all' })}
                />
              </Badge>
            )}
            {(filters.publishedYear?.min || filters.publishedYear?.max) && (
              <Badge variant="secondary" className="gap-1">
                Year: {filters.publishedYear?.min || '?'}-{filters.publishedYear?.max || '?'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters({ publishedYear: {} })}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}