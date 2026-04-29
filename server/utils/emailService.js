const nodemailer = require('nodemailer');

/**
 * EMAIL SERVICE (CYBER-APPAREL BRANDING)
 * --------------------------------------
 * Handles automated transmissions to users.
 */
const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard for projects, easy to setup with App Passwords
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOrderShippedEmail = async (userEmail, userName, orderId) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: `PROTOCOL_UPDATE: Order #${orderId.slice(-6)} Has Been Shipped`,
        html: `
            <div style="background-color: #0a0a0e; color: #ffffff; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #1e1e2e; border-radius: 20px;">
                <h1 style="color: #4f46e5; text-transform: uppercase; letter-spacing: 5px; font-style: italic;">AI_Apparel_Studio</h1>
                <div style="height: 1px; background-color: #1e1e2e; margin: 20px 0;"></div>
                
                <p style="font-size: 16px; line-height: 1.6;">Greetings, <strong>${userName}</strong>.</p>
                
                <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
                    The neural synthesis of your apparel is complete. Your design has been physicalized and handed over to the logistics mainframe.
                </p>

                <div style="background-color: #11111a; padding: 20px; border-radius: 10px; border-left: 4px solid #4f46e5; margin: 30px 0;">
                    <p style="margin: 0; font-size: 12px; color: #6366f1; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Transmission_ID</p>
                    <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 18px; color: #ffffff;">#${orderId}</p>
                </div>

                <p style="font-size: 14px; color: #4ade80; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                    STATUS: DISPATCHED_FOR_DELIVERY
                </p>

                <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
                    This is an automated system message. Do not reply to this node.<br>
                    Synthesized in 2026 // Neural Fashion Intelligence.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email Transmission Successful: Order ${orderId} -> ${userEmail}`);
    } catch (error) {
        console.error("Email Transmission Failed:", error.message);
        // We don't throw error here to prevent the main order status update from failing 
        // if the email service has a wrong password.
    }
};

module.exports = { sendOrderShippedEmail };
