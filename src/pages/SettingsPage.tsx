
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SettingsPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch user's API key if set
  useEffect(() => {
    const fetchApiKey = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_api_keys')
          .select('openai_api_key')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data?.openai_api_key) {
          setApiKey("••••••••••••••••••••••••"); // Mask the actual key
        }
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    };
    
    fetchApiKey();
  }, [user]);

  const saveApiKey = async () => {
    if (!user || !apiKey) return;
    
    setLoading(true);
    try {
      // Check if user already has an API key entry
      const { data, error: fetchError } = await supabase
        .from('user_api_keys')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Update existing entry
        const { error } = await supabase
          .from('user_api_keys')
          .update({ openai_api_key: apiKey, updated_at: new Date() })
          .eq('id', data.id);
        
        if (error) throw error;
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('user_api_keys')
          .insert({ user_id: user.id, openai_api_key: apiKey });
        
        if (error) throw error;
      }
      
      toast.success("API key saved successfully");
      setApiKey("••••••••••••••••••••••••"); // Mask the key after saving
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-8">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You can use your own OpenAI API key for chat functionalities. If not provided, the application will use the default key.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">OpenAI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your API key is stored securely and never shared.
                </p>
              </div>
              
              <Button 
                onClick={saveApiKey} 
                disabled={loading || !apiKey}
                className="mt-2"
              >
                {loading ? 'Saving...' : 'Save API Key'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
