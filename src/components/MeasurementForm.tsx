import React, { useState, useEffect, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/components/SessionContextProvider';
import {
  Measurement,
  MeasurementType,
  getMeasurementTypes,
  upsertMeasurement,
  getMeasurementById,
} from '@/utils/measurements';

interface MeasurementFormProps {
  measurementId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ measurementId, onSave, onCancel }) => {
  const { session } = useSession();
  const userId = session?.user?.id;

  const [selectedMeasurementTypeId, setSelectedMeasurementTypeId] = useState<string>('');
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
  const [loadingMeasurementTypes, setLoadingMeasurementTypes] = useState(true);
  const [formData, setFormData] = useState<Partial<Measurement>>({
    notes: '',
    men_shirt_length: null,
    men_shirt_chest: null,
    men_shirt_waist: null,
    men_shirt_sleeve_length: null,
    men_shirt_shoulder: null,
    men_shirt_neck: null,
    men_pant_length: null,
    men_pant_waist: null,
    men_pant_hip: null,
    men_pant_thigh: null,
    men_pant_bottom: null,
    men_coat_length: null,
    men_coat_chest: null,
    men_coat_waist: null,
    men_coat_sleeve_length: null,
    men_coat_shoulder: null,
    ladies_size: null,
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMeasurementTypes = useCallback(async () => {
    setLoadingMeasurementTypes(true);
    try {
      const types = await getMeasurementTypes();
      setMeasurementTypes(types);
    } catch (error) {
      console.error('Failed to fetch measurement types:', error);
      showError('Failed to load measurement types.');
    } finally {
      setLoadingMeasurementTypes(false);
    }
  }, []);

  const fetchMeasurementData = useCallback(async () => {
    if (measurementId) {
      setLoading(true);
      try {
        const measurement = await getMeasurementById(measurementId);
        if (measurement) {
          setSelectedMeasurementTypeId(measurement.measurement_type || '');
          setFormData(measurement);
        } else {
          showError('Measurement not found.');
          onCancel();
        }
      } catch (error) {
        console.error('Failed to fetch measurement:', error);
        showError('Failed to load measurement data.');
        onCancel();
      } finally {
        setLoading(false);
      }
    }
  }, [measurementId, onCancel]);

  useEffect(() => {
    fetchMeasurementTypes();
    fetchMeasurementData();
  }, [fetchMeasurementTypes, fetchMeasurementData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      let parsedValue: string | number | null = value;
      if (id.startsWith('men_') && value !== '') {
        parsedValue = parseFloat(value);
      } else if (id === 'ladies_size') {
        parsedValue = value === '' ? null : value;
      } else if (value === '') {
        parsedValue = null;
      }
      return {
        ...prev,
        [id]: parsedValue,
      };
    });
  };

  const handleSelectMeasurementType = (value: string) => {
    setSelectedMeasurementTypeId(value);
    const selectedType = measurementTypes.find(type => type.name === value);
    if (selectedType) {
      const newFormData: Partial<Measurement> = { notes: formData.notes };
      selectedType.relevant_fields.forEach(field => {
        newFormData[field as keyof Measurement] = formData[field as keyof Measurement] || null;
      });
      setFormData(newFormData);
    } else {
      setFormData({ notes: formData.notes });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      showError('User not authenticated.');
      return;
    }
    if (!selectedMeasurementTypeId) {
      showError('Please select a measurement type.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedType = measurementTypes.find(type => type.name === selectedMeasurementTypeId);
      if (!selectedType) {
        showError('Invalid measurement type selected.');
        setIsSubmitting(false);
        return;
      }

      const measurementToSave: Partial<Measurement> = {
        ...formData,
        user_id: userId,
        measurement_type: selectedMeasurementTypeId,
      };

      const finalMeasurementData: Partial<Measurement> = {
        id: measurementToSave.id,
        user_id: measurementToSave.user_id,
        measurement_type: measurementToSave.measurement_type,
        notes: measurementToSave.notes,
      };

      selectedType.relevant_fields.forEach(field => {
        if (measurementToSave[field as keyof Measurement] !== undefined) {
          finalMeasurementData[field as keyof Measurement] = measurementToSave[field as keyof Measurement];
        }
      });

      await upsertMeasurement(finalMeasurementData);
      showSuccess('Measurement saved successfully!');
      onSave();
    } catch (error) {
      console.error('Error saving measurement:', error);
      showError('Failed to save measurement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMeasurementType = measurementTypes.find(
    (type) => type.name === selectedMeasurementTypeId
  );
  const relevantFields = selectedMeasurementType?.relevant_fields || [];

  if (loadingMeasurementTypes || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent-rose" />
        <span className="ml-2 text-text-secondary-body">Loading...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-card rounded-default shadow-elev border border-card-border">
      <h3 className="text-xl font-semibold text-text-primary-heading">
        {measurementId ? 'Edit Measurement' : 'Add New Measurement'}
      </h3>

      <div>
        <Label htmlFor="measurementType">Measurement Type</Label>
        <Select onValueChange={handleSelectMeasurementType} value={selectedMeasurementTypeId}>
          <SelectTrigger id="measurementType" className="w-full border-card-border rounded-small focus:ring-accent-rose">
            <SelectValue placeholder="Select your measurement type" />
          </SelectTrigger>
          <SelectContent>
            {measurementTypes.map((type) => (
              <SelectItem key={type.id} value={type.name}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMeasurementTypeId && (
        <>
          {relevantFields.includes('men_shirt_length') && (
            <div>
              <Label htmlFor="men_shirt_length">Men's Shirt Length</Label>
              <Input
                id="men_shirt_length"
                type="number"
                step="0.1"
                value={formData.men_shirt_length || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_shirt_chest') && (
            <div>
              <Label htmlFor="men_shirt_chest">Men's Shirt Chest</Label>
              <Input
                id="men_shirt_chest"
                type="number"
                step="0.1"
                value={formData.men_shirt_chest || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_shirt_waist') && (
            <div>
              <Label htmlFor="men_shirt_waist">Men's Shirt Waist</Label>
              <Input
                id="men_shirt_waist"
                type="number"
                step="0.1"
                value={formData.men_shirt_waist || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_shirt_sleeve_length') && (
            <div>
              <Label htmlFor="men_shirt_sleeve_length">Men's Shirt Sleeve Length</Label>
              <Input
                id="men_shirt_sleeve_length"
                type="number"
                step="0.1"
                value={formData.men_shirt_sleeve_length || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_shirt_shoulder') && (
            <div>
              <Label htmlFor="men_shirt_shoulder">Men's Shirt Shoulder</Label>
              <Input
                id="men_shirt_shoulder"
                type="number"
                step="0.1"
                value={formData.men_shirt_shoulder || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_shirt_neck') && (
            <div>
              <Label htmlFor="men_shirt_neck">Men's Shirt Neck</Label>
              <Input
                id="men_shirt_neck"
                type="number"
                step="0.1"
                value={formData.men_shirt_neck || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_pant_length') && (
            <div>
              <Label htmlFor="men_pant_length">Men's Pant Length</Label>
              <Input
                id="men_pant_length"
                type="number"
                step="0.1"
                value={formData.men_pant_length || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_pant_waist') && (
            <div>
              <Label htmlFor="men_pant_waist">Men's Pant Waist</Label>
              <Input
                id="men_pant_waist"
                type="number"
                step="0.1"
                value={formData.men_pant_waist || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_pant_hip') && (
            <div>
              <Label htmlFor="men_pant_hip">Men's Pant Hip</Label>
              <Input
                id="men_pant_hip"
                type="number"
                step="0.1"
                value={formData.men_pant_hip || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_pant_thigh') && (
            <div>
              <Label htmlFor="men_pant_thigh">Men's Pant Thigh</Label>
              <Input
                id="men_pant_thigh"
                type="number"
                step="0.1"
                value={formData.men_pant_thigh || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_pant_bottom') && (
            <div>
              <Label htmlFor="men_pant_bottom">Men's Pant Bottom</Label>
              <Input
                id="men_pant_bottom"
                type="number"
                step="0.1"
                value={formData.men_pant_bottom || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_coat_length') && (
            <div>
              <Label htmlFor="men_coat_length">Men's Coat Length</Label>
              <Input
                id="men_coat_length"
                type="number"
                step="0.1"
                value={formData.men_coat_length || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_coat_chest') && (
            <div>
              <Label htmlFor="men_coat_chest">Men's Coat Chest</Label>
              <Input
                id="men_coat_chest"
                type="number"
                step="0.1"
                value={formData.men_coat_chest || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_coat_waist') && (
            <div>
              <Label htmlFor="men_coat_waist">Men's Coat Waist</Label>
              <Input
                id="men_coat_waist"
                type="number"
                step="0.1"
                value={formData.men_coat_waist || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_coat_sleeve_length') && (
            <div>
              <Label htmlFor="men_coat_sleeve_length">Men's Coat Sleeve Length</Label>
              <Input
                id="men_coat_sleeve_length"
                type="number"
                step="0.1"
                value={formData.men_coat_sleeve_length || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('men_coat_shoulder') && (
            <div>
              <Label htmlFor="men_coat_shoulder">Men's Coat Shoulder</Label>
              <Input
                id="men_coat_shoulder"
                type="number"
                step="0.1"
                value={formData.men_coat_shoulder || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          {relevantFields.includes('ladies_size') && (
            <div>
              <Label htmlFor="ladies_size">Ladies Size</Label>
              <Input
                id="ladies_size"
                type="text"
                value={formData.ladies_size || ''}
                onChange={handleInputChange}
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          )}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              placeholder="Any additional notes about this measurement"
              className="border border-card-border rounded-small focus:ring-accent-rose"
            />
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="rounded-small border-card-border">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedMeasurementTypeId} className="bg-accent-rose text-white hover:bg-accent-dark rounded-small">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Measurement'
          )}
        </Button>
      </div>
    </form>
  );
};

export default MeasurementForm;