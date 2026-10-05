import type { Credentials, Notification } from '../types'

export function defaultApiUrl(idInstance: string): string {
  const prefix = idInstance.trim().slice(0, 4)
  return prefix.length === 4 ? `https://${prefix}.api.green-api.com` : 'https://api.green-api.com'
}

export class ApiError extends Error {
  readonly status: number
  constructor(method: string, status: number, details: string) {
    super(`${method}: HTTP ${status}${details ? ` — ${details}` : ''}`)
    this.status = status
  }
}

export function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) return 'Неверный idInstance или apiTokenInstance'
    if (err.status === 404) return 'Инстанс не найден. Проверьте idInstance и apiUrl'
    if (err.status === 429) return 'Слишком много запросов. Попробуйте чуть позже'
    if (err.status >= 500) return 'Сервер GREEN-API временно недоступен'
    return err.message
  }
  if (err instanceof TypeError) return 'Нет соединения с сервером. Проверьте интернет и apiUrl'
  return err instanceof Error ? err.message : String(err)
}

async function request<T>(
  creds: Credentials,
  method: string,
  init?: RequestInit & { query?: string },
): Promise<T> {
  const base = creds.apiUrl.replace(/\/+$/, '')
  const url = `${base}/waInstance${creds.idInstance}/${method}/${creds.apiTokenInstance}${init?.query ?? ''}`
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(method, res.status, text)
  }
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export function getStateInstance(creds: Credentials) {
  return request<{ stateInstance: string }>(creds, 'getStateInstance')
}

export function sendMessage(creds: Credentials, chatId: string, message: string) {
  return request<{ idMessage: string }>(creds, 'sendMessage', {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  })
}

export function receiveNotification(creds: Credentials, signal: AbortSignal, receiveTimeout = 20) {
  return request<Notification | null>(creds, 'receiveNotification', {
    query: `?receiveTimeout=${receiveTimeout}`,
    signal,
  })
}

export function deleteNotification(creds: Credentials, receiptId: number) {
  return request<{ result: boolean }>(creds, `deleteNotification`, {
    method: 'DELETE',
    query: `/${receiptId}`,
  })
}
