
/**
 * Generates a Content Security Policy header string
 * @returns CSP header value string
 */
export const generateCSP = (): string => {
  // Define CSP directives
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'img-src': ["'self'", "data:", "https://www.gravatar.com", "https://*.supabase.co", "https://ui-avatars.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'connect-src': [
      "'self'", 
      "https://*.supabase.co", 
      "wss://*.supabase.co", 
      "https://api.openai.com", 
      "https://www.google-analytics.com"
    ],
    'frame-src': ["'self'", "https://www.google.com/recaptcha/"],
    'frame-ancestors': ["'self'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'upgrade-insecure-requests': [],
  };

  // Convert directives object to CSP string
  return Object.entries(directives)
    .map(([key, values]) => {
      return values.length > 0 
        ? `${key} ${values.join(' ')}`
        : key;
    })
    .join('; ');
};

/**
 * Adds security headers to HTML response
 * @param html The HTML content
 * @returns HTML with security meta tags
 */
export const addSecurityHeaders = (html: string): string => {
  const cspContent = generateCSP();
  
  // Create meta tags for security headers
  const securityMetaTags = `
    <meta http-equiv="Content-Security-Policy" content="${cspContent}">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  `;
  
  // Insert meta tags into HTML head
  return html.replace('</head>', `${securityMetaTags}</head>`);
};

/**
 * Sanitizes URL parameters to prevent injection attacks
 * @param url URL string to sanitize
 * @returns Sanitized URL string
 */
export const sanitizeUrl = (url: string): string => {
  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Sanitize each query parameter
    parsedUrl.searchParams.forEach((value, key) => {
      // Remove any script tags, etc.
      const sanitizedValue = value
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/on\w+=/gi, '');
      
      parsedUrl.searchParams.set(key, sanitizedValue);
    });
    
    return parsedUrl.toString();
  } catch (error) {
    // If parsing fails, remove potentially malicious parts
    return url
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+=/gi, '');
  }
};

/**
 * Generate a nonce value for CSP headers
 * @returns Random nonce string
 */
export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
