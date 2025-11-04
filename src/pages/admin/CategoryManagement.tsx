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
import CategoryForm from '@/components/admin/CategoryForm';
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from '@/utils/categories';
import { showError } from '@/utils/toast';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const fetchedCategories = await getCategories();
    setCategories(fetchedCategories);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      const success = await deleteCategory(categoryToDelete);
      if (success) {
        fetchCategories();
      }
      setCategoryToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    let success = false;
    if (editingCategory) {
      const updated = await updateCategory(editingCategory.id, categoryData);
      success = !!updated;
    } else {
      const created = await createCategory(categoryData);
      success = !!created;
    }

    if (success) {
      fetchCategories();
      setIsFormOpen(false);
    }
    setFormLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-foreground">Category Management</h2>
        <Button onClick={handleAddCategory} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <PlusCircle className="h-5 w-5 mr-2" /> Add New Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-muted-foreground">No categories found. Add a new category to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <img src={category.image_url} alt={category.name} className="w-12 h-12 object-cover rounded-md" />
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDeleteClick(category.id)}>
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

      {/* Add/Edit Category Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" aria-labelledby="category-form-title">
          <DialogHeader>
            <DialogTitle id="category-form-title">{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Make changes to the category here.' : 'Fill in the details for a new category.'}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleFormSubmit}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent aria-labelledby="category-delete-title">
          <DialogHeader>
            <DialogTitle id="category-delete-title">Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the category.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteCategory}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;