// Guest mode — limits and localStorage helpers.
// All guest state lives in localStorage so it persists across reloads
// but vanishes when the user clears their browser or signs up.

export const GUEST_MAX_SOLVES         = 5
export const GUEST_MAX_GUIDE_PER_PROB = 3

const KEY_FLAG    = 'cognichain_guest'
const KEY_SOLVES  = 'cognichain_guest_solves'   // JSON array of problem IDs solved
const KEY_GUIDE   = 'cognichain_guest_guide'    // JSON map { [problemId]: msgCount }

// ── Mode flag ────────────────────────────────────────────────
export function isGuestMode() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEY_FLAG) === '1'
}

export function enterGuestMode() {
  localStorage.setItem(KEY_FLAG, '1')
}

export function exitGuestMode() {
  localStorage.removeItem(KEY_FLAG)
  localStorage.removeItem(KEY_SOLVES)
  localStorage.removeItem(KEY_GUIDE)
}

// ── Solves ───────────────────────────────────────────────────
function _readSolves() {
  try { return JSON.parse(localStorage.getItem(KEY_SOLVES) || '[]') } catch { return [] }
}

export function getGuestSolveCount() {
  return _readSolves().length
}

export function getGuestSolveIds() {
  return _readSolves()
}

export function recordGuestSolve(problemId) {
  const arr = _readSolves()
  if (!arr.includes(problemId)) {
    arr.push(problemId)
    localStorage.setItem(KEY_SOLVES, JSON.stringify(arr))
  }
}

export function guestSolvesRemaining() {
  return Math.max(0, GUEST_MAX_SOLVES - getGuestSolveCount())
}

export function guestSolveLimitReached() {
  return getGuestSolveCount() >= GUEST_MAX_SOLVES
}

// ── Guide messages (per problem) ─────────────────────────────
function _readGuide() {
  try { return JSON.parse(localStorage.getItem(KEY_GUIDE) || '{}') } catch { return {} }
}

export function getGuestGuideCount(problemId) {
  return _readGuide()[problemId] || 0
}

export function recordGuestGuideMessage(problemId) {
  const map = _readGuide()
  map[problemId] = (map[problemId] || 0) + 1
  localStorage.setItem(KEY_GUIDE, JSON.stringify(map))
}

export function guestGuideRemaining(problemId) {
  return Math.max(0, GUEST_MAX_GUIDE_PER_PROB - getGuestGuideCount(problemId))
}

export function guestGuideLimitReached(problemId) {
  return getGuestGuideCount(problemId) >= GUEST_MAX_GUIDE_PER_PROB
}
