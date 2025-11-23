import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey"
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

async function sendEmail(to: string, subject: string, html: string, smtpConfig: {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}) {
  try {
    if (!smtpConfig.smtp_host || !smtpConfig.smtp_port || !smtpConfig.smtp_user || !smtpConfig.smtp_password || !smtpConfig.from_email) {
      console.error('Missing SMTP configuration in database.');
      return {
        success: false,
        error: 'SMTP configuration missing. Please configure SMTP settings in admin panel.'
      };
    }

    const nodemailer = await import('npm:nodemailer@6.9.7');

    const transporter = nodemailer.default.createTransport({
      host: smtpConfig.smtp_host,
      port: parseInt(String(smtpConfig.smtp_port)),
      secure: smtpConfig.smtp_port == 465,
      auth: {
        user: smtpConfig.smtp_user,
        pass: smtpConfig.smtp_password
      }
    });

    const mailOptions = {
      from: `${smtpConfig.from_name || 'Geetandrim Salon'} <${smtpConfig.from_email}>`,
      to: to,
      subject: subject,
      html: html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);

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
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const payload: EmailPayload = await req.json();

    if (!payload.to || !payload.subject || !payload.html) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: to, subject, or html'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const smtpConfig = {
      smtp_host: payload.smtp_host,
      smtp_port: payload.smtp_port,
      smtp_user: payload.smtp_user,
      smtp_password: payload.smtp_password,
      from_email: payload.from_email,
      from_name: payload.from_name
    };

    const result = await sendEmail(payload.to.join(', '), payload.subject, payload.html, smtpConfig);

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({
        error: result.error || 'Failed to send email',
        warning: 'Email notification failed. Please check SMTP configuration in admin panel.'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Error in send-booking-email function:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: String(error)
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});