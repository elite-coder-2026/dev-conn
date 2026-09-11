import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ComponentEditorPage from './ComponentEditorPage'

const currentUser = { name: 'Alex Rivera', handle: '@alex' }

beforeEach(() => {
  global.fetch.mockReset()
  global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
})

describe('ComponentEditorPage', () => {
  test('renders the editor shell with its language tabs and detail fields', () => {
    render(<ComponentEditorPage currentUser={currentUser} />)
    expect(screen.getByRole('heading', { name: /component editor/i })).toBeInTheDocument()
    for (const label of ['HTML', 'SCSS', 'JavaScript']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByPlaceholderText('e.g. GradientButton')).toBeInTheDocument()
  })

  test('loads the saved component library from /api/feed/components', async () => {
    render(<ComponentEditorPage currentUser={currentUser} />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/feed/components', expect.objectContaining({ credentials: 'include' })))
  })

  test('Save is blocked with an error until a component name is entered', async () => {
    render(<ComponentEditorPage currentUser={currentUser} />)
    await userEvent.click(screen.getByRole('button', { name: /save component/i }))
    expect(await screen.findByText(/component name is required/i)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalledWith('/api/posts/', expect.anything())
  })

  test('Save posts the component to /api/posts/ once a name is set', async () => {
    render(<ComponentEditorPage currentUser={currentUser} />)
    await userEvent.type(screen.getByPlaceholderText('e.g. GradientButton'), 'GradientButton')
    await userEvent.click(screen.getByRole('button', { name: /save component/i }))

    await waitFor(() => {
      const call = global.fetch.mock.calls.find(([u, o]) => u === '/api/posts/' && o?.method === 'POST')
      expect(call).toBeTruthy()
      expect(JSON.parse(call[1].body).content).toContain('Component: GradientButton')
    })
  })
})
