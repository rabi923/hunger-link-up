import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from '@/hooks/useUserLocation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const RequestForm = ({ open, onOpenChange, onSuccess }: RequestFormProps) => {
  const { location } = useUserLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    peopleCount: '',
    foodPreference: 'any',
    urgencyLevel: 'medium',
    neededBy: '',
    notes: '',
    locationAddress: '',
    organizationName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      toast.error('Location required. Please enable location services.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('food_requests').insert({
        receiver_id: user.id,
        people_count: parseInt(formData.peopleCount),
        food_preference: formData.foodPreference,
        urgency_level: formData.urgencyLevel,
        needed_by: formData.neededBy,
        notes: formData.notes,
        latitude: location.lat,
        longitude: location.lng,
        location_address: formData.locationAddress,
        organization_name: formData.organizationName
      });

      if (error) throw error;

      toast.success('Request posted successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Food</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>People Count *</Label>
            <Input
              type="number"
              min="1"
              required
              value={formData.peopleCount}
              onChange={e => setFormData({...formData, peopleCount: e.target.value})}
            />
          </div>

          <div>
            <Label>Food Preference *</Label>
            <RadioGroup value={formData.foodPreference} onValueChange={v => setFormData({...formData, foodPreference: v})}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vegetarian" id="veg" />
                <Label htmlFor="veg">🌱 Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non_vegetarian" id="nonveg" />
                <Label htmlFor="nonveg">🍖 Non-Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vegan" id="vegan" />
                <Label htmlFor="vegan">🥕 Vegan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="any" />
                <Label htmlFor="any">✨ Any</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Urgency *</Label>
            <RadioGroup value={formData.urgencyLevel} onValueChange={v => setFormData({...formData, urgencyLevel: v})}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">🟢 Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">🟡 Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">🟠 High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emergency" id="emergency" />
                <Label htmlFor="emergency">🔴 Emergency</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Needed By *</Label>
            <Input
              type="datetime-local"
              required
              value={formData.neededBy}
              onChange={e => setFormData({...formData, neededBy: e.target.value})}
            />
          </div>

          <div>
            <Label>Address *</Label>
            <Input
              required
              value={formData.locationAddress}
              onChange={e => setFormData({...formData, locationAddress: e.target.value})}
            />
          </div>

          <div>
            <Label>Organization Name</Label>
            <Input
              value={formData.organizationName}
              onChange={e => setFormData({...formData, organizationName: e.target.value})}
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              maxLength={500}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestForm;
