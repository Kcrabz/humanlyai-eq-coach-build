// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://acboajrjgqqnfrtozssb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjYm9hanJqZ3FxbmZydG96c3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4OTM1MzksImV4cCI6MjA2MTQ2OTUzOX0.RLHru7fGqvkDBbd8BNajhRxBeAmCLIfF99OWBhhBOxw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);