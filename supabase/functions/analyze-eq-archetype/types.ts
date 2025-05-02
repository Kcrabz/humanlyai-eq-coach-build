
// Define TypeScript interfaces for the function

export interface AnalysisRequest {
  answers: number[];
  userId: string;
}

export interface AnalysisResponse {
  archetype: string;
  bio: string;
  focus: string;
  tip: string;
  raw_response?: string;
}
