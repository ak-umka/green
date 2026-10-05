import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { sendMessage } from './api/greenApi'
import { chatsReducer } from './chatsReducer'
import { ChatWindow } from './components/ChatWindow'
import { LoginForm } from './components/LoginForm'
import { Sidebar } from './components/Sidebar'
import { useNotifications } from './hooks/useNotifications'
import type { Chat, Credentials, Notification } from './types'

const CREDS_KEY = 'green-api:credentials'
const chatsKey = (idInstance: string) => `green-api:chats:${idInstance}`

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(() => load(CREDS_KEY, null))

  function login(c: Credentials) {
    localStorage.setItem(CREDS_KEY, JSON.stringify(c))
    setCreds(c)
  }

  function logout() {
    localStorage.removeItem(CREDS_KEY)
    setCreds(null)
  }

  if (!creds) return <LoginForm onLogin={login} />
  return <Messenger key={creds.idInstance} creds={creds} onLogout={logout} />
}

function phoneToChatId(phone: string) {
  return `${phone.replace(/\D/g, '')}@c.us`
}

const lastActivity = (chat: Chat) => chat.messages[chat.messages.length - 1]?.timestamp ?? 0

function Messenger({ creds, onLogout }: { creds: Credentials; onLogout: () => void }) {
  const [chats, dispatch] = useReducer(chatsReducer, [], () => load<Chat[]>(chatsKey(creds.idInstance), []))
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(chatsKey(creds.idInstance), JSON.stringify(chats))
  }, [chats, creds.idInstance])

  const handleNotification = useCallback((notification: Notification) => {
    dispatch({ type: 'notification', notification })
  }, [])
  const pollingError = useNotifications(creds, handleNotification)

  const sortedChats = useMemo(() => [...chats].sort((a, b) => lastActivity(b) - lastActivity(a)), [chats])
  const activeChat = chats.find((c) => c.id === activeChatId) ?? null

  function createChat(phone: string) {
    const chatId = phoneToChatId(phone)
    const existing = chats.find((c) => c.id === chatId || c.aliases.includes(chatId))
    if (!existing) dispatch({ type: 'createChat', chatId, name: `+${chatId.replace('@c.us', '')}` })
    setActiveChatId(existing?.id ?? chatId)
  }

  async function send(text: string) {
    if (!activeChat) return
    const chatId = activeChat.id
    const tempId = `pending-${crypto.randomUUID()}`
    dispatch({ type: 'addPending', chatId, tempId, text })
    try {
      const { idMessage } = await sendMessage(creds, chatId, text)
      dispatch({ type: 'sendSucceeded', chatId, tempId, idMessage })
    } catch {
      dispatch({ type: 'sendFailed', chatId, tempId })
    }
  }

  return (
    <div className="app">
      <Sidebar
        chats={sortedChats}
        activeChatId={activeChatId}
        onSelect={setActiveChatId}
        onCreate={createChat}
        onLogout={onLogout}
      />
      <main className="main">
        {pollingError && <div className="banner">Не удаётся получить новые сообщения: {pollingError}. Повторяем попытку…</div>}
        {activeChat ? (
          <ChatWindow key={activeChat.id} chat={activeChat} onSend={send} />
        ) : (
          <div className="placeholder">Выберите чат или создайте новый по номеру телефона</div>
        )}
      </main>
    </div>
  )
}
