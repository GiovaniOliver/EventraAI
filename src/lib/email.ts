/**
 * Email service for sending emails
 * Uses a third-party email service (e.g., SendGrid, Amazon SES, etc.)
 */

interface EmailParams {
  [key: string]: string | number | boolean | null | undefined
}

interface EmailOptions {
  to: string
  subject: string
  templateId: string
  params: EmailParams
  from?: string
  replyTo?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email using the configured email provider
 * Currently this is a mock implementation - replace with actual email service
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const {
      to,
      subject,
      templateId,
      params,
      from = process.env.EMAIL_FROM || 'noreply@eventra.ai',
      replyTo = process.env.EMAIL_REPLY_TO || 'support@eventra.ai'
    } = options

    console.log('Sending email:', {
      to,
      from,
      replyTo,
      subject,
      templateId
    })

    // TODO: Replace this with actual email service implementation
    // Example implementation with SendGrid:
    /*
    const msg = {
      to,
      from,
      replyTo,
      subject,
      templateId,
      dynamicTemplateData: params
    }
    
    const response = await sendgrid.send(msg)
    return {
      success: true,
      messageId: response[0]?.headers['x-message-id'] || undefined
    }
    */

    // Mock implementation for development
    console.log('Email params:', params)
    
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock success with 95% probability, failure with 5%
    const isSuccess = Math.random() > 0.05
    
    if (isSuccess) {
      return {
        success: true,
        messageId: `mock-email-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
      }
    } else {
      throw new Error('Mock email delivery failure')
    }
  } catch (error: any) {
    console.error('Email sending failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to send email'
    }
  }
}

/**
 * Generate a standard email template with the app's branding
 * This is a utility function for custom emails
 */
export function generateEmailHTML(content: string): string {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #7c3aed;
          padding: 20px;
          text-align: center;
        }
        .logo {
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          padding: 20px;
          background-color: #fff;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        a {
          color: #7c3aed;
          text-decoration: none;
        }
        .button {
          display: inline-block;
          background-color: #7c3aed;
          color: white !important;
          padding: 10px 20px;
          margin: 15px 0;
          border-radius: 5px;
          text-align: center;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">EventraAI</div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} EventraAI. All rights reserved.<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe">Unsubscribe</a> |
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy">Privacy Policy</a>
        </div>
      </div>
    </body>
  </html>
  `
} 