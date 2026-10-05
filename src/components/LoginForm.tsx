import { useState, type FormEvent } from 'react'
import { defaultApiUrl, describeError, getStateInstance } from '../api/greenApi'
import type { Credentials } from '../types'
import { PlaneIcon } from './Icons'

interface Props {
  onLogin: (creds: Credentials) => void
}

export function LoginForm({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const creds: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim() || defaultApiUrl(idInstance),
    }
    setLoading(true)
    setError(null)
    try {
      const { stateInstance } = await getStateInstance(creds)
      if (stateInstance !== 'authorized') {
        setError(`Инстанс не авторизован (статус: ${stateInstance}). Авторизуйте его в личном кабинете GREEN-API.`)
        return
      }
      onLogin(creds)
    } catch (err) {
      setError(`Не удалось войти: ${describeError(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__logo">
          <PlaneIcon />
        </div>
        <h1>Telegram-чат на GREEN-API</h1>
        <p className="login__hint">Войдите с данными инстанса из личного кабинета GREEN-API</p>

        <label className="field">
          <span className="field__label">ID инстанса</span>
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="Например, 4100123456"
            inputMode="numeric"
            autoComplete="off"
            required
          />
          <span className="field__hint">Поле idInstance в личном кабинете</span>
        </label>
        <label className="field">
          <span className="field__label">API-токен</span>
          <span className="field__control">
            <input
              type={showToken ? 'text' : 'password'}
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              placeholder="Вставьте токен"
              autoComplete="off"
              required
            />
            <button type="button" className="link field__toggle" onClick={() => setShowToken((v) => !v)}>
              {showToken ? 'Скрыть' : 'Показать'}
            </button>
          </span>
          <span className="field__hint">Поле apiTokenInstance в личном кабинете</span>
        </label>

        <details className="advanced">
          <summary>Дополнительно</summary>
          <label className="field">
            <span className="field__label">Адрес API</span>
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder={idInstance ? defaultApiUrl(idInstance) : 'https://4100.api.green-api.com'}
            />
            <span className="field__hint">Поле apiUrl. Оставьте пустым — адрес определится по ID инстанса</span>
          </label>
        </details>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Подключение…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
