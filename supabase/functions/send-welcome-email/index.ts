import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  type: "signup" | "profile_complete";
  name?: string;
}

// Generate a 6-digit confirmation code
const generateConfirmationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, name }: WelcomeEmailRequest = await req.json();
    console.log(`Sending ${type} email to ${email}`);

    const confirmationCode = generateConfirmationCode();
    let subject: string;
    let html: string;

    if (type === "signup") {
      subject = "Welcome to Apex Pips - Your Confirmation Code";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(139, 92, 246, 0.2);">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                  <span style="font-size: 32px;">📈</span>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Apex Pips!</h1>
              </div>
              
              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px; text-align: center;">
                Your account has been created successfully. Here's your confirmation code:
              </p>
              
              <div style="background: rgba(139, 92, 246, 0.15); border-radius: 12px; padding: 32px; margin-bottom: 24px; border: 1px solid rgba(139, 92, 246, 0.3); text-align: center;">
                <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Your Confirmation Code</p>
                <h2 style="color: #8B5CF6; margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: monospace;">${confirmationCode}</h2>
              </div>
              
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(139, 92, 246, 0.2);">
                <h2 style="color: #8B5CF6; margin: 0 0 16px 0; font-size: 18px;">What's Next?</h2>
                <ul style="color: #a1a1aa; margin: 0; padding-left: 20px; line-height: 2;">
                  <li>Complete your profile to start trading</li>
                  <li>Make your first deposit</li>
                  <li>Start trading with leverage up to 100x</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="color: #71717a; font-size: 14px; margin-top: 32px; text-align: center;">
                If you didn't create this account, please ignore this email.
              </p>
            </div>
            
            <p style="color: #52525b; font-size: 12px; text-align: center; margin-top: 24px;">
              © 2024 Apex Pips. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = "Profile Complete - You're Ready to Trade!";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(139, 92, 246, 0.2);">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                  <span style="font-size: 32px;">✅</span>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Profile Complete!</h1>
              </div>
              
              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                ${name ? `Hi ${name},` : 'Hi,'} your profile has been completed successfully. You're now ready to start trading on Apex Pips!
              </p>
              
              <div style="background: rgba(34, 197, 94, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(34, 197, 94, 0.2);">
                <h2 style="color: #22c55e; margin: 0 0 16px 0; font-size: 18px;">Your Benefits</h2>
                <ul style="color: #a1a1aa; margin: 0; padding-left: 20px; line-height: 2;">
                  <li>Access to all trading pairs</li>
                  <li>Up to 100x leverage</li>
                  <li>24/7 live support</li>
                  <li>Instant deposits & fast withdrawals</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Start Trading Now
                </a>
              </div>
            </div>
            
            <p style="color: #52525b; font-size: 12px; text-align: center; margin-top: 24px;">
              © 2024 Apex Pips. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Apex Pips <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      }),
    });

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, confirmationCode }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
