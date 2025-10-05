import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Heart, Search } from "lucide-react";
import { toast } from "sonner";
import FoodCard from "@/components/FoodCard";

const ReceiverDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchListings();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredListings(listings);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = listings.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query) ||
        listing.food_type?.toLowerCase().includes(query)
      );
      setFilteredListings(filtered);
    }
  }, [searchQuery, listings]);

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

    if (profileData?.role !== 'food_receiver') {
      navigate('/giver-dashboard');
      return;
    }

    setProfile(profileData);
    setLoading(false);
  };

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('food_listings')
      .select('*, profiles!food_listings_giver_id_fkey(full_name, phone)')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load food listings");
      return;
    }

    setListings(data || []);
    setFilteredListings(data || []);
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FoodShare</h1>
              <p className="text-sm text-muted-foreground">Food Receiver</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome, {profile?.full_name || 'Food Receiver'}!</h2>
          <p className="text-muted-foreground mb-4">Find available food near you</p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by food, location, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No matching food found" : "No food available yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search" : "Check back soon for new listings"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} available
            </p>
            {filteredListings.map((listing) => (
              <FoodCard 
                key={listing.id} 
                listing={listing}
                showContact
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReceiverDashboard;