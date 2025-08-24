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

    async createTransporter() {
        try {
            const accessToken = await this.oauth2Client.getAccessToken();

            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.GMAIL_USER,
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

    async sendTransactionNotificationToAdmin(id, transactionData, userEmail, type, fileData = null) {
        try {
            const transporter = await this.createTransporter(userEmail);
            
            // Same email content as before
            const emailContent = {
                from: `"Investment App" <${userEmail}>`,
                to: process.env.ADMIN_EMAIL,
                replyTo: userEmail,
                subject: `🔔 New Transaction from ${userEmail} - ID: ${id}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">🔔 New Transaction Notification</h2>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #495057; margin-top: 0;">Transaction Details:</h3>
                            <ul style="line-height: 1.6;">
                                <li><strong>Transaction ID:</strong> ${id}</li>
                                <li><strong>User Email:</strong> ${userEmail}</li>
                                <li><strong>Amount:</strong> Rp.${transactionData.amount || 'N/A'}</li>
                                <li><strong>Transaction Type:</strong> ${type || 'N/A'}</li>
                                <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
                            </ul>
                        </div>

                        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
                            <p style="margin: 0; color: #1976d2;">
                                <strong>Action Required:</strong> Please review and process this new transaction request.
                            </p>
                        </div>

                        <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
                            This is an automated notification from the Investment App system.
                        </p>
                    </div>
                `
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