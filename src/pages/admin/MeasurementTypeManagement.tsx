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
import MeasurementTypeForm from '@/components/admin/MeasurementTypeForm';
import { getMeasurementTypes, createMeasurementType, updateMeasurementType, deleteMeasurementType, MeasurementType } from '@/utils/measurementTypes';
import { showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import { UserMeasurements } from '@/types/checkout';

const MeasurementTypeManagement: React.FC = () => {
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<MeasurementType | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null);

  const fieldLabels: Record<keyof UserMeasurements, string> = {
    ladies_size: 'Ladies\' Size',
    men_shirt_length: 'Shirt Length',
    men_shirt_chest: 'Shirt Chest',
    men_shirt_waist: 'Shirt Waist',
    men_shirt_sleeve_length: 'Shirt Sleeve Length',
    men_shirt_shoulder: 'Shirt Shoulder',
    men_shirt_neck: 'Shirt Neck',
    men_pant_length: 'Pant Length',
    men_pant_waist: 'Pant Waist',
    men_pant_hip: 'Pant Hip',
    men_pant_thigh: 'Pant Thigh',
    men_pant_bottom: 'Pant Bottom',
    men_coat_length: 'Coat Length',
    men_coat_chest: 'Coat Chest',
    men_coat_waist: 'Coat Waist',
    men_coat_sleeve_length: 'Coat Sleeve Length',
    men_coat_shoulder: 'Coat Shoulder',
    notes: 'Notes',
    id: 'ID',
    user_id: 'User ID',
    measurement_type: 'Measurement Type',
    updated_at: 'Updated At',
  };

  const fetchMeasurementTypes = async () => {
    setLoading(true);
    const fetchedTypes = await getMeasurementTypes();
    setMeasurementTypes(fetchedTypes);
    setLoading(false);
  };

  useEffect(() => {
    fetchMeasurementTypes();
  }, []);

  const handleAddType = () => {
    setEditingType(undefined);
    setIsFormOpen(true);
  };

  const handleEditType = (type: MeasurementType) => {
    setEditingType(type);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (typeId: string) => {
    setTypeToDelete(typeId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteType = async () => {
    if (typeToDelete) {
      const success = await deleteMeasurementType(typeToDelete);
      if (success) {
        fetchMeasurementTypes();
      }
      setTypeToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (typeData: Omit<MeasurementType, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    let success = false;
    if (editingType) {
      const updated = await updateMeasurementType(editingType.id, typeData);
      success = !!updated;
    } else {
      const created = await createMeasurementType(typeData);
      success = !!created;
    }

    if (success) {
      fetchMeasurementTypes();
      setIsFormOpen(false);
    }
    setFormLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-text-primary-heading">Measurement Type Management</h2>
        <Button onClick={handleAddType} className="bg-accent-rose text-white hover:bg-accent-dark rounded-small">
          <PlusCircle className="h-5 w-5 mr-2" /> Add New Type
        </Button>
      </div>

      <Card className="shadow-elev border border-card-border rounded-default">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-text-primary-heading">All Measurement Types</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-text-secondary-body">Loading measurement types...</p>
          ) : measurementTypes.length === 0 ? (
            <p className="text-center text-text-secondary-body">No measurement types found. Add a new type to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-text-primary-heading">Name</TableHead>
                    <TableHead className="text-text-primary-heading">Description</TableHead>
                    <TableHead className="text-text-primary-heading">Relevant Fields</TableHead>
                    <TableHead className="text-right text-text-primary-heading">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {measurementTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium text-text-secondary-body">{type.name}</TableCell>
                      <TableCell className="text-text-secondary-body">{type.description || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {type.relevant_fields && type.relevant_fields.length > 0 ? (
                            type.relevant_fields.map((fieldKey) => (
                              <Badge key={fieldKey} className="bg-primary-pale-pink text-accent-dark whitespace-nowrap">
                                {fieldLabels[fieldKey] || fieldKey}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-text text-sm">None specified</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditType(type)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDeleteClick(type.id)}>
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

      {/* Add/Edit Measurement Type Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-default shadow-elev border border-card-border" aria-labelledby="measurement-type-form-title">
          <DialogHeader>
            <DialogTitle id="measurement-type-form-title" className="text-text-primary-heading">{editingType ? 'Edit Measurement Type' : 'Add New Measurement Type'}</DialogTitle>
            <DialogDescription className="text-text-secondary-body">
              {editingType ? 'Make changes to the measurement type here.' : 'Fill in the details for a new measurement type.'}
            </DialogDescription>
          </DialogHeader>
          <MeasurementTypeForm
            initialData={editingType}
            onSubmit={handleFormSubmit}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-default shadow-elev border border-card-border" aria-labelledby="measurement-type-delete-title">
          <DialogHeader>
            <DialogTitle id="measurement-type-delete-title" className="text-text-primary-heading">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-text-secondary-body">
              This action cannot be undone. This will permanently delete the measurement type.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-small border-card-border">Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteType} className="bg-destructive text-white hover:bg-destructive/90 rounded-small">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeasurementTypeManagement;