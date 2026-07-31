import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import {
  useSessionLogStore,
  SESSION_LOG_STORAGE_KEY,
} from './session-log-store'
import type { FocusSession } from './session'

function resetStore() {
  useSessionLogStore.setState({ sessions: [] })
  localStorage.clear()
}

describe('useSessionLogStore actions', () => {
  beforeEach(resetStore)
  afterEach(resetStore)

  it('starts with an empty session list', () => {
    expect(useSessionLogStore.getState().sessions).toEqual([])
  })

  it('addFocusSession appends a completed focus session', () => {
    useSessionLogStore.getState().addFocusSession(25, 1_000)
    const { sessions } = useSessionLogStore.getState()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].focusMinutes).toBe(25)
    expect(sessions[0].completedAt).toBe(1_000)
    expect(typeof sessions[0].id).toBe('string')
  })

  it('addFocusSession appends in insertion order', () => {
    const store = useSessionLogStore.getState()
    store.addFocusSession(25, 1_000)
    store.addFocusSession(50, 2_000)
    const { sessions } = useSessionLogStore.getState()
    expect(sessions.map((s) => s.completedAt)).toEqual([1_000, 2_000])
  })

  it('removeSession removes only the matching id', () => {
    const store = useSessionLogStore.getState()
    store.addFocusSession(25, 1_000)
    store.addFocusSession(50, 2_000)
    const target = useSessionLogStore.getState().sessions[0]
    useSessionLogStore.getState().removeSession(target.id)
    const { sessions } = useSessionLogStore.getState()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].completedAt).toBe(2_000)
  })

  it('removeSession is a no-op for an unknown id', () => {
    useSessionLogStore.getState().addFocusSession(25, 1_000)
    useSessionLogStore.getState().removeSession('does-not-exist')
    expect(useSessionLogStore.getState().sessions).toHaveLength(1)
  })

  it('clearAll empties the list', () => {
    const store = useSessionLogStore.getState()
    store.addFocusSession(25, 1_000)
    store.addFocusSession(50, 2_000)
    useSessionLogStore.getState().clearAll()
    expect(useSessionLogStore.getState().sessions).toEqual([])
  })
})

describe('useSessionLogStore persistence', () => {
  beforeEach(resetStore)
  afterEach(resetStore)

  it('writes sessions to localStorage under the exported key', () => {
    useSessionLogStore.getState().addFocusSession(25, 1_000)
    const raw = localStorage.getItem(SESSION_LOG_STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string)
    expect(parsed.state.sessions).toHaveLength(1)
    expect(parsed.state.sessions[0].focusMinutes).toBe(25)
  })

  it('acceptance: a completed focus session survives a reload (rehydrate)', async () => {
    // Seed localStorage as if a previous session persisted a completed focus block.
    const persisted: FocusSession = {
      id: 'seeded-id',
      completedAt: 1_700_000_000_000,
      focusMinutes: 25,
    }
    localStorage.setItem(
      SESSION_LOG_STORAGE_KEY,
      JSON.stringify({ state: { sessions: [persisted] }, version: 1 }),
    )

    // Force a fresh module instance so the persist middleware rehydrates from storage.
    vi.resetModules()
    const mod = await import('./session-log-store')
    // Ensure async rehydration (if any) has completed.
    await mod.useSessionLogStore.persist?.rehydrate?.()

    const { sessions } = mod.useSessionLogStore.getState()
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual(persisted)
  })
})
