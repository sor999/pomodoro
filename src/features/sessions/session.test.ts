import { describe, it, expect } from 'vitest'

import { createFocusSession } from './session'

describe('createFocusSession', () => {
  it('builds a session with the given focusMinutes and injected timestamp', () => {
    const s = createFocusSession(25, 1_700_000_000_000)
    expect(s.focusMinutes).toBe(25)
    expect(s.completedAt).toBe(1_700_000_000_000)
    expect(typeof s.id).toBe('string')
    expect(s.id.length).toBeGreaterThan(0)
  })

  it('generates a unique id per call', () => {
    const a = createFocusSession(25, 1_000)
    const b = createFocusSession(25, 1_000)
    expect(a.id).not.toBe(b.id)
  })

  it('defaults completedAt to now when omitted', () => {
    const before = Date.now()
    const s = createFocusSession(5)
    const after = Date.now()
    expect(s.completedAt).toBeGreaterThanOrEqual(before)
    expect(s.completedAt).toBeLessThanOrEqual(after)
  })

  it('preserves a 0-minute session (edge input)', () => {
    const s = createFocusSession(0, 42)
    expect(s.focusMinutes).toBe(0)
    expect(s.completedAt).toBe(42)
  })
})
