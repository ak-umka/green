import { useState, type FormEvent } from 'react'
import type { Chat } from '../types'
import { avatarLabel, formatTime } from '../utils'
import { PlusIcon } from './Icons'

interface Props {
  chats: Chat[]
  activeChatId: string | null
  onSelect: (chatId: string) => void
  onCreate: (phone: string) => void
  onLogout: () => void
}

export function Sidebar({ chats, activeChatId, onSelect, onCreate, onLogout }: Props) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) {
      setError('Введите номер в международном формате, например 79991234567')
      return
    }
    onCreate(phone)
    setPhone('')
    setError(null)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <span className="sidebar__title">Чаты</span>
        <button className="link" onClick={onLogout}>
          Выйти
        </button>
      </div>

      <form className="sidebar__new" onSubmit={handleSubmit}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            setError(null)
          }}
          placeholder="Номер телефона получателя"
          aria-label="Номер телефона получателя"
        />
        <button type="submit" className="icon-button" title="Новый чат" aria-label="Новый чат">
          <PlusIcon />
        </button>
      </form>
      {error && <div className="error sidebar__error">{error}</div>}

      <ul className="chat-list">
        {chats.length === 0 && (
          <li className="chat-list__empty">Чатов пока нет. Введите номер телефона, чтобы начать переписку.</li>
        )}
        {chats.map((chat) => {
          const last = chat.messages[chat.messages.length - 1]
          return (
            <li
              key={chat.id}
              className={`chat-item ${chat.id === activeChatId ? 'chat-item--active' : ''}`}
              onClick={() => onSelect(chat.id)}
            >
              <div className="avatar">{avatarLabel(chat.name)}</div>
              <div className="chat-item__body">
                <div className="chat-item__top">
                  <span className="chat-item__name">{chat.name}</span>
                  {last && <span className="chat-item__time">{formatTime(last.timestamp)}</span>}
                </div>
                <div className="chat-item__preview">
                  {last ? (last.outgoing ? 'Вы: ' : '') + last.text : 'Сообщений пока нет'}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
