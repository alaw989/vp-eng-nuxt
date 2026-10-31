/**
 * Contact form submission.
 *
 * The production site is static (no server runtime), so nginx forwards
 * /api/contact to the whiteboard's Laravel app on the same droplet, which saves
 * each submission and emails it to the firm.
 */

export interface ContactFormInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  service?: string
  message: string
  // Honeypot: hidden from people, filled in by bots
  website?: string
}

export interface ContactSubmitResult {
  ok: boolean
  message: string
}

export const CONTACT_SUCCESS_MESSAGE = 'Thank you for your message! We\'ll be in touch soon.'
export const CONTACT_ERROR_MESSAGE = 'Sorry, your message could not be sent. Please try again or call us at (813) 486-2079.'
const RATE_LIMIT_MESSAGE = 'Too many submissions. Please try again later.'

/**
 * The honeypot goes too: the server decides, so a person whose browser autofilled
 * it still gets a saved message rather than a false "sent".
 */
export function contactPayload(input: ContactFormInput): Record<string, string> {
  const payload: Record<string, string> = {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
  }
  if (input.phone?.trim()) payload.phone = input.phone.trim()
  if (input.service?.trim()) payload.service = input.service.trim()
  if (input.website?.trim()) payload.website = input.website.trim()
  return payload
}

async function errorMessage(response: Response): Promise<string> {
  if (response.status === 429) return RATE_LIMIT_MESSAGE

  // Only validation errors are worth showing; anything else gets the phone number
  if (response.status === 422) {
    try {
      const body = await response.json() as { message?: string }
      if (body.message) return body.message
    } catch {
      // Non-JSON error page; fall through to the generic message
    }
  }
  return CONTACT_ERROR_MESSAGE
}

export async function submitContactForm(
  endpoint: string,
  input: ContactFormInput,
  fetchImpl: typeof fetch = fetch,
): Promise<ContactSubmitResult> {
  if (!endpoint) {
    return { ok: false, message: CONTACT_ERROR_MESSAGE }
  }

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(contactPayload(input)),
    })

    if (response.ok) {
      return { ok: true, message: CONTACT_SUCCESS_MESSAGE }
    }
    return { ok: false, message: await errorMessage(response) }
  } catch {
    return { ok: false, message: CONTACT_ERROR_MESSAGE }
  }
}
