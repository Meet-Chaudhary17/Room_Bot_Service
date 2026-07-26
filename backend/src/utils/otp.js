import nodemailer from "nodemailer";

export function generateOtp() {
    // Generate exactly 6 random digits
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email, otp) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const brevoKey = process.env.BREVO_API_KEY;

    // Log the generated OTP to the server console first so it is always accessible in logs
    console.log(`🔑 Generated verification OTP for ${email}: ${otp}`);

    if (!brevoKey && (!user || !pass)) {
        console.warn("⚠️ Email credentials (BREVO_API_KEY or SMTP credentials) are missing in the environment. Skipping email dispatch.");
        return true;
    }

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #f1f5f9; border-radius: 16px; max-width: 600px; background-color: #ffffff; color: #1e293b; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">Room-Bot Service</h2>
                <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; font-weight: 600;">Hostel Service Management System</p>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <p style="font-size: 14px; font-weight: 600; color: #334155; margin: 0 0 10px 0;">Hello,</p>
                <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for using Room-Bot Service. To complete your request, please use the following 6-digit OTP code:
                </p>
                <div style="font-size: 32px; font-weight: 800; color: #4f46e5; letter-spacing: 6px; padding: 18px; background-color: #f8fafc; text-align: center; border-radius: 12px; border: 1px dashed #cbd5e1; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #ef4444; font-size: 11px; font-weight: 700; margin: 0 0 10px 0;">
                    ⚠️ This OTP is valid for exactly 5 minutes and can only be used once.
                </p>
                <p style="color: #94a3b8; font-size: 11px; font-weight: 500; margin: 0;">
                    If you did not request this, please ignore this email.
                </p>
            </div>
        </div>
    `;

    // 1. If BREVO_API_KEY is available, use Brevo's HTTP API (bypasses Render's SMTP block)
    if (brevoKey) {
        try {
            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "api-key": brevoKey,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    sender: {
                        name: "Room-Bot Hostel Service",
                        email: user || "roombotservice@gmail.com"
                    },
                    to: [{ email }],
                    subject: "Room-Bot Service - Email Verification OTP",
                    htmlContent: htmlBody
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Brevo API returned status ${response.status}`);
            }

            console.log(`✉️ Verification email sent successfully via Brevo to ${email}`);
            return true;
        } catch (error) {
            console.error("Brevo API send error:", error);
            console.warn(`⚠️ FALLBACK: Could not dispatch email. The verification OTP for ${email} is: ${otp}`);
            return true;
        }
    }

    // 2. Otherwise fall back to standard SMTP (local development)
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use STARTTLS on port 587
            auth: {
                user,
                pass
            },
            family: 4, // Force IPv4 to prevent IPv6 routing timeouts on Render
            connectionTimeout: 4000, // 4 seconds connection timeout
            greetingTimeout: 4000,   // 4 seconds greeting timeout
            socketTimeout: 4000      // 4 seconds socket timeout
        });

        // Verify transporter connection
        await transporter.verify();

        const mailOptions = {
            from: `"Room-Bot Hostel Service" <${user}>`,
            to: email,
            subject: "Room-Bot Service - Email Verification OTP",
            text: `Hello,\n\nYour OTP code for verification is: ${otp}. This code is valid for 5 minutes.\n\nIf you did not request this, please ignore this email.`,
            html: htmlBody
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️ Verification email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error("Nodemailer transporter error:", error);
        console.warn(`⚠️ FALLBACK: Could not dispatch email. The verification OTP for ${email} is: ${otp}`);
        // Return true to avoid failing or hanging the user registration flow
        return true;
    }
}
