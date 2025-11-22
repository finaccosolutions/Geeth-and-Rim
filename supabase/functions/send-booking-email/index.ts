import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailPayload {
  to: string[];
  subject: string;
  html: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: EmailPayload = await req.json();

    const emailData = {
      personalizations: payload.to.map(email => ({ to: [{ email }] })),
      from: {
        email: payload.from_email,
        name: payload.from_name,
      },
      subject: payload.subject,
      content: [{
        type: "text/html",
        value: payload.html,
      }],
    };

    console.log('Email notification prepared:', {
      to: payload.to,
      from: payload.from_email,
      subject: payload.subject,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email notification logged (email functionality placeholder)',
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});