
import React from "react";

interface EmailDetailsDataProps {
  emailData: any;
}

export const EmailDetailsData: React.FC<EmailDetailsDataProps> = ({ emailData }) => {
  // Format email data for display
  const formatEmailData = (data: any) => {
    if (!data) return "No data";
    
    try {
      // Filter out any large or complex objects that might make the display cluttered
      const cleanData = { ...data };
      
      // Return the formatted JSON
      return JSON.stringify(cleanData, null, 2);
    } catch (err) {
      console.error("Error formatting email data:", err);
      return "Error formatting data";
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-1">Email Data</h4>
      <div className="bg-muted rounded-md p-4 overflow-x-auto">
        <pre className="text-sm whitespace-pre-wrap">
          {formatEmailData(emailData)}
        </pre>
      </div>
    </div>
  );
};
