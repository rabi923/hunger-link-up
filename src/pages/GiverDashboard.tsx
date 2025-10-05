import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Leaf } from "lucide-react";
import { toast } from "sonner";
import AddFoodDialog from "@/components/AddFoodDialog";
import FoodCard from "@/components/FoodCard";

const GiverDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchListings();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileData?.role !== 'food_giver') {
      navigate('/receiver-dashboard');
      return;
    }

    setProfile(profileData);
    setLoading(false);
  };

  const fetchListings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('food_listings')
      .select('*')
      .eq('giver_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load listings");
      return;
    }

    setListings(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FoodShare</h1>
              <p className="text-sm text-muted-foreground">Food Giver</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome, {profile?.full_name || 'Food Giver'}!</h2>
          <p className="text-muted-foreground">Share your excess food with those in need</p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Leaf className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">Start sharing food by creating your first listing</p>
            <Button size="lg" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Add Food Listing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <FoodCard 
                key={listing.id} 
                listing={listing} 
                isOwner 
                onUpdate={fetchListings}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      {listings.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <Button 
            size="lg" 
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      <AddFoodDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSuccess={fetchListings}
      />
    </div>
  );
};

export default GiverDashboard;