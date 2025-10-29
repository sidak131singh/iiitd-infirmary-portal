import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASS, // Your email password or app password
  },
})

// Generate a strong random password
export function generateRandomPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = uppercase + lowercase + numbers + symbols
  let password = ''
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Send password email to student
export async function sendPasswordEmail(
  studentEmail: string,
  studentName: string,
  studentId: string,
  password: string
): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: studentEmail,
    subject: 'IIITD Infirmary Portal - Account Created',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .credentials { background-color: white; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; }
          .password { font-family: monospace; font-size: 18px; font-weight: bold; color: #dc2626; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 IIITD Infirmary Portal</h1>
          </div>
          <div class="content">
            <h2>Welcome to IIITD Infirmary Portal!</h2>
            <p>Hello <strong>${studentName}</strong>,</p>
            <p>Your student account has been successfully created in the IIITD Infirmary Portal system. You can now book appointments, view prescriptions, and access medical services.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${studentEmail}</p>
              <p><strong>Student ID:</strong> ${studentId}</p>
              <p><strong>Password:</strong> <span class="password">${password}</span></p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong>
              <ul>
                <li>Please change your password after your first login</li>
                <li>Do not share your credentials with anyone</li>
                <li>Keep this email secure or delete it after noting down your password</li>
              </ul>
            </div>
            
            <p>To access the portal, visit: <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login">${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login</a></p>
            
            <p>If you have any questions or need assistance, please contact the infirmary administration.</p>
            
            <p>Best regards,<br>
            IIITD Infirmary Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© 2025 IIITD Infirmary Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      IIITD Infirmary Portal - Account Created
      
      Hello ${studentName},
      
      Your student account has been successfully created in the IIITD Infirmary Portal system.
      
      Login Credentials:
      Email: ${studentEmail}
      Student ID: ${studentId}
      Password: ${password}
      
      IMPORTANT: Please change your password after your first login and keep your credentials secure.
      
      Login URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login
      
      Best regards,
      IIITD Infirmary Team
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Password email sent successfully to ${studentEmail}`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send password email')
  }
}

// Test email configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('Email server connection verified')
    return true
  } catch (error) {
    console.error('Email server connection failed:', error)
    return false
  }
}