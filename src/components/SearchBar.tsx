import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { searchProducts, Product } from '@/utils/products';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (results: Product[], searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchTerm.trim() === '') {
      setSearchResults([]);
      onSearch([], '');
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimeoutRef.current = window.setTimeout(async () => {
      const results = await searchProducts(searchTerm);
      setSearchResults(results);
      onSearch(results, searchTerm);
      setLoading(false);
      setShowResults(true); // Show results after search
    }, 300); // Debounce for 300ms

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFocus = () => {
    if (searchTerm.trim() !== '' && searchResults.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div className="relative p-4" ref={searchBarRef}>
      <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search products, designs, fabrics..."
        className="w-full pl-12 pr-4 py-2 rounded-full border border-input focus:ring-2 focus:ring-primary focus:border-transparent"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
      />
      {loading && (
        <div className="absolute right-7 top-1/2 -translate-y-1/2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {showResults && searchResults.length > 0 && searchTerm.trim() !== '' && (
        <Card className="absolute top-full left-4 right-4 mt-2 z-20 shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2">
            {searchResults.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="flex items-center p-2 hover:bg-muted rounded-md transition-colors"
                onClick={() => {
                  setShowResults(false);
                  setSearchTerm(''); // Clear search term after selection
                }}
              >
                <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">₹{product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;