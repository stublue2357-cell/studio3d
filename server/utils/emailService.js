const nodemailer = require('nodemailer');

/**
 * 📧 STUDIO 3D - PREMIUM EMAIL SERVICE
 * ------------------------------------
 * High-end cyber-branded templates for FYP Presentation.
 */

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const APP_NAME = "STUDIO 3D";
const BRAND_COLOR = "#6366f1";
const BG_DARK = "#050508";
const GLASS_BG = "#0f0f16";

// --- BASE WRAPPER FOR ALL EMAILS ---
const emailWrapper = (content) => `
    <div style="background-color: ${BG_DARK}; color: #ffffff; padding: 60px 20px; font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: ${GLASS_BG}; border: 1px solid rgba(99, 102, 241, 0.1); border-radius: 40px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.8);">
            
            <!-- Header -->
            <div style="padding: 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.03);">
                <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px; font-style: italic; color: #ffffff;">
                    STUDIO <span style="color: ${BRAND_COLOR};">3D</span>
                </h1>
                <p style="margin: 10px 0 0 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 5px; color: rgba(255,255,255,0.3);">
                    Neural Fashion Mainframe
                </p>
            </div>

            <!-- Content Area -->
            <div style="padding: 50px 40px;">
                ${content}
            </div>

            <!-- Footer -->
            <div style="padding: 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.03); background-color: rgba(255,255,255,0.01);">
                <p style="margin: 0; font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 2px;">
                    © 2026 STUDIO 3D LABS // FINAL YEAR PROJECT DEPLOYMENT
                </p>
                <div style="margin-top: 20px;">
                    <a href="#" style="color: ${BRAND_COLOR}; text-decoration: none; font-size: 10px; font-weight: 700; margin: 0 10px;">DASHBOARD</a>
                    <a href="#" style="color: ${BRAND_COLOR}; text-decoration: none; font-size: 10px; font-weight: 700; margin: 0 10px;">VAULT</a>
                    <a href="#" style="color: ${BRAND_COLOR}; text-decoration: none; font-size: 10px; font-weight: 700; margin: 0 10px;">SUPPORT</a>
                </div>
            </div>
        </div>
    </div>
`;

const sendOrderStatusUpdateEmail = async (userEmail, userName, orderId, newStatus, totalAmount) => {
    const statusMeta = {
        'Approved': { color: '#10b981', label: 'SYNTHESIS_AUTHORIZED' },
        'Rejected': { color: '#ef4444', label: 'TRANSMISSION_TERMINATED' },
        'Shipped': { color: '#6366f1', label: 'DISPATCH_IN_PROGRESS' },
        'Delivered': { color: '#0ea5e9', label: 'NODE_DELIVERY_CONFIRMED' }
    };
    const meta = statusMeta[newStatus] || { color: BRAND_COLOR, label: newStatus.toUpperCase() };

    const content = `
        <p style="margin-bottom: 30px; font-size: 16px; color: rgba(255,255,255,0.6);">Greetings, <strong style="color: #ffffff;">${userName}</strong>.</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 40px;">Your apparel design protocol has been updated by the central authority.</p>
        
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; padding: 35px; margin-bottom: 40px;">
            <div style="margin-bottom: 25px;">
                <span style="font-size: 9px; font-weight: 900; color: ${BRAND_COLOR}; text-transform: uppercase; letter-spacing: 3px;">Status Node</span>
                <h2 style="margin: 5px 0 0 0; font-size: 24px; font-weight: 900; color: ${meta.color}; font-style: italic;">${meta.label}</h2>
            </div>
            
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <span style="font-size: 9px; font-weight: 900; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 3px;">Transmission ID</span>
                    <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 16px; color: #ffffff;">#${orderId.slice(-8)}</p>
                </div>
                <div style="flex: 1; text-align: right;">
                    <span style="font-size: 9px; font-weight: 900; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 3px;">Net Value</span>
                    <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 800; color: #ffffff;">$${totalAmount}.00</p>
                </div>
            </div>
        </div>

        <a href="${process.env.CLIENT_URL || '#'}/dashboard" style="display: block; text-align: center; background: ${BRAND_COLOR}; color: #ffffff; padding: 22px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);">
            Access Dashboard Node
        </a>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: userEmail,
            subject: `[PROTOCOL UPDATE] Order #${orderId.slice(-6)} // ${newStatus.toUpperCase()}`,
            html: emailWrapper(content)
        });
    } catch (e) { console.error("Email Error:", e); }
};

const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
    const content = `
        <p style="margin-bottom: 30px; font-size: 16px; color: rgba(255,255,255,0.6);">Attention, <strong style="color: #ffffff;">${userName}</strong>.</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 40px;">A request to reset your access cipher has been detected. For your security, this protocol will expire in 10 minutes.</p>
        
        <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 30px; padding: 35px; margin-bottom: 40px; text-align: center;">
            <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 900; color: #ef4444; font-style: italic; text-transform: uppercase;">Security Authorization</h2>
            <p style="margin: 0; font-size: 11px; color: rgba(239, 68, 68, 0.6); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Confirm Identity to Reconfigure Cipher</p>
        </div>

        <a href="${resetUrl}" style="display: block; text-align: center; background: #ffffff; color: #000000; padding: 22px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; box-shadow: 0 20px 40px rgba(255, 255, 255, 0.1);">
            Reconfigure Access
        </a>

        <p style="margin-top: 40px; font-size: 10px; color: rgba(255,255,255,0.2); text-align: center;">
            If you did not authorize this transmission, please ignore this node immediately.
        </p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: userEmail,
            subject: `[SECURITY] Password Reconfiguration Request`,
            html: emailWrapper(content)
        });
    } catch (e) { console.error("Email Error:", e); }
};

const sendLoginAlertEmail = async (userEmail, userName, deviceData) => {
    const content = `
        <p style="margin-bottom: 30px; font-size: 16px; color: rgba(255,255,255,0.6);">Identity Notice, <strong style="color: #ffffff;">${userName}</strong>.</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 40px;">A successful handshake with your identity node has been established from a new location/device.</p>
        
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; padding: 35px; margin-bottom: 40px;">
            <div style="margin-bottom: 20px;">
                <span style="font-size: 9px; font-weight: 900; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 3px;">Access Metadata</span>
                <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 11px; color: #ffffff; line-height: 1.8;">
                    NODE_TIME: ${new Date().toLocaleString().toUpperCase()}<br>
                    DEVICE: ${deviceData.toUpperCase()}
                </p>
            </div>
            <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 20px 0;"></div>
            <p style="margin: 0; font-size: 10px; color: #ef4444; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">If this was not you, trigger a security lock immediately.</p>
        </div>

        <a href="${process.env.CLIENT_URL || '#'}/reset-password" style="display: block; text-align: center; border: 2px solid #ef4444; color: #ef4444; padding: 20px; border-radius: 20px; text-decoration: none; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px;">
            Secure My Node
        </a>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: userEmail,
            subject: `[SECURITY] New Login Detected`,
            html: emailWrapper(content)
        });
    } catch (e) { console.error("Email Error:", e); }
};

const sendAnnouncementEmail = async (userEmail, userName, title, message) => {
    const content = `
        <div style="text-align: center; margin-bottom: 40px;">
            <span style="display: inline-block; padding: 8px 15px; background: rgba(99, 102, 241, 0.1); color: ${BRAND_COLOR}; border-radius: 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 20px;">
                Broadcast
            </span>
            <h2 style="margin: 0; font-size: 28px; font-weight: 900; color: #ffffff; italic; line-height: 1.2;">${title.toUpperCase()}</h2>
        </div>

        <div style="font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.8; margin-bottom: 40px;">
            <p>Greetings Node <strong>${userName}</strong>,</p>
            <p>${message}</p>
        </div>

        <div style="padding: 30px; border-radius: 30px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent); border: 1px solid rgba(99, 102, 241, 0.1); text-align: center;">
            <p style="margin: 0; font-size: 12px; font-weight: 700; color: #ffffff;">The future of neural fashion is evolving.</p>
            <p style="margin: 10px 0 0 0; font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px;">Stay Synchronized.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: userEmail,
            subject: `[BROADCAST] ${title.toUpperCase()}`,
            html: emailWrapper(content)
        });
    } catch (e) { console.error("Email Error:", e); }
};

module.exports = { 
    sendOrderStatusUpdateEmail, 
    sendPasswordResetEmail, 
    sendLoginAlertEmail, 
    sendAnnouncementEmail 
};
