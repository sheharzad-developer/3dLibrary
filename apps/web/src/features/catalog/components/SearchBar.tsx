import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCatalog } from '../useCatalog';
import { useDebounce } from '@/shared/hooks/useDebounce';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useCatalog();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(localQuery, 300);

  // Update the global search query when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  // Sync local state with global state when it changes externally
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleClear = () => {
    setLocalQuery('');
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" style={{ color: 'white' }}  />
        <Input
          type="text"
          placeholder="Search books by title, author, or ISBN..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="pl-12 pr-12 h-14 text-lg font-medium bg-background/80 border-border/60 focus:border-primary shadow-lg" style={{ color: 'white' }}  
        />
        {localQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 p-0 hover:bg-primary/20 text-primary"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}