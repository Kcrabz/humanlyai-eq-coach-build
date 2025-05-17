
/**
 * Constants for localStorage and sessionStorage keys
 * Centralizing these prevents typos and makes refactoring easier
 */

// Theme storage
export const THEME_STORAGE_KEY = "humanly-theme";

// Authentication related keys
export const LOGIN_SUCCESS_TIMESTAMP = "login_success_timestamp";
export const LOGIN_SUCCESS_SESSION = "login_success";
export const FRESH_CHAT_NEEDED = "fresh_chat_needed";
export const CHAT_CLEARED_SESSION = "chat_cleared_for_session";

// PWA related storage keys
export const PWA_DESIRED_PATH = "pwa_desired_path";
export const PWA_LAST_PATH = "pwa_last_path";
export const PWA_AUTH_TIMESTAMP = "pwa_auth_timestamp";
export const PWA_REDIRECT_AFTER_LOGIN = "pwa_redirect_after_login";
export const PWA_SESSION_RESTORED = "pwa_session_restored";

// Chat session related keys
export const getChatSessionKey = (userId: string) => `chat_session_${userId}`;
export const getChatMessagesKey = (userId: string, sessionId?: string | null) => 
  sessionId ? `chat_messages_${userId}_${sessionId}` : `chat_messages_${userId}`;
