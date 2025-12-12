import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddressFormProps {
  address: {
    fullName: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    pincode: string;
    postOffice?: string;
    landmark?: string;
  };
  onAddressChange: (field: string, value: string) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onAddressChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-text-primary-heading">Shipping Address</h3>
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={address.fullName}
          onChange={(e) => onAddressChange('fullName', e.target.value)}
          placeholder="Enter recipient's full name"
          required
          className="border border-card-border rounded-small focus:ring-accent-rose"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={address.phone}
          onChange={(e) => onAddressChange('phone', e.target.value)}
          placeholder="Enter phone number"
          required
          className="border border-card-border rounded-small focus:ring-accent-rose"
        />
      </div>
      <div>
        <Label htmlFor="streetAddress">Street Address / Village / Road</Label>
        <Textarea
          id="streetAddress"
          value={address.streetAddress}
          onChange={(e) => onAddressChange('streetAddress', e.target.value)}
          placeholder="House No., Building Name, Street, Village, Road"
          required
          className="border border-card-border rounded-small focus:ring-accent-rose"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            value={address.city}
            onChange={(e) => onAddressChange('city', e.target.value)}
            placeholder="City"
            required
            className="border border-card-border rounded-small focus:ring-accent-rose"
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            type="text"
            value={address.state}
            onChange={(e) => onAddressChange('state', e.target.value)}
            placeholder="State"
            required
            className="border border-card-border rounded-small focus:ring-accent-rose"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            type="text"
            value={address.pincode}
            onChange={(e) => onAddressChange('pincode', e.target.value)}
            placeholder="Pincode"
            required
            className="border border-card-border rounded-small focus:ring-accent-rose"
          />
        </div>
        <div>
          <Label htmlFor="postOffice">Post Office (Optional)</Label>
          <Input
            id="postOffice"
            type="text"
            value={address.postOffice}
            onChange={(e) => onAddressChange('postOffice', e.target.value)}
            placeholder="Post Office"
            className="border border-card-border rounded-small focus:ring-accent-rose"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="landmark">Landmark / Near / Famous (Optional)</Label>
        <Input
          id="landmark"
          type="text"
          value={address.landmark}
          onChange={(e) => onAddressChange('landmark', e.target.value)}
          placeholder="e.g., Near XYZ Temple"
          className="border border-card-border rounded-small focus:ring-accent-rose"
        />
      </div>
    </div>
  );
};

export default AddressForm;