import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppSettings } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Coins, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsTab = () => {
  const [settings, setSettings] = useState<AppSettings>({ coinsPerAd: 50 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'app');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as AppSettings);
        } else {
          // Initialize if empty
          await setDoc(docRef, { coinsPerAd: 50 });
          setSettings({ coinsPerAd: 50 });
        }
        setPermissionError(false);
      } catch (error: any) {
        console.error("Error fetching settings:", error);
        if (error.code === 'permission-denied' || error.message?.includes('permission')) {
          setPermissionError(true);
        } else {
          toast.error('Failed to load settings');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'app'), settings, { merge: true });
      toast.success('Settings updated successfully');
      setPermissionError(false);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setPermissionError(true);
      } else {
        toast.error('Failed to update settings: ' + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSettings({ ...settings, coinsPerAd: isNaN(val) ? 0 : val });
  };

  if (isLoading) {
    return <div className="text-muted-foreground p-8">Loading settings...</div>;
  }

  if (permissionError) {
    return (
      <Card className="bg-destructive/10 border-destructive shadow-none max-w-2xl text-destructive-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Database Permission Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your Firebase database is currently locked. The AI Assistant cannot update your database security rules automatically because Firebase blocks external systems from altering security configurations.
          </p>
          <p className="font-bold">To fix this, please follow these steps:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold">Firebase Console</a> and open your project.</li>
            <li>Click on <b>Firestore Database</b> in the left menu.</li>
            <li>Go to the <b>Rules</b> tab.</li>
            <li>Replace all the code there with the following:</li>
          </ol>
          <pre className="bg-background/50 p-4 rounded-md font-mono text-sm border border-destructive/20 select-all overflow-x-auto text-foreground">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
          </pre>
          <p>Click <b>Publish</b>, then reload this page.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            I have updated the rules, Reload Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Earning Configurations
          </CardTitle>
          <CardDescription>
            Manage how users earn rewards in the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="coinsPerAd" className="text-sm font-semibold">Coins per Ad View</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  id="coinsPerAd" 
                  type="number" 
                  min="0"
                  required
                  value={settings.coinsPerAd} 
                  onChange={handleChange}
                  className="max-w-[200px] font-mono text-lg"
                />
                <span className="text-sm text-muted-foreground">coins awarded upon completion.</span>
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> 
              {isSaving ? 'Saving Changes...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
