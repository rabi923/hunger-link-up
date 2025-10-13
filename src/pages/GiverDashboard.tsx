import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MapView from "@/components/Map/MapView";
import RequestForm from "@/components/FoodRequest/RequestForm";
import { Loader2 } from "lucide-react";

const GiverDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile?.role !== 'food_giver') {
      navigate('/receiver-dashboard');
      return;
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <MapView userRole="food_giver" onTabChange={(tab) => {}} />
      <RequestForm
        open={showRequestForm}
        onOpenChange={setShowRequestForm}
        onSuccess={() => {}}
      />
    </>
  );
};

export default GiverDashboard;