import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Default: every fetch returns an empty-ish OK response. Individual tests
// override with vi.spyOn(global, 'fetch') as needed.
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(null),
    text: () => Promise.resolve(''),
  }),
)

// jsdom lacks these; several MUI / editor components touch them.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  }))
}
if (!window.scrollTo) window.scrollTo = vi.fn()
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = vi.fn()
global.ResizeObserver = global.ResizeObserver || class {
  observe() {} unobserve() {} disconnect() {}
}

afterEach(() => {
  cleanup()
  global.fetch.mockClear?.()
})
