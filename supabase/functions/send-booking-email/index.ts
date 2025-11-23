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

async function sendEmail(payload: EmailPayload) {
  try {
    if (!payload.smtp_host || !payload.smtp_port || !payload.smtp_user || !payload.smtp_password || !payload.from_email) {
      console.error('Missing SMTP configuration');
      return {
        success: false,
        error: 'SMTP configuration missing. Please configure SMTP settings in admin panel.'
      };
    }

    const nodemailer = await import('npm:nodemailer@6.9.7');

    const transporter = nodemailer.default.createTransport({
      host: payload.smtp_host,
      port: parseInt(String(payload.smtp_port)),
      secure: payload.smtp_port == 465,
      auth: {
        user: payload.smtp_user,
        pass: payload.smtp_password
      }
    });

    const mailOptions = {
      from: `${payload.from_name || 'Geetandrim Salon'} <${payload.from_email}>`,
      to: payload.to.join(', '),
      subject: payload.subject,
      html: payload.html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', payload.to);

    return {
      success: true
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: String(error)
    };
  }
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

    if (!payload.to || !payload.subject || !payload.html) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: to, subject, or html'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const result = await sendEmail(payload);

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sent successfully'
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Failed to send email',
          warning: 'Email notification failed. Please check SMTP configuration in admin panel.'
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
  } catch (error) {
    console.error('Error in send-booking-email function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: String(error)
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