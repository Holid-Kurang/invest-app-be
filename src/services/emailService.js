const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async sendTransactionNotificationToAdmin(id, transactionData, userEmail, type, fileData = null) {
        try {
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

            await this.transporter.sendMail(emailContent);

            return {
                success: true,
                message: 'Admin notification email sent successfully'
            };

        } catch (error) {
            console.error('Error sending email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new EmailService();