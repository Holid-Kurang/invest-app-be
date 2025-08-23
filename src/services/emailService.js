const nodemailer = require('nodemailer');
const { google } = require('googleapis');

class EmailService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URL
        );

        this.oauth2Client.setCredentials({
            refresh_token: process.env.GMAIL_REFRESH_TOKEN
        });
    }

    async createTransporter(userEmail) {
        try {
            const accessToken = await this.oauth2Client.getAccessToken();

            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: userEmail,
                    clientId: process.env.GMAIL_CLIENT_ID,
                    clientSecret: process.env.GMAIL_CLIENT_SECRET,
                    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                    accessToken: accessToken.token
                }
            });
        } catch (error) {
            console.error('Error creating OAuth2 transporter:', error);
            throw error;
        }
    }

    async sendInvestNotificationToAdmin(investData, userEmail, fileData = null) {
        try {
            const transporter = await this.createTransporter(userEmail);
            
            // Same email content as before
            const emailContent = {
                from: `"Investment App" <${userEmail}>`,
                to: process.env.ADMIN_EMAIL,
                replyTo: userEmail,
                subject: `🔔 New Investment from ${userEmail} - ID: ${investData.id_invest}`,
                // ... rest of email content
            };

            if (fileData && fileData.buffer) {
                emailContent.attachments = [{
                    filename: fileData.originalname,
                    content: fileData.buffer,
                    contentType: fileData.mimetype
                }];
            }

            await transporter.sendMail(emailContent);
            
            return {
                success: true,
                message: 'Admin notification email sent successfully'
            };

        } catch (error) {
            console.error('Error sending OAuth2 email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new EmailService();