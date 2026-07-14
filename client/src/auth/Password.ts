export function validatePassword(password: string): boolean {
  return /^\d{4}$/.test(password)
}
