import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MeasurementType } from '@/utils/measurementTypes';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { UserMeasurements } from '@/types/checkout';

interface MeasurementTypeFormProps {
  initialData?: MeasurementType;
  onSubmit: (data: Omit<MeasurementType, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  loading: boolean;
}

const allMeasurementFields: Array<{ key: keyof UserMeasurements; label: string; group: string }> = [
  { key: 'ladies_size', label: 'Ladies\' Size', group: 'Women' },
  { key: 'men_shirt_length', label: 'Shirt Length', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_shirt_chest', label: 'Shirt Chest', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_shirt_waist', label: 'Shirt Waist', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_shirt_sleeve_length', label: 'Shirt Sleeve Length', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_shirt_shoulder', label: 'Shirt Shoulder', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_shirt_neck', label: 'Shirt Neck', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_pant_length', label: 'Pant Length', group: 'Men - Pant/Paijama' },
  { key: 'men_pant_waist', label: 'Pant Waist', group: 'Men - Pant/Paijama' },
  { key: 'men_pant_hip', label: 'Pant Hip', group: 'Men - Pant/Paijama' },
  { key: 'men_pant_thigh', label: 'Pant Thigh', group: 'Men - Pant/Paijama' },
  { key: 'men_pant_bottom', label: 'Pant Bottom', group: 'Men - Pant/Paijama' },
  { key: 'men_coat_length', label: 'Coat Length', group: 'Men - Coat/Washcoat/Bajezar' },
  { key: 'men_coat_chest', label: 'Coat Chest', group: 'Men - Coat/Washcoat/Bajezar' },
  { key: 'men_coat_waist', label: 'Coat Waist', group: 'Men - Coat/Washcoat/Bajezar' },
  { key: 'men_coat_sleeve_length', label: 'Coat Sleeve Length', group: 'Men - Coat/Washcoat/Bajezar' },
  { key: 'men_coat_shoulder', label: 'Coat Shoulder', group: 'Men - Coat/Washcoat/Bajezar' },
  { key: 'notes', label: 'Additional Notes', group: 'General' },
];

const MeasurementTypeForm: React.FC<MeasurementTypeFormProps> = ({ initialData, onSubmit, loading }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedFields, setSelectedFields] = useState<Array<keyof UserMeasurements>>(initialData?.relevant_fields || []);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setSelectedFields(initialData.relevant_fields || []);
    } else {
      setName('');
      setDescription('');
      setSelectedFields([]);
    }
  }, [initialData]);

  const handleFieldToggle = (fieldKey: keyof UserMeasurements, checked: boolean) => {
    setSelectedFields((prev) =>
      checked ? [...prev, fieldKey] : prev.filter((key) => key !== fieldKey)
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const typeData = {
      name,
      description: description || undefined,
      relevant_fields: selectedFields,
    };
    await onSubmit(typeData);
  };

  const groupedFields = allMeasurementFields.reduce((acc, field) => {
    (acc[field.group] = acc[field.group] || []).push(field);
    return acc;
  }, {} as Record<string, typeof allMeasurementFields>);

  return (
    <Card className="w-full border border-card-border shadow-elev">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-text-primary-heading">
          {initialData ? 'Edit Measurement Type' : 'Add New Measurement Type'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Measurement Type Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Men's Shirt, Women's Dress"
              required
              className="border border-card-border rounded-small focus:ring-accent-rose"
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this measurement type."
              rows={3}
              className="border border-card-border rounded-small focus:ring-accent-rose"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-text-primary-heading">Select Relevant Measurement Fields</Label>
            <p className="text-sm text-text-secondary-body">Choose which specific measurements are applicable for this type.</p>
            {Object.entries(groupedFields).map(([group, fields]) => (
              <div key={group} className="border border-card-border rounded-small p-3 bg-primary-pale-pink">
                <h4 className="font-semibold text-text-primary-heading mb-2">{group}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fields.map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`field-${field.key}`}
                        checked={selectedFields.includes(field.key)}
                        onCheckedChange={(checked) => handleFieldToggle(field.key, !!checked)}
                      />
                      <Label htmlFor={`field-${field.key}`} className="text-text-secondary-body">{field.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full bg-accent-rose text-white hover:bg-accent-dark rounded-small" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (initialData ? 'Update Measurement Type' : 'Add Measurement Type')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeasurementTypeForm;