import * as React from "react"

/** Matches Tailwind’s default `lg` breakpoint (`min-width: 1024px`). */
const LG_BREAKPOINT = 1024

export function useLgAndUp() {
  const [lgAndUp, setLgAndUp] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    const onChange = () => {
      setLgAndUp(mql.matches)
    }
    mql.addEventListener("change", onChange)
    setLgAndUp(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!lgAndUp
}
