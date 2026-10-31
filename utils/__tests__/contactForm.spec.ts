import { describe, it, expect, vi } from 'vitest'
import {
  CONTACT_ERROR_MESSAGE,
  CONTACT_SUCCESS_MESSAGE,
  contactPayload,
  submitContactForm,
  type ContactFormInput,
} from '../contactForm'

const ENDPOINT = '/api/contact'

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

describe('contactPayload', () => {
  it('sends the trimmed form fields', () => {
    expect(contactPayload(input)).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '(813) 555-0123',
      service: 'Steel Detailing',
      message: 'We need connection design for a mezzanine.',
    })
  })

  it('omits optional fields that were left blank', () => {
    const payload = contactPayload({ ...input, phone: '  ', service: '' })
    expect(payload).not.toHaveProperty('phone')
    expect(payload).not.toHaveProperty('service')
  })

  it('sends a filled honeypot so the server can flag it', () => {
    expect(contactPayload({ ...input, website: 'spam' }).website).toBe('spam')
  })
})

describe('submitContactForm', () => {
  it('posts JSON to the endpoint and reports success', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, { message: 'Thanks' }))

    const result = await submitContactForm(ENDPOINT, input, fetchImpl)

    expect(result).toEqual({ ok: true, message: CONTACT_SUCCESS_MESSAGE })
    expect(fetchImpl).toHaveBeenCalledOnce()
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe(ENDPOINT)
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Accept: 'application/json', 'Content-Type': 'application/json' })
    expect(JSON.parse(init.body)).toEqual(contactPayload(input))
  })

  it('shows the message the server returns for rejected submissions', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(422, {
      message: 'The email field must be a valid email address.',
      errors: { email: ['The email field must be a valid email address.'] },
    }))

    const result = await submitContactForm(ENDPOINT, input, fetchImpl)

    expect(result).toEqual({ ok: false, message: 'The email field must be a valid email address.' })
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

  it('does not show server error text to visitors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(500, { message: 'SQLSTATE[HY000] connection refused' }))

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
