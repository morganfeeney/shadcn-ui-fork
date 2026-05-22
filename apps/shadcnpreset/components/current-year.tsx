export async function CurrentYear() {
  "use cache"
  return <>{new Date().getFullYear()}</>
}
