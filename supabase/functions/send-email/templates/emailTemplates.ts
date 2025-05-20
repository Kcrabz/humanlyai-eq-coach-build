
// Template renderer function with improved templates
export function renderEmailTemplate(templateName: string, data: Record<string, any>) {
  // Default values for templates
  const userName = data.name || data.firstName || 'there';
  const appUrl = data.appUrl || 'https://humanly.ai';
  const brandColor = '#4F46E5'; // Primary brand color
  const backgroundColor = '#F7F7F9'; // Light background color
  const textColor = '#1F2937'; // Main text color
  const secondaryTextColor = '#6B7280'; // Secondary text color
  
  // Common CSS styles for all email templates
  const commonStyles = `
    body {
      margin: 0;
      padding: 0;
      background-color: ${backgroundColor};
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #FFFFFF;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .logo {
      text-align: center;
      margin-bottom: 24px;
      padding-top: 12px;
    }
    .logo img {
      height: 40px;
    }
    h1 {
      color: ${textColor};
      font-size: 24px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      color: ${textColor};
      font-size: 16px;
      line-height: 1.5;
      margin: 16px 0;
    }
    .button {
      display: inline-block;
      background-color: ${brandColor};
      color: #FFFFFF !important;
      font-weight: 600;
      font-size: 16px;
      border-radius: 6px;
      padding: 12px 24px;
      margin: 24px 0;
      text-decoration: none;
      text-align: center;
      transition: background-color 0.15s ease;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .highlight {
      font-weight: 600;
      color: ${brandColor};
    }
    .stats {
      background-color: ${backgroundColor};
      border-radius: 6px;
      padding: 16px;
      margin: 20px 0;
    }
    .stats-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .stats-label {
      color: ${secondaryTextColor};
    }
    .stats-value {
      font-weight: 600;
      color: ${textColor};
    }
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #E5E7EB;
      margin-top: 32px;
      color: ${secondaryTextColor};
      font-size: 14px;
    }
    .footer a {
      color: ${secondaryTextColor};
      text-decoration: underline;
    }
  `;
  
  // Template selection
  switch (templateName) {
    case 'daily-nudge':
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Daily EQ Challenge</title>
          <style>
            ${commonStyles}
            .challenge-box {
              background-color: #F0F4FF;
              border-left: 4px solid ${brandColor};
              border-radius: 4px;
              padding: 16px;
              margin: 24px 0;
            }
            .streak-counter {
              display: inline-block;
              background-color: ${brandColor};
              color: white;
              font-weight: 600;
              padding: 4px 12px;
              border-radius: 20px;
              margin-left: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="https://humanly.ai/logo.png" alt="Humanly Logo">
            </div>
            
            <h1>Your Daily EQ Challenge</h1>
            
            <p>Hi ${userName},</p>
            
            <p>It's time for your daily emotional intelligence practice! Consistent practice leads to meaningful growth in your emotional intelligence.</p>
            
            <div class="challenge-box">
              <p style="margin-top: 0;"><strong>Today's Challenge:</strong></p>
              <p style="font-style: italic;">${data.challengeText || "Practice active listening in your next conversation. Focus entirely on understanding the speaker without planning your response while they're talking."}</p>
            </div>
            
            <p>Your current streak: <span class="streak-counter">${data.currentStreak || 0} days</span></p>
            
            <p>Continue your journey by completing today's challenge:</p>
            
            <div style="text-align: center;">
              <a href="${appUrl}/chat" class="button">Start Today's Challenge</a>
            </div>
            
            <div class="footer">
              <p>Humanly AI - Developing Emotional Intelligence</p>
              <p><a href="${appUrl}/settings/email-preferences">Manage email preferences</a> | <a href="${appUrl}">Visit Humanly</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
    
    case 'weekly-summary':
      const completedChallenges = data.challengesCompleted || 0;
      const completedSessions = data.sessionsCompleted || 0;
      const breakthroughs = data.breakthroughsCount || 0;
      
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Weekly EQ Progress</title>
          <style>
            ${commonStyles}
            .insight-box {
              background-color: #F0FFF4;
              border-left: 4px solid #059669;
              border-radius: 4px;
              padding: 16px;
              margin: 24px 0;
            }
            .progress-bar-container {
              background-color: #E5E7EB;
              height: 8px;
              border-radius: 4px;
              margin-top: 8px;
            }
            .progress-bar {
              background-color: ${brandColor};
              height: 8px;
              border-radius: 4px;
              width: ${Math.min(Math.max((completedChallenges / 7) * 100, 5), 100)}%;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="https://humanly.ai/logo.png" alt="Humanly Logo">
            </div>
            
            <h1>Your Weekly EQ Progress</h1>
            
            <p>Hi ${userName},</p>
            
            <p>Here's a snapshot of your emotional intelligence journey this week:</p>
            
            <div class="stats">
              <div class="stats-item">
                <div class="stats-label">Sessions completed</div>
                <div class="stats-value">${completedSessions}</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">Challenges completed</div>
                <div class="stats-value">${completedChallenges}</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">EQ breakthroughs</div>
                <div class="stats-value">${breakthroughs}</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">Weekly progress</div>
                <div class="stats-value">${Math.min(Math.max(Math.round((completedChallenges / 7) * 100), 0), 100)}%</div>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar"></div>
              </div>
            </div>
            
            <div class="insight-box">
              <p style="margin-top: 0;"><strong>Your personalized insight:</strong></p>
              <p style="font-style: italic;">${data.personalisedInsight || "You're making steady progress on your emotional intelligence journey. Keep focusing on self-awareness and empathetic listening for continued growth."}</p>
            </div>
            
            <p>Review your full progress and set goals for the upcoming week:</p>
            
            <div style="text-align: center;">
              <a href="${appUrl}/progress" class="button">View Detailed Progress</a>
            </div>
            
            <div class="footer">
              <p>Humanly AI - Developing Emotional Intelligence</p>
              <p><a href="${appUrl}/settings/email-preferences">Manage email preferences</a> | <a href="${appUrl}">Visit Humanly</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
    
    case 're-engagement':
      const daysSinceLogin = data.daysSinceLastLogin || 7;
      
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>We Miss You!</title>
          <style>
            ${commonStyles}
            .prompt-box {
              background-color: #FEF3C7;
              border-left: 4px solid #D97706;
              border-radius: 4px;
              padding: 16px;
              margin: 24px 0;
            }
            .benefits {
              margin: 24px 0;
            }
            .benefit-item {
              display: flex;
              margin-bottom: 16px;
            }
            .benefit-icon {
              flex-shrink: 0;
              width: 24px;
              height: 24px;
              margin-right: 12px;
              background-color: #E0E7FF;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${brandColor};
              font-weight: bold;
            }
            .benefit-text {
              flex-grow: 1;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="https://humanly.ai/logo.png" alt="Humanly Logo">
            </div>
            
            <h1>We've Missed You!</h1>
            
            <p>Hi ${userName},</p>
            
            <p>It's been ${daysSinceLogin} days since your last session. Your EQ journey is waiting for you to return!</p>
            
            <div class="prompt-box">
              <p style="margin-top: 0;"><strong>A thought for you:</strong></p>
              <p style="font-style: italic;">${data.personalisedPrompt || "Emotional intelligence is like a muscle - regular practice leads to meaningful growth. Even a few minutes each day can make a significant difference."}</p>
            </div>
            
            <p>Here's why it's worth coming back:</p>
            
            <div class="benefits">
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div class="benefit-text">Your progress is saved and ready to continue</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div class="benefit-text">New insights are waiting based on your profile</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div class="benefit-text">Just 5 minutes a day can build lasting EQ skills</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${appUrl}/chat" class="button">Resume Your Journey</a>
            </div>
            
            <div class="footer">
              <p>Humanly AI - Developing Emotional Intelligence</p>
              <p><a href="${appUrl}/settings/email-preferences">Manage email preferences</a> | <a href="${appUrl}">Visit Humanly</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
      
    default:
      // Generic/fallback template
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>A Message from Humanly</title>
          <style>
            ${commonStyles}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="https://humanly.ai/logo.png" alt="Humanly Logo">
            </div>
            
            <h1>A Message from Humanly</h1>
            
            <p>Hi ${userName},</p>
            
            <p>${data.message || "Thanks for using Humanly AI! We're excited to be part of your emotional intelligence journey."}</p>
            
            <div style="text-align: center;">
              <a href="${appUrl}" class="button">Visit Humanly</a>
            </div>
            
            <div class="footer">
              <p>Humanly AI - Developing Emotional Intelligence</p>
              <p><a href="${appUrl}/settings/email-preferences">Manage email preferences</a> | <a href="${appUrl}">Visit Humanly</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
  }
}
