import { Link, type LinkProps } from 'react-router-dom'

/* ------------------------------------------------------------------ *
 * The single point where this front end touches a router.
 *
 * Nothing under src/components imports react-router. They import this.
 * If the target stops being Vite + react-router — Next, Remix, Astro,
 * a plain anchor — this file changes and nothing else does.
 * ------------------------------------------------------------------ */

export function AppLink(props: LinkProps) {
  return <Link {...props} />
}
