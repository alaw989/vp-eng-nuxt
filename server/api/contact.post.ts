import { H3Event } from 'h3'
import { Resend } from 'resend'

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  service?: string
  message: string
  // Honeypot field for spam protection
  website?: string
}

interface ContactSubmissionResponse {
  success: boolean
  message: string
  submissionId?: string
}

// Rate limiting storage (in production, use Redis or similar)
const submissionLog = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_SUBMISSIONS_PER_HOUR = 3

/**
 * Check if IP has exceeded rate limit
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const submissions = submissionLog.get(ip) || []

  // Remove submissions outside the time window
  const recentSubmissions = submissions.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW)

  if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR) {
    return false
  }

  // Update log with current submission
  recentSubmissions.push(now)
  submissionLog.set(ip, recentSubmissions)

  return true
}

/**
 * Sanitize form input to prevent XSS
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export default defineEventHandler(async (event: H3Event): Promise<ContactSubmissionResponse> => {
  try {
    // Get client IP for rate limiting
    const ip = getRequestHeader(event, 'x-forwarded-for') || getRequestHeader(event, 'x-real-ip') || 'unknown'

    // Check rate limit
    if (!checkRateLimit(ip)) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many submissions. Please try again later.'
      })
    }

    // Parse request body
    const body = await readBody<ContactFormData>(event)

    // Honeypot check - if website field is filled, it's a bot
    if (body.website && body.website.trim() !== '') {
      // Return success silently to not tip off bots
      return {
        success: true,
        message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
      }
    }

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.message) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    // Validate field lengths
    const sanitized = {
      firstName: sanitizeInput(body.firstName),
      lastName: sanitizeInput(body.lastName),
      email: sanitizeInput(body.email),
      phone: body.phone ? sanitizeInput(body.phone) : '',
      service: body.service ? sanitizeInput(body.service) : '',
      message: sanitizeInput(body.message)
    }

    // Validate name lengths
    if (sanitized.firstName.length < 2 || sanitized.firstName.length > 50) {
      throw createError({
        statusCode: 400,
        statusMessage: 'First name must be between 2 and 50 characters'
      })
    }

    if (sanitized.lastName.length < 2 || sanitized.lastName.length > 50) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Last name must be between 2 and 50 characters'
      })
    }

    // Validate email
    if (!isValidEmail(sanitized.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Please provide a valid email address'
      })
    }

    // Validate message length
    if (sanitized.message.length < 10 || sanitized.message.length > 2000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message must be between 10 and 2000 characters'
      })
    }

    // Validate phone format if provided
    if (sanitized.phone) {
      const phoneRegex = /^[\d\s\-\(\)\+.]+$/
      if (!phoneRegex.test(sanitized.phone)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Please provide a valid phone number'
        })
      }
    }

    // Generate submission ID
    const submissionId = `VP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Get email configuration from environment
    const resendApiKey = process.env.RESEND_API_KEY
    const notificationEmail = process.env.CONTACT_FORM_EMAIL || 'info@vp-associates.com'
    const fromEmail = process.env.FROM_EMAIL || 'noreply@vp-associates.com'

    // Log submission to console (always log for backup)
    const timestamp = new Date().toISOString()
    console.log('\n=== NEW CONTACT FORM SUBMISSION ===')
    console.log(`Submission ID: ${submissionId}`)
    console.log(`Timestamp: ${timestamp}`)
    console.log(`IP Address: ${ip}`)
    console.log('---')
    console.log(`Name: ${sanitized.firstName} ${sanitized.lastName}`)
    console.log(`Email: ${sanitized.email}`)
    console.log(`Phone: ${sanitized.phone || 'Not provided'}`)
    console.log(`Service: ${sanitized.service || 'Not specified'}`)
    console.log('---')
    console.log(`Message:\n${sanitized.message}`)
    console.log('====================================\n')

    // Send email if Resend is configured
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey)

        // Create HTML email content
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #033379; color: white; padding: 20px; text-align: center; }
                .header h1 { margin: 0; }
                .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #033379; }
                .value { margin-top: 5px; }
                .message-box { background-color: white; padding: 15px; border-left: 4px solid #BE0000; margin-top: 15px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Contact Form Submission</h1>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Submission ID:</div>
                    <div class="value">${submissionId}</div>
                  </div>
                  <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">${sanitized.firstName} ${sanitized.lastName}</div>
                  </div>
                  <div class="field">
                    <div class="label">Email:</div>
                    <div class="value"><a href="mailto:${sanitized.email}">${sanitized.email}</a></div>
                  </div>
                  ${sanitized.phone ? `
                  <div class="field">
                    <div class="label">Phone:</div>
                    <div class="value">${sanitized.phone}</div>
                  </div>
                  ` : ''}
                  ${sanitized.service ? `
                  <div class="field">
                    <div class="label">Service Interest:</div>
                    <div class="value">${sanitized.service}</div>
                  </div>
                  ` : ''}
                  <div class="field">
                    <div class="label">Submitted:</div>
                    <div class="value">${timestamp}</div>
                  </div>
                  <div class="message-box">
                    <div class="label">Message:</div>
                    <div class="value">${sanitized.message.replace(/\n/g, '<br>')}</div>
                  </div>
                </div>
                <div class="footer">
                  <p>This email was sent from the VP Associates contact form.</p>
                </div>
              </div>
            </body>
          </html>
        `

        // Create plain text version
        const textContent = `
VP Associates - New Contact Form Submission
============================================

Submission ID: ${submissionId}

Name: ${sanitized.firstName} ${sanitized.lastName}
Email: ${sanitized.email}
${sanitized.phone ? `Phone: ${sanitized.phone}` : ''}
${sanitized.service ? `Service Interest: ${sanitized.service}` : ''}

Submitted: ${timestamp}

----------------------------------------
Message:

${sanitized.message}
============================================
        `

        // Send email via Resend
        await resend.emails.send({
          from: fromEmail,
          to: notificationEmail,
          replyTo: sanitized.email,
          subject: `Contact Form: ${sanitized.firstName} ${sanitized.lastName} - ${submissionId}`,
          html: htmlContent,
          text: textContent,
        })

        console.log('Email sent successfully via Resend')
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error('Failed to send email via Resend:', emailError)
        // Continue - form submission is still logged to console
      }
    } else {
      console.log('Resend API key not configured - submission logged to console only')
      console.log('To enable email, set RESEND_API_KEY environment variable')
    }

    return {
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      submissionId
    }
  } catch (error) {
    // Re-throw HTTP errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Log unexpected errors
    console.error('Contact form submission error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while processing your submission. Please try again.'
    })
  }
})
