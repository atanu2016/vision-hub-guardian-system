
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  sender: string;
  recipient: string;
  secure: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, port, username, password, sender, recipient, secure } = await req.json() as SMTPConfig;

    // Basic validation
    if (!host || !port || !username || !password || !sender || !recipient) {
      return new Response(
        JSON.stringify({ error: "Missing required SMTP configuration parameters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: host,
        port: port,
        tls: secure,
        auth: {
          username: username,
          password: password,
        },
      },
    });

    // Send test email
    await client.send({
      from: sender,
      to: recipient,
      subject: "Vision Hub Test Email",
      content: `
        <html>
          <body>
            <h1>Vision Hub SMTP Test</h1>
            <p>This is a test email from your Vision Hub system.</p>
            <p>If you received this email, your SMTP configuration is working correctly.</p>
            <p>Configuration used:</p>
            <ul>
              <li>Host: ${host}</li>
              <li>Port: ${port}</li>
              <li>Username: ${username}</li>
              <li>Secure Connection: ${secure ? "Yes" : "No"}</li>
            </ul>
            <p>Thank you for using Vision Hub!</p>
          </body>
        </html>
      `,
      html: true,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Test email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error sending test email:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send test email", 
        details: error.toString() 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
