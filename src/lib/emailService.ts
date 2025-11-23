import { supabase } from './supabase';

export interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  bookingDate: string;
  startTime: string;
  duration: number;
  price: number;
  notes?: string;
  status: string;
}

export const sendBookingEmail = async (bookingData: BookingEmailData): Promise<boolean> => {
  try {
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('*')
      .maybeSingle();

    if (!emailSettings) {
      console.warn('Email settings not configured - emails will not be sent');
      return false;
    }

    console.log('Sending booking emails with settings:', {
      smtp_host: emailSettings.smtp_host,
      smtp_port: emailSettings.smtp_port,
      from_email: emailSettings.from_email,
      admin_emails: emailSettings.admin_emails
    });

    const formattedDate = new Date(bookingData.bookingDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #264025; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #264025 0%, #7B4B36 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #AD6B4B; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #DDCBB7; }
            .detail-label { font-weight: bold; color: #264025; }
            .detail-value { color: #82896E; }
            .footer { text-align: center; margin-top: 30px; color: #82896E; font-size: 14px; }
            .status { display: inline-block; padding: 8px 16px; background: #FFC107; color: #000; border-radius: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Geetandrim Salon</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Booking Confirmation</p>
            </div>
            <div class="content">
              <h2 style="color: #264025; margin-top: 0;">Thank you for your booking, ${bookingData.customerName}!</h2>
              <p>Your appointment has been <span class="status" style="background: #4CAF50;">${bookingData.status.toUpperCase()}</span></p>
              <p>We look forward to seeing you at your scheduled appointment!</p>

              <div class="details">
                <h3 style="margin-top: 0; color: #AD6B4B;">Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${bookingData.serviceName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${bookingData.startTime}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${bookingData.duration} minutes</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Price:</span>
                  <span class="detail-value">₹${bookingData.price.toFixed(2)}</span>
                </div>
                ${bookingData.notes ? `
                <div class="detail-row">
                  <span class="detail-label">Your Notes:</span>
                  <span class="detail-value">${bookingData.notes}</span>
                </div>
                ` : ''}
              </div>

              <p style="margin-top: 20px;"><strong>What's Next?</strong></p>
              <ul style="color: #82896E;">
                <li>Your appointment is confirmed and reserved</li>
                <li>Please arrive 10 minutes before your appointment time</li>
                <li>Bring this confirmation email with you</li>
              </ul>

              <div style="background: #DDCBB7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0;"><strong>Need to make changes?</strong></p>
                <p style="margin: 5px 0 0 0;">Contact us at <a href="tel:+919876543210" style="color: #AD6B4B;">+91 98765 43210</a> or email <a href="mailto:booking@geetandrim.com" style="color: #AD6B4B;">booking@geetandrim.com</a></p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Geetandrim Salon. All rights reserved.</p>
              <p>123 Beauty Street, Salon District, City - 123456</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #264025; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #AD6B4B 0%, #7B4B36 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #264025; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #DDCBB7; }
            .detail-label { font-weight: bold; color: #264025; }
            .detail-value { color: #82896E; }
            .alert { background: #FFC107; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Booking Alert</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Geetandrim Salon Admin</p>
            </div>
            <div class="content">
              <div class="alert" style="background: #4CAF50; color: white;">
                <strong>New Confirmed Booking:</strong> A new booking has been automatically confirmed and added to your schedule.
              </div>

              <div class="details">
                <h3 style="margin-top: 0; color: #AD6B4B;">Customer Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${bookingData.customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value"><a href="mailto:${bookingData.customerEmail}" style="color: #AD6B4B;">${bookingData.customerEmail}</a></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value"><a href="tel:${bookingData.customerPhone}" style="color: #AD6B4B;">${bookingData.customerPhone}</a></span>
                </div>
              </div>

              <div class="details">
                <h3 style="margin-top: 0; color: #AD6B4B;">Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${bookingData.serviceName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${bookingData.startTime}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${bookingData.duration} minutes</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Price:</span>
                  <span class="detail-value">₹${bookingData.price.toFixed(2)}</span>
                </div>
                ${bookingData.notes ? `
                <div class="detail-row">
                  <span class="detail-label">Customer Notes:</span>
                  <span class="detail-value">${bookingData.notes}</span>
                </div>
                ` : ''}
              </div>

              <p style="margin-top: 20px;"><strong>Next Steps:</strong></p>
              <ol style="color: #82896E;">
                <li>The booking has been automatically confirmed</li>
                <li>Log in to the admin panel to view details</li>
                <li>Prepare for the appointment</li>
                <li>Customer has been notified via email</li>
              </ol>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${window.location.origin}/admin" style="display: inline-block; background: #264025; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Go to Admin Panel</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const emailPayload = {
      to: [bookingData.customerEmail],
      subject: `Booking Confirmation - ${bookingData.serviceName}`,
      html: customerEmailHtml,
      smtp_host: emailSettings.smtp_host,
      smtp_port: emailSettings.smtp_port,
      smtp_user: emailSettings.smtp_user,
      smtp_password: emailSettings.smtp_password,
      from_email: emailSettings.from_email,
      from_name: emailSettings.from_name,
    };

    const adminEmailPayload = {
      to: emailSettings.admin_emails,
      subject: `New Booking Alert - ${bookingData.serviceName}`,
      html: adminEmailHtml,
      smtp_host: emailSettings.smtp_host,
      smtp_port: emailSettings.smtp_port,
      smtp_user: emailSettings.smtp_user,
      smtp_password: emailSettings.smtp_password,
      from_email: emailSettings.from_email,
      from_name: emailSettings.from_name,
    };

    console.log('Attempting to send emails to:', {
      customer: emailPayload.to,
      admin: adminEmailPayload.to
    });

    const [customerEmailResponse, adminEmailResponse] = await Promise.all([
      fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(emailPayload),
      }).catch(err => {
        console.error('Customer email fetch error:', err);
        return null;
      }),
      fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(adminEmailPayload),
      }).catch(err => {
        console.error('Admin email fetch error:', err);
        return null;
      }),
    ]);

    if (!customerEmailResponse || !adminEmailResponse) {
      console.error('Email service not reachable');
      return false;
    }

    const customerResult = await customerEmailResponse.json().catch(() => ({ error: 'Invalid response' }));
    const adminResult = await adminEmailResponse.json().catch(() => ({ error: 'Invalid response' }));

    console.log('Customer email response:', {
      status: customerEmailResponse.status,
      ok: customerEmailResponse.ok,
      result: customerResult
    });
    console.log('Admin email response:', {
      status: adminEmailResponse.status,
      ok: adminEmailResponse.ok,
      result: adminResult
    });

    if (customerEmailResponse.ok && adminEmailResponse.ok) {
      console.log('Booking emails sent successfully to customer and admin');
      return true;
    } else {
      console.error('Failed to send booking emails:', {
        customerStatus: customerEmailResponse.status,
        adminStatus: adminEmailResponse.status,
        customerError: customerResult,
        adminError: adminResult
      });
      return false;
    }
  } catch (error) {
    console.error('Error sending booking email:', error);
    return false;
  }
};
