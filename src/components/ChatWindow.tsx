import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import type { Chat, MessageStatus } from '../types'
import { avatarLabel, formatTime } from '../utils'
import { CheckIcon, ClockIcon, DoubleCheckIcon, ErrorIcon, SendIcon } from './Icons'

interface Props {
  chat: Chat
  onSend: (text: string) => void
}

const STATUS: Record<MessageStatus, { icon: ReactNode; title: string }> = {
  pending: { icon: <ClockIcon />, title: 'Отправляется' },
  sent: { icon: <CheckIcon />, title: 'Отправлено' },
  delivered: { icon: <DoubleCheckIcon />, title: 'Доставлено' },
  read: { icon: <DoubleCheckIcon />, title: 'Прочитано' },
  failed: { icon: <ErrorIcon />, title: 'Не отправлено' },
}

export function ChatWindow({ chat, onSend }: Props) {
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [chat.id, chat.messages.length])

  function submit(e?: FormEvent) {
    e?.preventDefault()
    const message = text.trim()
    if (!message) return
    onSend(message)
    setText('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) submit(e)
  }

  return (
    <section className="chat">
      <header className="chat__header">
        <div className="avatar">{avatarLabel(chat.name)}</div>
        <div>
          <div className="chat__name">{chat.name}</div>
          <div className="chat__sub">Telegram</div>
        </div>
      </header>

      <div className="chat__messages">
        {chat.messages.length === 0 && <div className="placeholder">Сообщений пока нет. Напишите первым!</div>}
        {chat.messages.map((m) => (
          <div key={m.id} className={`bubble ${m.outgoing ? 'bubble--out' : 'bubble--in'}`}>
            <span className="bubble__text">{m.text}</span>
            <span className="bubble__meta">
              {formatTime(m.timestamp)}
              {m.outgoing && m.status && (
                <span className={`status status--${m.status}`} title={STATUS[m.status].title}>
                  {STATUS[m.status].icon}
                </span>
              )}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="composer" onSubmit={submit}>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение…"
          maxLength={4096}
          autoFocus
        />
        <button type="submit" className="icon-button" disabled={!text.trim()} title="Отправить" aria-label="Отправить">
          <SendIcon />
        </button>
      </form>
    </section>
  )
}
