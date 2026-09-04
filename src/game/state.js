export const defaultState = {
  avatar: {
    skin: 2,
    hair: 0,
    hairColor: 0,
    outfit: 0,
  },
  bodyChoice: null,
  venue: null,
}

export function readSave() {
  try {
    const raw = window.localStorage.getItem('omwgod-save-v1')
    return raw ? { ...defaultState, ...JSON.parse(raw) } : structuredClone(defaultState)
  } catch {
    return structuredClone(defaultState)
  }
}

export function writeSave(state) {
  try {
    window.localStorage.setItem('omwgod-save-v1', JSON.stringify(state))
  } catch {
    // Local persistence is helpful, not required for play.
  }
}
