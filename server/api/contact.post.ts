import { H3Event } from 'h3'

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

    // Log submission to console (in production, send email or save to database)
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

    // TODO: Integrate with email service
    // Options for production:
    // 1. SendGrid: https://sendgrid.com/
    // 2. Resend: https://resend.com/
    // 3. Formspree: https://formspree.io/ (easiest, no backend code needed)
    // 4. Nodemailer with SMTP
    //
    // Example with SendGrid:
    // import { SendGridMail } from '@sendgrid/mail'
    // const msg = {
    //   to: 'info@vp-associates.com',
    //   from: 'noreply@vp-associates.com',
    //   subject: `Contact Form: ${sanitized.firstName} ${sanitized.lastName}`,
    //   text: `
    //     Name: ${sanitized.firstName} ${sanitized.lastName}
    //     Email: ${sanitized.email}
    //     Phone: ${sanitized.phone || 'Not provided'}
    //     Service: ${sanitized.service || 'Not specified'}
    //
    //     Message:
    //     ${sanitized.message}
    //   `
    // }
    // await SendGridMail.send(msg)

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
