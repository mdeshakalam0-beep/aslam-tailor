import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BrandForm from '@/components/admin/BrandForm';
import { getBrands, createBrand, updateBrand, deleteBrand, Brand } from '@/utils/brands';
import { showError } from '@/utils/toast';

const BrandManagement: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    const fetchedBrands = await getBrands();
    setBrands(fetchedBrands);
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAddBrand = () => {
    setEditingBrand(undefined);
    setIsFormOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (brandId: string) => {
    setBrandToDelete(brandId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBrand = async () => {
    if (brandToDelete) {
      const success = await deleteBrand(brandToDelete);
      if (success) {
        fetchBrands();
      }
      setBrandToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (brandData: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    let success = false;
    if (editingBrand) {
      const updated = await updateBrand(editingBrand.id, brandData);
      success = !!updated;
    } else {
      const created = await createBrand(brandData);
      success = !!created;
    }

    if (success) {
      fetchBrands();
      setIsFormOpen(false);
    }
    setFormLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-text-primary-heading">Brand Management</h2>
        <Button onClick={handleAddBrand} className="bg-accent-rose text-white hover:bg-accent-dark rounded-small">
          <PlusCircle className="h-5 w-5 mr-2" /> Add New Brand
        </Button>
      </div>

      <Card className="shadow-elev border border-card-border rounded-default">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-text-primary-heading">All Brands</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-text-secondary-body">Loading brands...</p>
          ) : brands.length === 0 ? (
            <p className="text-center text-text-secondary-body">No brands found. Add a new brand to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-text-primary-heading">Name</TableHead>
                    <TableHead className="text-text-primary-heading">Order</TableHead>
                    <TableHead className="text-right text-text-primary-heading">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium text-text-secondary-body">{brand.name}</TableCell>
                      <TableCell className="text-text-secondary-body">{brand.order_index}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditBrand(brand)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDeleteClick(brand.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Brand Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-default shadow-elev border border-card-border" aria-labelledby="brand-form-title">
          <DialogHeader>
            <DialogTitle id="brand-form-title" className="text-text-primary-heading">{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
            <DialogDescription className="text-text-secondary-body">
              {editingBrand ? 'Make changes to the brand here.' : 'Fill in the details for a new brand.'}
            </DialogDescription>
          </DialogHeader>
          <BrandForm
            initialData={editingBrand}
            onSubmit={handleFormSubmit}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-default shadow-elev border border-card-border" aria-labelledby="brand-delete-title">
          <DialogHeader>
            <DialogTitle id="brand-delete-title" className="text-text-primary-heading">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-text-secondary-body">
              This action cannot be undone. This will permanently delete the brand.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-small border-card-border">Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteBrand} className="bg-destructive text-white hover:bg-destructive/90 rounded-small">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandManagement;