import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MapSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const MapSearch = ({ onSearch, placeholder = "Search..." }: MapSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
    setIsExpanded(false);
  };

  return (
    <Card className={`absolute top-4 left-4 right-4 transition-all z-[1000] ${isExpanded ? 'bg-background' : 'bg-background/90 backdrop-blur'}`}>
      <div className="flex items-center gap-2 p-2">
        {!isExpanded ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsExpanded(true)}
            className="flex-shrink-0"
          >
            <Search className="h-5 w-5" />
          </Button>
        ) : (
          <>
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleClear}
              className="flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default MapSearch;
