/**
 * Contact form submission via Formspree.
 *
 * The production site is static (no server runtime), so the form posts
 * straight to Formspree, which emails each submission to the firm.
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

interface FormspreeError {
  field?: string
  message: string
}

/**
 * Formspree fields. `email` becomes the reply-to address and `_subject` the
 * notification's subject line. The honeypot is never sent.
 */
export function formspreePayload(input: ContactFormInput): Record<string, string> {
  const name = `${input.firstName.trim()} ${input.lastName.trim()}`
  const payload: Record<string, string> = {
    name,
    email: input.email.trim(),
    message: input.message.trim(),
    _subject: `Website inquiry from ${name}`,
  }
  if (input.phone?.trim()) payload.phone = input.phone.trim()
  if (input.service?.trim()) payload.service = input.service.trim()
  return payload
}

async function errorMessage(response: Response): Promise<string> {
  if (response.status === 429) return RATE_LIMIT_MESSAGE

  try {
    const body = await response.json() as { errors?: FormspreeError[] }
    const messages = (body.errors || [])
      .map(e => (e.field ? `${e.field} ${e.message}` : e.message))
      .filter(Boolean)
    if (messages.length > 0) return messages.map(m => `${m}.`).join(' ')
  } catch {
    // Non-JSON error page; fall through to the generic message
  }
  return CONTACT_ERROR_MESSAGE
}

export async function submitContactForm(
  endpoint: string,
  input: ContactFormInput,
  fetchImpl: typeof fetch = fetch,
): Promise<ContactSubmitResult> {
  // Bots that fill the honeypot get a normal-looking success and send nothing
  if (input.website?.trim()) {
    return { ok: true, message: CONTACT_SUCCESS_MESSAGE }
  }

  if (!endpoint) {
    return { ok: false, message: CONTACT_ERROR_MESSAGE }
  }

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(formspreePayload(input)),
    })

    if (response.ok) {
      return { ok: true, message: CONTACT_SUCCESS_MESSAGE }
    }
    return { ok: false, message: await errorMessage(response) }
  } catch {
    return { ok: false, message: CONTACT_ERROR_MESSAGE }
  }
}
