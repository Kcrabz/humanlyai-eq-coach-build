
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SecurityQuestion {
  id: string;
  question: string;
}

/**
 * Fetches all available security questions
 */
export const fetchSecurityQuestions = async (): Promise<SecurityQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('security_questions')
      .select('id, question')
      .order('question');
      
    if (error) {
      console.error("Error fetching security questions:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching security questions:", error);
    return [];
  }
};

/**
 * Sets a security question and answer for a user
 */
export const setSecurityQuestion = async (
  userId: string, 
  questionId: string, 
  answer: string
): Promise<boolean> => {
  try {
    // Hash the answer before storing it
    // In a real production app, we'd use a proper hashing algorithm
    const hashedAnswer = btoa(answer.toLowerCase().trim());
    
    const { error } = await supabase
      .from('profiles')
      .update({
        security_question_id: questionId,
        security_answer: hashedAnswer
      })
      .eq('id', userId);
      
    if (error) {
      console.error("Error setting security question:", error);
      toast.error("Failed to set security question");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error setting security question:", error);
    return false;
  }
};

/**
 * Verifies a security question answer
 */
export const verifySecurityQuestionAnswer = async (
  userId: string, 
  answer: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('security_answer')
      .eq('id', userId)
      .maybeSingle();
      
    if (error || !data) {
      console.error("Error verifying security question:", error);
      return false;
    }
    
    // Compare the hashed answer
    const hashedAnswer = btoa(answer.toLowerCase().trim());
    return data.security_answer === hashedAnswer;
  } catch (error) {
    console.error("Unexpected error verifying security question:", error);
    return false;
  }
};

/**
 * Gets a user's security question
 */
export const getUserSecurityQuestion = async (email: string): Promise<SecurityQuestion | null> => {
  try {
    // First get the user ID from the email
    const { data: userData, error: userError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false // Don't create a new user if they don't exist
      }
    });
    
    // Fix: Add proper type checking and safety
    if (userError || !userData?.user) {
      console.error("Error getting user from email:", userError);
      return null;
    }
    
    const userId = userData.user.id;
    
    // Then get their security question
    const { data, error } = await supabase
      .from('profiles')
      .select('security_question_id')
      .eq('id', userId)
      .maybeSingle();
      
    if (error || !data?.security_question_id) {
      console.error("Error getting security question ID:", error);
      return null;
    }
    
    // Finally, get the question text
    const { data: questionData, error: questionError } = await supabase
      .from('security_questions')
      .select('id, question')
      .eq('id', data.security_question_id)
      .maybeSingle();
      
    if (questionError || !questionData) {
      console.error("Error getting security question:", questionError);
      return null;
    }
    
    return {
      id: questionData.id,
      question: questionData.question
    };
  } catch (error) {
    console.error("Unexpected error getting security question:", error);
    return null;
  }
};
