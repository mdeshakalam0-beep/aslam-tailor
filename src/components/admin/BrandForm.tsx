import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brand } from '@/utils/brands';
import { Loader2 } from 'lucide-react';

interface BrandFormProps {
  initialData?: Brand;
  onSubmit: (data: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  loading: boolean;
}

const BrandForm: React.FC<BrandFormProps> = ({ initialData, onSubmit, loading }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [orderIndex, setOrderIndex] = useState(initialData?.order_index?.toString() || '0');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setOrderIndex(initialData.order_index?.toString() || '0');
    } else {
      setName('');
      setOrderIndex('0');
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const brandData = {
      name,
      order_index: parseInt(orderIndex),
    };
    await onSubmit(brandData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          {initialData ? 'Edit Brand' : 'Add New Brand'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Brand Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Raymond"
              required
            />
          </div>
          <div>
            <Label htmlFor="orderIndex">Display Order (Lower number appears first)</Label>
            <Input
              id="orderIndex"
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              placeholder="e.g., 1"
              min="0"
            />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (initialData ? 'Update Brand' : 'Add Brand')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BrandForm;