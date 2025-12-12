import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, PlusCircle, EyeOff, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AppPopupForm from '@/components/admin/AppPopupForm';
import { getAppPopups, createAppPopup, updateAppPopup, deleteAppPopup, AppPopup } from '@/utils/appPopups';
import { showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

const defaultAppPopup: AppPopup = {
  id: '',
  title: '',
  description: null,
  image_url: null,
  cta_text: null,
  cta_link: null,
  order: 0,
  is_active: true,
};

const AppPopupManagement: React.FC = () => {
  const [popups, setPopups] = useState<AppPopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<AppPopup | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [popupToDelete, setPopupToDelete] = useState<string | null>(null);

  const fetchPopups = async () => {
    setLoading(true);
    const fetchedPopups = await getAppPopups(true);
    setPopups(fetchedPopups);
    setLoading(false);
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const handleAddPopup = () => {
    setEditingPopup(defaultAppPopup);
    setIsFormOpen(true);
  };

  const handleEditPopup = (popup: AppPopup) => {
    setEditingPopup(popup);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (popupId: string) => {
    setPopupToDelete(popupId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePopup = async () => {
    if (popupToDelete) {
      const success = await deleteAppPopup(popupToDelete);
      if (success) {
        fetchPopups();
      }
      setPopupToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (popupData: Omit<AppPopup, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    let success = false;
    if (editingPopup && editingPopup.id) {
      const updated = await updateAppPopup(editingPopup.id, popupData);
      success = !!updated;
    } else {
      const created = await createAppPopup(popupData);
      success = !!created;
    }

    if (success) {
      fetchPopups();
      setIsFormOpen(false);
    }
    setFormLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-text-primary-heading">App Pop-up Management</h2>
        <Button onClick={handleAddPopup} className="bg-accent-rose text-white hover:bg-accent-dark rounded-small">
          <PlusCircle className="h-5 w-5 mr-2" /> Add New Pop-up
        </Button>
      </div>

      <Card className="shadow-elev border border-card-border rounded-default">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-text-primary-heading">All App Pop-ups</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-text-secondary-body">Loading pop-ups...</p>
          ) : popups.length === 0 ? (
            <p className="text-center text-text-secondary-body">No app pop-ups found. Add a new pop-up to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-text-primary-heading">Image</TableHead>
                    <TableHead className="text-text-primary-heading">Title</TableHead>
                    <TableHead className="text-text-primary-heading">Order</TableHead>
                    <TableHead className="text-text-primary-heading">Status</TableHead>
                    <TableHead className="text-right text-text-primary-heading">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popups.map((popup) => (
                    <TableRow key={popup.id}>
                      <TableCell>
                        {popup.image_url ? (
                          <img src={popup.image_url} alt={popup.title} className="w-16 h-12 object-cover rounded-small border border-card-border" />
                        ) : (
                          <div className="w-16 h-12 bg-primary-pale-pink flex items-center justify-center rounded-small text-muted-foreground text-xs border border-card-border">No Image</div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-text-secondary-body">{popup.title}</TableCell>
                      <TableCell className="text-text-secondary-body">{popup.order}</TableCell>
                      <TableCell>
                        <Badge className={popup.is_active ? 'bg-accent-rose text-white' : 'bg-primary-pale-pink text-accent-dark'}>
                          {popup.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditPopup(popup)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDeleteClick(popup.id)}>
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

      {/* Add/Edit Pop-up Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-default shadow-elev border border-card-border" aria-labelledby="app-popup-form-title">
          <DialogHeader>
            <DialogTitle id="app-popup-form-title" className="text-text-primary-heading">{editingPopup?.id ? 'Edit App Pop-up' : 'Add New App Pop-up'}</DialogTitle>
            <DialogDescription className="text-text-secondary-body">
              {editingPopup?.id ? 'Make changes to the app pop-up here.' : 'Fill in the details for a new app pop-up.'}
            </DialogDescription>
          </DialogHeader>
          <AppPopupForm
            initialData={editingPopup}
            onSubmit={handleFormSubmit}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-default shadow-elev border border-card-border" aria-labelledby="app-popup-delete-title">
          <DialogHeader>
            <DialogTitle id="app-popup-delete-title" className="text-text-primary-heading">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-text-secondary-body">
              This action cannot be undone. This will permanently delete the app pop-up.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-small border-card-border">Cancel</Button>
            <Button variant="destructive" onClick={confirmDeletePopup} className="bg-destructive text-white hover:bg-destructive/90 rounded-small">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppPopupManagement;