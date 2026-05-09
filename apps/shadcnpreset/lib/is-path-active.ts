/** True when {@link pathname} is this route or a nested segment (same behavior as regex `^href`). */
export default function isPathActive(pathname: string, href: string): boolean {
  return new RegExp(`^${href}`).test(pathname)
}
