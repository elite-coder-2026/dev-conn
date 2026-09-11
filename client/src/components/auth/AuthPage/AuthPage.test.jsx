import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthPage from './AuthPage'

function okJson(body) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) })
}
function errJson(status, body) {
  return Promise.resolve({ ok: false, status, json: () => Promise.resolve(body) })
}

beforeEach(() => { global.fetch.mockReset() })

describe('AuthPage', () => {
  test('starts in login mode; no name field until you switch to register', async () => {
    const user = userEvent.setup()
    render(<AuthPage onAuth={vi.fn()} />)

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/full name/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^register$/i }))
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument()
  })

  test('password field is masked (type=password)', () => {
    render(<AuthPage onAuth={vi.fn()} />)
    expect(screen.getByPlaceholderText(/^password$/i)).toHaveAttribute('type', 'password')
  })

  test('login posts handle+password to /api/auth/login with credentials, then calls onAuth', async () => {
    const user = userEvent.setup()
    const onAuth = vi.fn()
    global.fetch.mockReturnValueOnce(okJson({ user: { id: 'u1', handle: '@alex' } }))

    render(<AuthPage onAuth={onAuth} />)
    await user.type(screen.getByPlaceholderText(/handle/i), 'alex')
    await user.type(screen.getByPlaceholderText(/^password$/i), 'correct-horse')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(onAuth).toHaveBeenCalledWith({ id: 'u1', handle: '@alex' }))
    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/auth/login')
    expect(opts.method).toBe('POST')
    expect(opts.credentials).toBe('include')
    expect(JSON.parse(opts.body)).toEqual({ handle: 'alex', password: 'correct-horse' })
  })

  test('register posts name+handle+password to /api/auth/register', async () => {
    const user = userEvent.setup()
    global.fetch.mockReturnValueOnce(okJson({ user: { id: 'u2' } }))

    render(<AuthPage onAuth={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /^register$/i }))
    await user.type(screen.getByPlaceholderText(/full name/i), 'Alex Rivera')
    await user.type(screen.getByPlaceholderText(/handle/i), 'alex')
    await user.type(screen.getByPlaceholderText(/^password$/i), 'longenough')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/auth/register')
    expect(JSON.parse(opts.body)).toEqual({ handle: 'alex', password: 'longenough', name: 'Alex Rivera' })
  })

  test('shows server error message and does NOT call onAuth on 401', async () => {
    const user = userEvent.setup()
    const onAuth = vi.fn()
    global.fetch.mockReturnValueOnce(errJson(401, { error: 'Invalid credentials' }))

    render(<AuthPage onAuth={onAuth} />)
    await user.type(screen.getByPlaceholderText(/handle/i), 'alex')
    await user.type(screen.getByPlaceholderText(/^password$/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
    expect(onAuth).not.toHaveBeenCalled()
  })

  test('shows a friendly message when the request throws', async () => {
    const user = userEvent.setup()
    global.fetch.mockRejectedValueOnce(new Error('network down'))

    render(<AuthPage onAuth={vi.fn()} />)
    await user.type(screen.getByPlaceholderText(/handle/i), 'alex')
    await user.type(screen.getByPlaceholderText(/^password$/i), 'secret')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/could not reach the server/i)).toBeInTheDocument()
  })

  test('does not put the password in the URL', async () => {
    const user = userEvent.setup()
    global.fetch.mockReturnValueOnce(okJson({ user: {} }))

    render(<AuthPage onAuth={vi.fn()} />)
    await user.type(screen.getByPlaceholderText(/handle/i), 'alex')
    await user.type(screen.getByPlaceholderText(/^password$/i), 'topsecret')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch.mock.calls[0][0]).not.toContain('topsecret')
  })
})
