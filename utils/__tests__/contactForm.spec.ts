import { describe, it, expect, vi } from 'vitest'
import {
  CONTACT_ERROR_MESSAGE,
  CONTACT_SUCCESS_MESSAGE,
  formspreePayload,
  submitContactForm,
  type ContactFormInput,
} from '../contactForm'

const ENDPOINT = 'https://formspree.io/f/test123'

const input: ContactFormInput = {
  firstName: ' Jane ',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '(813) 555-0123',
  service: 'Steel Detailing',
  message: 'We need connection design for a mezzanine.',
  website: '',
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('formspreePayload', () => {
  it('maps the form to Formspree fields, using email as the reply-to', () => {
    expect(formspreePayload(input)).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '(813) 555-0123',
      service: 'Steel Detailing',
      message: 'We need connection design for a mezzanine.',
      _subject: 'Website inquiry from Jane Doe',
    })
  })

  it('omits optional fields that were left blank', () => {
    const payload = formspreePayload({ ...input, phone: '  ', service: '' })
    expect(payload).not.toHaveProperty('phone')
    expect(payload).not.toHaveProperty('service')
  })

  it('never sends the honeypot field', () => {
    expect(formspreePayload({ ...input, website: 'spam' })).not.toHaveProperty('website')
  })
})

describe('submitContactForm', () => {
  it('posts JSON to the endpoint and reports success', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }))

    const result = await submitContactForm(ENDPOINT, input, fetchImpl)

    expect(result).toEqual({ ok: true, message: CONTACT_SUCCESS_MESSAGE })
    expect(fetchImpl).toHaveBeenCalledOnce()
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe(ENDPOINT)
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Accept: 'application/json', 'Content-Type': 'application/json' })
    expect(JSON.parse(init.body)).toEqual(formspreePayload(input))
  })

  it('pretends to succeed for bots without sending anything', async () => {
    const fetchImpl = vi.fn()

    const result = await submitContactForm(ENDPOINT, { ...input, website: 'http://spam.example' }, fetchImpl)

    expect(result).toEqual({ ok: true, message: CONTACT_SUCCESS_MESSAGE })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('shows the messages Formspree returns for rejected submissions', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(422, {
      errors: [
        { field: 'email', message: 'should be an email', code: 'TYPE_EMAIL' },
        { message: 'form is disabled', code: 'FORM_DISABLED' },
      ],
    }))

    const result = await submitContactForm(ENDPOINT, input, fetchImpl)

    expect(result.ok).toBe(false)
    expect(result.message).toBe('email should be an email. form is disabled.')
  })

  it('asks the visitor to wait when rate limited', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(429, {}))

    const result = await submitContactForm(ENDPOINT, input, fetchImpl)

    expect(result).toEqual({ ok: false, message: 'Too many submissions. Please try again later.' })
  })

  it('falls back to the phone number when the error body is unreadable', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }))

    const result = await submitContactForm(ENDPOINT, input, fetchImpl)

    expect(result).toEqual({ ok: false, message: CONTACT_ERROR_MESSAGE })
  })

  it('falls back to the phone number on network failure', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const result = await submitContactForm(ENDPOINT, input, fetchImpl)

    expect(result).toEqual({ ok: false, message: CONTACT_ERROR_MESSAGE })
  })

  it('refuses to submit when no endpoint is configured', async () => {
    const fetchImpl = vi.fn()

    const result = await submitContactForm('', input, fetchImpl)

    expect(result).toEqual({ ok: false, message: CONTACT_ERROR_MESSAGE })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
