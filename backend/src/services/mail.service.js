import Config from '../config/config.js';
import { getMailTransporter } from '../config/mail.js';

export class MailService {
  constructor() {
    this.hasSmtp = Boolean(Config.smtp_host && Config.smtp_user && Config.smtp_pass);
    this.brandName = 'Zayka Eats';
    this.brandColor = '#FF8A26';
    this.supportEmail = Config.smtp_user || 'support@zaykaeats.com';
  }

  /**
   * Helper to format consistent, beautiful Zayka Eats responsive HTML email template
   */
  _buildEmailTemplate({ title, subtitle, contentHtml }) {
    const year = new Date().getFullYear();
    const appUrl = Config.frontend_url || 'http://localhost:5173';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 28px 32px; text-align: center;">
                    <table align="center" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #FF8A26; color: #ffffff; font-size: 24px; font-weight: 900; border-radius: 12px; text-align: center; box-shadow: 0 4px 10px rgba(255,138,38,0.4);">
                            Z
                          </div>
                        </td>
                        <td style="vertical-align: middle; padding-left: 12px; text-align: left;">
                          <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; display: block;">
                            Zayka<span style="color: #FF8A26;">Eats</span>
                          </span>
                          <span style="font-size: 10px; font-weight: 700; color: #a1a1aa; letter-spacing: 1.5px; text-transform: uppercase; display: block;">
                            Fresh &bull; Hot &bull; Fast Delivery
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 36px 32px 28px 32px;">
                    <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.3px;">
                      ${title}
                    </h1>
                    ${
                      subtitle
                        ? `<p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; text-align: center;">${subtitle}</p>`
                        : '<div style="margin-bottom: 24px;"></div>'
                    }

                    ${contentHtml}

                    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: left;">
                      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
                        Warm regards,<br>
                        <strong>The Zayka Eats Team 🍽️</strong>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Brand Footer -->
                <tr>
                  <td style="background-color: #fafafa; border-top: 1px solid #f1f5f9; padding: 24px 32px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                      Need help? Reach out anytime at <a href="mailto:${this.supportEmail}" style="color: #FF8A26; font-weight: 600; text-decoration: none;">${this.supportEmail}</a>
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 11px; color: #94a3b8;">
                      Flavors of India, delivered fresh to your doorsteps.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                      &copy; ${year} <a href="${appUrl}" style="color: #94a3b8; text-decoration: none;">Zayka Eats</a> Technologies Pvt Ltd. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Log simulated email to console in development environment
   */
  logSimulatedMail({ to, subject, text }) {
    console.log('\n' + '═'.repeat(65));
    console.log(` 📧 [ZAYKA EATS - SIMULATED EMAIL DISPATCH]`);
    console.log('═'.repeat(65));
    console.log(` To      : ${to}`);
    console.log(` Subject : ${subject}`);
    console.log('─'.repeat(65));
    console.log(text);
    console.log('═'.repeat(65) + '\n');
  }

  /**
   * Base transport method with production resilience & dev fallback
   */
  async sendMail({ to, subject, text, html }) {
    const transporter = getMailTransporter();

    if (transporter && this.hasSmtp) {
      try {
        const info = await transporter.sendMail({
          from: `"Zayka Eats" <${Config.smtp_user}>`,
          to,
          subject,
          text,
          html: html || `<p>${text}</p>`,
        });
        return { success: true, messageId: info.messageId, simulated: false };
      } catch (error) {
        console.error(`[Zayka Eats MailService Error] Failed to send email to ${to}:`, error.message);
        if (Config.env === 'production') {
          throw error;
        }
        // In development/test, log simulated email rather than crashing the flow
        this.logSimulatedMail({ to, subject, text });
        return { success: true, simulated: true, error: error.message };
      }
    }

    // Fallback development mode: Log email content to console so admin/dev can click links / read OTP
    this.logSimulatedMail({ to, subject, text });
    return { success: true, simulated: true };
  }

  /**
   * 1. Register OTP Email
   */
  SendRegisterMail(email, otp, fullName = 'Foodie') {
    const title = 'Verify Your Zayka Eats Account';
    const subtitle = 'One last step before you start enjoying delicious meals';
    const text = `Hello ${fullName},\n\nWelcome to Zayka Eats! 🍽️\n\nYour account verification code is: ${otp}\n\nThis OTP will expire in 10 minutes.\nIf you did not request this code, you can safely ignore this email.\n\nHappy Dining,\nThe Zayka Eats Team`;

    const contentHtml = `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Hello <strong>${fullName}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
        Thank you for joining <strong>Zayka Eats</strong>! Please enter the 6-digit verification code below to verify your email address and activate your account:
      </p>

      <div style="margin: 28px 0; text-align: center;">
        <div style="display: inline-block; background-color: #fff7ed; border: 2px dashed #FF8A26; border-radius: 16px; padding: 16px 36px;">
          <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #FF8A26; font-family: monospace;">
            ${otp}
          </span>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8;">
          ⏳ Valid for <strong>10 minutes</strong> only
        </p>
      </div>

      <div style="background-color: #f8fafc; border-radius: 12px; padding: 14px 18px; margin: 24px 0; border: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
          <strong>Security Tip:</strong> Never share this OTP with anyone, including Zayka Eats support representatives or delivery partners.
        </p>
      </div>
    `;

    const html = this._buildEmailTemplate({ title, subtitle, contentHtml });
    return this.sendMail({
      to: email,
      subject: `[${otp}] Verify Your Zayka Eats Account`,
      text,
      html,
    });
  }

  /**
   * 2. Resend Register OTP Email
   */
  SendAgainRegisterMail(email, otp, fullName) {
    return this.SendRegisterMail(email, otp, fullName);
  }

  /**
   * 3. Password Reset Email
   */
  SendPasswordResetMail(email, resetUrl, fullName = 'Foodie') {
    const title = 'Reset Your Password';
    const subtitle = 'Follow the link below to securely set a new password';
    const text = `Hello ${fullName},\n\nWe received a request to reset your Zayka Eats account password.\n\nPlease click the link below to set a new password:\n${resetUrl}\n\nThis link is valid for 1 hour.\nIf you did not make this request, you can safely ignore this email; your account remains secure.\n\nWarm regards,\nThe Zayka Eats Team`;

    const contentHtml = `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Hello <strong>${fullName}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
        We received a request to reset the password for your Zayka Eats account. Click the button below to choose a new password:
      </p>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #FF8A26; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(255,138,38,0.35);">
          Reset My Password
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 20px 0 6px 0;">
        If the button above does not work, copy and paste this link into your web browser:
      </p>
      <p style="font-size: 11px; color: #FF8A26; word-break: break-all; margin: 0 0 24px 0; background: #fff7ed; padding: 8px 12px; border-radius: 8px; border: 1px solid #fed7aa;">
        ${resetUrl}
      </p>

      <div style="background-color: #f8fafc; border-radius: 12px; padding: 14px 18px; border: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
          ⚠️ This password reset link expires in <strong>1 hour</strong>. If you did not request this, please disregard this email.
        </p>
      </div>
    `;

    const html = this._buildEmailTemplate({ title, subtitle, contentHtml });
    return this.sendMail({
      to: email,
      subject: 'Reset Your Zayka Eats Password',
      text,
      html,
    });
  }

  /**
   * 4. Partner / Restaurant Admin Invitation
   */
  SendStoreAdminInvitation(email, invitationLink, storeDetails = {}) {
    const outletName = storeDetails.storeName || storeDetails.restaurantName || 'Restaurant Outlet';
    const title = 'Join Zayka Eats Partner Network';
    const subtitle = `Invitation to manage ${outletName}`;
    const text = `Hello,\n\nYou have been invited by the Zayka Eats Administrator to manage ${outletName} on the Zayka Eats Restaurant Partner Portal.\n\nPlease complete your partner onboarding using the link below:\n${invitationLink}\n\nThis invitation is valid for 24 hours.\n\nWelcome aboard,\nThe Zayka Eats Team`;

    const contentHtml = `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Hello Restaurant Partner,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
        You have been officially invited to register and manage <strong>${outletName}</strong> on the Zayka Eats Food Delivery platform.
      </p>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${invitationLink}" style="display: inline-block; background-color: #FF8A26; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(255,138,38,0.35);">
          Activate Partner Account
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 16px 0 4px 0;">
        Or paste this link into your browser:
      </p>
      <p style="font-size: 11px; color: #FF8A26; word-break: break-all; margin: 0 0 20px 0; background: #fff7ed; padding: 8px 12px; border-radius: 8px;">
        ${invitationLink}
      </p>
    `;

    const html = this._buildEmailTemplate({ title, subtitle, contentHtml });
    return this.sendMail({
      to: email,
      subject: `Partner Invitation: Manage ${outletName} on Zayka Eats`,
      text,
      html,
    });
  }

  /**
   * 5. Partner / Rider Account Approval Notice
   */
  SendAccountApprovedMail(email, fullName, role = 'Restaurant Partner', outletName) {
    const roleFormatted = role.replace(/_/g, ' ').toUpperCase();
    const outletInfo = outletName ? ` for <strong>${outletName}</strong>` : '';
    const title = 'Account Verified & Approved! 🎉';
    const subtitle = `Your Zayka Eats ${roleFormatted} profile is now live`;
    const loginUrl = `${Config.frontend_url || 'http://localhost:5173'}/login`;

    const text = `Hello ${fullName},\n\nGreat news! Your ${role} account${outletName ? ` for ${outletName}` : ''} has been reviewed and APPROVED by the Zayka Eats Administration team.\n\nYou can now log in to your portal and start receiving orders:\n${loginUrl}\n\nWelcome to the Zayka Eats Family!\nWarm regards,\nThe Zayka Eats Team`;

    const contentHtml = `
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="display: inline-block; background-color: #ecfdf5; border: 1px solid #10b981; color: #059669; font-weight: 800; font-size: 13px; padding: 6px 16px; border-radius: 20px;">
          ✓ VERIFICATION APPROVED
        </span>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Hello <strong>${fullName}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
        Congratulations! Your <strong>${roleFormatted}</strong> account${outletInfo} has been successfully verified and approved by the Zayka Eats compliance team.
      </p>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${loginUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(16,185,129,0.35);">
          Sign In to Your Dashboard
        </a>
      </div>
    `;

    const html = this._buildEmailTemplate({ title, subtitle, contentHtml });
    return this.sendMail({
      to: email,
      subject: `Approved! Welcome to the Zayka Eats Partner Network 🚀`,
      text,
      html,
    });
  }

  /**
   * 6. Staff / Team Credentials Email
   */
  SendStaffCredentialsMail(email, fullName, role, storeName, temporaryPassword, loginUrl) {
    const title = `Welcome to ${storeName}`;
    const subtitle = `Your Zayka Eats staff account has been set up`;
    const targetLogin = loginUrl || `${Config.frontend_url || 'http://localhost:5173'}/login`;

    const text = `Hello ${fullName},\n\nYou have been registered as a ${role} at ${storeName} on Zayka Eats.\n\nYour login credentials are:\nUsername / Email: ${email}\nTemporary Password: ${temporaryPassword}\nLogin Portal: ${targetLogin}\n\nPlease update your password after your first login.\n\nThank you,\nThe Zayka Eats Team`;

    const contentHtml = `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Hello <strong>${fullName}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
        You have been onboarded as <strong>${role}</strong> at <strong>${storeName}</strong> on the Zayka Eats platform.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155;"><strong>Login Email:</strong> ${email}</p>
        <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 6px; font-weight: bold; color: #0f172a;">${temporaryPassword}</code></p>
      </div>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${targetLogin}" style="display: inline-block; background-color: #FF8A26; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px;">
          Log In to Portal
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
        For your security, please change your password immediately upon your first sign in.
      </p>
    `;

    const html = this._buildEmailTemplate({ title, subtitle, contentHtml });
    return this.sendMail({
      to: email,
      subject: `Your Staff Access Credentials - ${storeName} (Zayka Eats)`,
      text,
      html,
    });
  }

  /**
   * 7. Order Confirmation Email
   */
  SendOrderConfirmationMail(email, fullName, order = {}) {
    const orderId = order.orderNumber || order._id?.slice(-8)?.toUpperCase() || 'NEW';
    const restaurantName = order.restaurant?.name || 'Zayka Partner Restaurant';
    const total = order.totalAmount || 0;
    const title = 'Order Placed Successfully! 🍕';
    const subtitle = `Order #${orderId} from ${restaurantName}`;
    const orderUrl = `${Config.frontend_url || 'http://localhost:5173'}/orders/${order._id || ''}`;

    const itemsHtml = (order.items || [])
      .map(
        (i) => `
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9;">
            ${i.quantity}x ${i.name}
          </td>
          <td align="right" style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
            ₹${Number(i.price) * Number(i.quantity)}
          </td>
        </tr>`,
      )
      .join('');

    const text = `Hello ${fullName},\n\nThank you for ordering with Zayka Eats!\nYour order #${orderId} from ${restaurantName} has been received and is being prepared.\nTotal Amount: ₹${total}\nTrack your order: ${orderUrl}\n\nHappy Dining,\nThe Zayka Eats Team`;

    const contentHtml = `
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Hello <strong>${fullName}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
        Your craving is on its way! <strong>${restaurantName}</strong> has received your order and the kitchen has begun preparation.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0;">
        <h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
          Order Summary
        </h4>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemsHtml}
          <tr>
            <td style="padding-top: 12px; font-size: 15px; font-weight: 800; color: #0f172a;">Total Paid</td>
            <td align="right" style="padding-top: 12px; font-size: 16px; font-weight: 900; color: #FF8A26;">₹${total}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${orderUrl}" style="display: inline-block; background-color: #FF8A26; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(255,138,38,0.35);">
          Track Live Delivery
        </a>
      </div>
    `;

    const html = this._buildEmailTemplate({ title, subtitle, contentHtml });
    return this.sendMail({
      to: email,
      subject: `Order Confirmed! #${orderId} from ${restaurantName} - Zayka Eats`,
      text,
      html,
    });
  }
}

export default new MailService();
