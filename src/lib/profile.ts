import { useSyncExternalStore } from 'react'

/* ------------------------------------------------------------------ *
 * The local player's identity. Demo-mode only: a display name, three
 * social handles and a pfp, persisted in localStorage next to the rest
 * of the paper-trading state. No backend touches this — an uploaded
 * image is downscaled client-side and inlined as a data URL.
 *
 * Everything read back out of storage is re-sanitized on load, because
 * localStorage is user-writable and the rest of the UI prints these
 * values without escaping anything twice.
 * ------------------------------------------------------------------ */

export interface Profile {
  /** Display name printed wherever the local player appears. */
  name: string
  /** Socials, stored without the @ or any URL prefix. */
  x: string
  telegram: string
  discord: string
  /** A data URL produced by the uploader. Empty = the letter chip. */
  pfp: string
}

export const EMPTY_PROFILE: Profile = { name: '', x: '', telegram: '', discord: '', pfp: '' }

const KEY = 'mcfun.profile.v1'

export const NAME_MAX = 20
export const HANDLE_MAX = 32

/* The uploader downscales to this square before storing. */
export const PFP_SIZE = 128
/* Post-downscale budget. A 128px JPEG lands well under this; the cap
 * exists so a hand-crafted localStorage value cannot balloon renders. */
export const PFP_MAX_BYTES = 120_000

/* Strips control characters and anything that could smuggle markup,
 * then trims and caps. Names keep spaces; handles do not. */
export function cleanName(v: string): string {
  return v
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trimStart()
    .slice(0, NAME_MAX)
}

export function cleanHandle(v: string): string {
  return v
    .replace(/^@+/, '')
    .replace(/[^A-Za-z0-9_.-]/g, '')
    .slice(0, HANDLE_MAX)
}

function cleanPfp(v: unknown): string {
  if (typeof v !== 'string') return ''
  if (!v.startsWith('data:image/')) return ''
  if (v.length > PFP_MAX_BYTES) return ''
  return v
}

function sanitize(p: Partial<Profile>): Profile {
  return {
    name: typeof p.name === 'string' ? cleanName(p.name).trim() : '',
    x: typeof p.x === 'string' ? cleanHandle(p.x) : '',
    telegram: typeof p.telegram === 'string' ? cleanHandle(p.telegram) : '',
    discord: typeof p.discord === 'string' ? cleanHandle(p.discord) : '',
    pfp: cleanPfp(p.pfp),
  }
}

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_PROFILE
    return sanitize(JSON.parse(raw) as Partial<Profile>)
  } catch {
    return EMPTY_PROFILE
  }
}

let current: Profile = typeof window === 'undefined' ? EMPTY_PROFILE : load()
const listeners = new Set<() => void>()

export function getProfile(): Profile {
  return current
}

export function saveProfile(next: Profile): void {
  current = sanitize(next)
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    /* Quota exceeded: keep the in-memory copy so the session works. */
  }
  listeners.forEach((fn) => fn())
}

export function clearProfile(): void {
  saveProfile(EMPTY_PROFILE)
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Live profile; re-renders on save. */
export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, getProfile, () => EMPTY_PROFILE)
}

/** What the rest of the UI prints for the local player. */
export function displayName(p: Profile): string {
  return p.name || 'you'
}

/* ------------------------------------------------------------------ *
 * Upload path: read the file, draw it onto a 128px square canvas with
 * a cover crop, and hand back a small JPEG data URL. Runs entirely in
 * the browser; rejects with a printable message on any failure.
 * ------------------------------------------------------------------ */

export function fileToPfp(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image.'))
      return
    }
    if (file.size > 8_000_000) {
      reject(new Error('Too big. 8 MB max before resize.'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = PFP_SIZE
        canvas.height = PFP_SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas unavailable.')
        /* Cover crop: scale the short edge to fit, centre the rest. */
        const scale = PFP_SIZE / Math.min(img.width, img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, (PFP_SIZE - w) / 2, (PFP_SIZE - h) / 2, w, h)
        const out = canvas.toDataURL('image/jpeg', 0.85)
        if (out.length > PFP_MAX_BYTES) throw new Error('Image did not compress small enough.')
        resolve(out)
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Could not process image.'))
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image.'))
    }
    img.src = url
  })
}
