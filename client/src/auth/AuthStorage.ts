const PASSWORD_KEY = 'inventory_password'
const LOGIN_KEY = 'inventory_login'

export function getPassword(): string | null {
  return localStorage.getItem(PASSWORD_KEY)
}

export function setPassword(password: string): void {
  localStorage.setItem(PASSWORD_KEY, password)
}

export function checkPassword(password: string): boolean {
  return getPassword() === password
}

export function saveLogin(): void {
  localStorage.setItem(LOGIN_KEY, 'true')
}

export function isLogin(): boolean {
  return localStorage.getItem(LOGIN_KEY) === 'true'
}

export function logout(): void {
  localStorage.removeItem(LOGIN_KEY)
}
