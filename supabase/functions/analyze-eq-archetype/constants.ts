
// Constants for the analyze-eq-archetype function

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const ARCHETYPE_MAPPING: Record<string, string> = {
  "reflector": "reflector",
  "activator": "activator",
  "regulator": "regulator",
  "connector": "connector",
  "observer": "observer"
};
