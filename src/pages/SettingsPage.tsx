
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const apiKeySchema = z.object({
  openai_api_key: z.string().min(1, "API key is required"),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const SettingsPage = () => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      openai_api_key: "",
    },
  });

  // Check if user has API key stored
  useEffect(() => {
    const checkApiKey = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_api_keys")
          .select("openai_api_key")
          .eq("user_id", user.id)
          .single();
        
        if (error && error.code !== "PGRST116") {
          console.error("Error checking API key:", error);
          return;
        }
        
        setHasApiKey(!!data?.openai_api_key);
      } catch (error) {
        console.error("Error checking API key:", error);
      }
    };
    
    checkApiKey();
  }, [user]);

  const onSubmit = async (values: ApiKeyFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Check if user already has an API key record
      const { data: existingKey } = await supabase
        .from("user_api_keys")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (existingKey) {
        // Update existing key
        const { error } = await supabase
          .from("user_api_keys")
          .update({ openai_api_key: values.openai_api_key })
          .eq("user_id", user.id);
          
        if (error) throw error;
      } else {
        // Create new key
        const { error } = await supabase
          .from("user_api_keys")
          .insert({ user_id: user.id, openai_api_key: values.openai_api_key });
          
        if (error) throw error;
      }
      
      toast.success("API key saved successfully");
      setHasApiKey(true);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("user_api_keys")
        .delete()
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      toast.success("API key deleted successfully");
      setHasApiKey(false);
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-8">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
            <div className="space-y-4">
              <div>
                <Label>OpenAI API Key</Label>
                <div className="flex items-center mt-2 gap-4">
                  <div className="text-sm">
                    {hasApiKey === null ? (
                      "Checking..."
                    ) : hasApiKey ? (
                      "API key is configured"
                    ) : (
                      "No API key configured"
                    )}
                  </div>
                  
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        {hasApiKey ? "Change API Key" : "Add API Key"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>OpenAI API Key</DialogTitle>
                        <DialogDescription>
                          Enter your OpenAI API key to enable AI features.
                          Your key will be securely stored.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="openai_api_key"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>API Key</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="sk-..."
                                    autoComplete="off"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? "Saving..." : "Save API Key"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  
                  {hasApiKey && (
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteApiKey}
                      disabled={isLoading}
                    >
                      Delete API Key
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
