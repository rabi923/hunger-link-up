import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, Bell, Globe, Moon, Trash2, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    newMessages: true,
    newListings: true,
    darkMode: false,
    distanceUnit: 'km',
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    toast.success('Settings updated');
  };

  const handleDeleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      toast.error('Failed to delete account');
      return;
    }

    // Sign out
    await supabase.auth.signOut();
    toast.success('Account deleted successfully');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Notifications */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex flex-col gap-1">
                <span>Enable Notifications</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Receive notifications for important updates
                </span>
              </Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting('notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="newMessages" className="flex flex-col gap-1">
                <span>New Messages</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Get notified when you receive messages
                </span>
              </Label>
              <Switch
                id="newMessages"
                checked={settings.newMessages}
                onCheckedChange={(checked) => updateSetting('newMessages', checked)}
                disabled={!settings.notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="newListings" className="flex flex-col gap-1">
                <span>New Nearby Listings</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Get notified about new food near you
                </span>
              </Label>
              <Switch
                id="newListings"
                checked={settings.newListings}
                onCheckedChange={(checked) => updateSetting('newListings', checked)}
                disabled={!settings.notifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your app experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="flex flex-col gap-1">
                <span>Dark Mode</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Enable dark theme (Coming soon)
                </span>
              </Label>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1">
                <span>Distance Unit</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Currently: Kilometers (km)
                </span>
              </Label>
              <Button variant="outline" size="sm" disabled>
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
