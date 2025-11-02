import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const SearchBar: React.FC = () => {
  return (
    <div className="relative p-4">
      <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search products, designs, fabrics..."
        className="w-full pl-12 pr-4 py-2 rounded-full border border-input focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
};

export default SearchBar;