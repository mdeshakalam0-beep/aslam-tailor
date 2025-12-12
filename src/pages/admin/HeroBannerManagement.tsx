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
import HeroBannerForm from '@/components/admin/HeroBannerForm';
import { getHeroBanners, createHeroBanner, updateHeroBanner, deleteHeroBanner, HeroBanner } from '@/utils/banners';
import { showError } from '@/utils/toast';

const HeroBannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    const fetchedBanners = await getHeroBanners();
    setBanners(fetchedBanners);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = () => {
    setEditingBanner(undefined);
    setIsFormOpen(true);
  };

  const handleEditBanner = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (bannerId: string) => {
    setBannerToDelete(bannerId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBanner = async () => {
    if (bannerToDelete) {
      const success = await deleteHeroBanner(bannerToDelete);
      if (success) {
        fetchBanners();
      }
      setBannerToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (bannerData: Omit<HeroBanner, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    let success = false;
    if (editingBanner) {
      const updated = await updateHeroBanner(editingBanner.id, bannerData);
      success = !!updated;
    } else {
      const created = await createHeroBanner(bannerData);
      success = !!created;
    }

    if (success) {
      fetchBanners();
      setIsFormOpen(false);
    }
    setFormLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-text-primary-heading">Hero Banner Management</h2>
        <Button onClick={handleAddBanner} className="bg-accent-rose text-white hover:bg-accent-dark rounded-small">
          <PlusCircle className="h-5 w-5 mr-2" /> Add New Banner
        </Button>
      </div>

      <Card className="shadow-elev border border-card-border rounded-default">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-text-primary-heading">All Hero Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-text-secondary-body">Loading banners...</p>
          ) : banners.length === 0 ? (
            <p className="text-center text-text-secondary-body">No hero banners found. Add a new banner to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-text-primary-heading">Image</TableHead>
                    <TableHead className="text-text-primary-heading">Headline</TableHead>
                    <TableHead className="text-text-primary-heading">CTA Text</TableHead>
                    <TableHead className="text-text-primary-heading">Order</TableHead>
                    <TableHead className="text-right text-text-primary-heading">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <img src={banner.image_url} alt={banner.headline} className="w-16 h-12 object-cover rounded-small border border-card-border" />
                      </TableCell>
                      <TableCell className="font-medium text-text-secondary-body">{banner.headline}</TableCell>
                      <TableCell className="text-text-secondary-body">{banner.cta_text}</TableCell>
                      <TableCell className="text-text-secondary-body">{banner.order}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditBanner(banner)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDeleteClick(banner.id)}>
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

      {/* Add/Edit Banner Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-default shadow-elev border border-card-border" aria-labelledby="banner-form-title">
          <DialogHeader>
            <DialogTitle id="banner-form-title" className="text-text-primary-heading">{editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}</DialogTitle>
            <DialogDescription className="text-text-secondary-body">
              {editingBanner ? 'Make changes to the banner here.' : 'Fill in the details for a new hero banner.'}
            </DialogDescription>
          </DialogHeader>
          <HeroBannerForm
            initialData={editingBanner}
            onSubmit={handleFormSubmit}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-default shadow-elev border border-card-border" aria-labelledby="banner-delete-title">
          <DialogHeader>
            <DialogTitle id="banner-delete-title" className="text-text-primary-heading">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-text-secondary-body">
              This action cannot be undone. This will permanently delete the hero banner.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-small border-card-border">Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteBanner} className="bg-destructive text-white hover:bg-destructive/90 rounded-small">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroBannerManagement;