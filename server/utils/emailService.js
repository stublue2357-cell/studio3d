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

const sendOrderStatusUpdateEmail = async (userEmail, userName, orderId, newStatus, totalAmount) => {
    const statusColors = {
        'Approved': '#10b981',
        'Rejected': '#ef4444',
        'Shipped': '#6366f1',
        'Delivered': '#0ea5e9'
    };
    const statusColor = statusColors[newStatus] || '#ffffff';

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: `PROTOCOL_UPDATE: Order #${orderId.slice(-6)} Status: ${newStatus.toUpperCase()}`,
        html: `
            <div style="background-color: #0a0a0e; color: #ffffff; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #1e1e2e; border-radius: 20px;">
                <h1 style="color: #4f46e5; text-transform: uppercase; letter-spacing: 5px; font-style: italic;">AI_Apparel_Studio</h1>
                <div style="height: 1px; background-color: #1e1e2e; margin: 20px 0;"></div>
                
                <p style="font-size: 16px; line-height: 1.6;">Greetings, <strong>${userName}</strong>.</p>
                
                <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
                    There has been a status change in the neural mainframe regarding your apparel order.
                </p>

                <div style="background-color: #11111a; padding: 20px; border-radius: 10px; border-left: 4px solid ${statusColor}; margin: 30px 0;">
                    <p style="margin: 0; font-size: 12px; color: #6366f1; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Transmission_ID</p>
                    <p style="margin: 5px 0 10px 0; font-family: monospace; font-size: 18px; color: #ffffff;">#${orderId}</p>
                    
                    <p style="margin: 0; font-size: 12px; color: #6366f1; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">New_Status</p>
                    <p style="margin: 5px 0 10px 0; font-size: 16px; color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${newStatus}</p>

                    <p style="margin: 0; font-size: 12px; color: #6366f1; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Total_Value</p>
                    <p style="margin: 5px 0 0 0; font-size: 16px; color: #ffffff;">$${totalAmount}.00</p>
                </div>

                <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
                    This is an automated system message. Access your User Node to see full details.<br>
                    Synthesized in 2026 // Neural Fashion Intelligence.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Status Email Sent: Order ${orderId} (${newStatus}) -> ${userEmail}`);
    } catch (error) {
        console.error("Status Email Failed:", error.message);
    }
};

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

const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: `PROTOCOL_RECOVERY: Password Reset Request`,
        html: `
            <div style="background-color: #0a0a0e; color: #ffffff; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #1e1e2e; border-radius: 20px;">
                <h1 style="color: #4f46e5; text-transform: uppercase; letter-spacing: 5px; font-style: italic;">AI_Apparel_Studio</h1>
                <div style="height: 1px; background-color: #1e1e2e; margin: 20px 0;"></div>
                
                <p style="font-size: 16px; line-height: 1.6;">Greetings, <strong>${userName}</strong>.</p>
                
                <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
                    A request to reset your access cipher has been detected. If this was not you, please secure your node immediately.
                </p>

                <div style="margin: 40px 0; text-align: center;">
                    <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Authorize Reset</a>
                </div>

                <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
                    This link will expire in 10 minutes. If the button doesn't work, copy-paste this URL:<br>
                    <span style="color: #6366f1;">${resetUrl}</span>
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reset Email Sent to: ${userEmail}`);
    } catch (error) {
        console.error("Reset Email Failed:", error.message);
    }
};

module.exports = { sendOrderShippedEmail, sendOrderStatusUpdateEmail, sendPasswordResetEmail };
