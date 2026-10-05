import type { Chat, Message, MessageStatus, Notification } from './types'

export type ChatsAction =
  | { type: 'createChat'; chatId: string; name: string }
  | { type: 'addPending'; chatId: string; tempId: string; text: string }
  | { type: 'sendSucceeded'; chatId: string; tempId: string; idMessage: string }
  | { type: 'sendFailed'; chatId: string; tempId: string }
  | { type: 'notification'; notification: Notification }

export const findChat = (chats: Chat[], chatId: string) =>
  chats.find((c) => c.id === chatId || c.aliases.includes(chatId))

function updateChat(chats: Chat[], chatId: string, fn: (chat: Chat) => Chat): Chat[] {
  return chats.map((c) => (c.id === chatId ? fn(c) : c))
}

function updateMessage(chat: Chat, id: string, patch: Partial<Message>): Chat {
  return { ...chat, messages: chat.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }
}

function upsertMessage(chats: Chat[], chatId: string, name: string, message: Message): Chat[] {
  const chat = findChat(chats, chatId)
  if (!chat) return [{ id: chatId, aliases: [], name, messages: [message] }, ...chats]
  if (chat.messages.some((m) => m.id === message.id)) return chats
  return updateChat(chats, chat.id, (c) => ({ ...c, messages: [...c.messages, message] }))
}

function messageText(data: NonNullable<Notification['body']['messageData']>): string | null {
  if (data.typeMessage === 'textMessage') return data.textMessageData?.textMessage ?? null
  if (data.typeMessage === 'extendedTextMessage') return data.extendedTextMessageData?.text ?? null
  return null
}

const STATUSES: MessageStatus[] = ['sent', 'delivered', 'read', 'failed']

function applyNotification(chats: Chat[], { body }: Notification): Chat[] {
  const timestamp = (body.timestamp ?? Date.now() / 1000) * 1000

  switch (body.typeWebhook) {
    case 'incomingMessageReceived':
    case 'outgoingMessageReceived': {
      if (!body.senderData || !body.messageData || !body.idMessage) return chats
      const text = messageText(body.messageData)
      if (text === null) return chats
      const { chatId, chatName, senderName } = body.senderData
      return upsertMessage(chats, chatId, chatName || senderName || chatId, {
        id: body.idMessage,
        text,
        outgoing: body.typeWebhook === 'outgoingMessageReceived',
        timestamp,
        status: body.typeWebhook === 'outgoingMessageReceived' ? 'sent' : undefined,
      })
    }

    case 'outgoingAPIMessageReceived': {
      const realChatId = body.senderData?.chatId
      const text = body.messageData ? messageText(body.messageData) : null
      if (!realChatId || !body.idMessage) return chats
      const chat =
        chats.find((c) => c.messages.some((m) => m.id === body.idMessage)) ??
        chats.find((c) => c.messages.some((m) => m.status === 'pending' && m.text === text))
      if (!chat || chat.id === realChatId || chat.aliases.includes(realChatId)) return chats
      return updateChat(chats, chat.id, (c) => ({ ...c, aliases: [...c.aliases, realChatId] }))
    }

    case 'outgoingMessageStatus': {
      const status = body.status as MessageStatus
      if (!body.idMessage || !STATUSES.includes(status)) return chats
      const chat = chats.find((c) => c.messages.some((m) => m.id === body.idMessage))
      if (!chat) return chats
      return updateChat(chats, chat.id, (c) => updateMessage(c, body.idMessage!, { status }))
    }

    default:
      return chats
  }
}

export function chatsReducer(chats: Chat[], action: ChatsAction): Chat[] {
  switch (action.type) {
    case 'createChat':
      if (findChat(chats, action.chatId)) return chats
      return [{ id: action.chatId, aliases: [], name: action.name, messages: [] }, ...chats]

    case 'addPending':
      return updateChat(chats, action.chatId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { id: action.tempId, text: action.text, outgoing: true, timestamp: Date.now(), status: 'pending' },
        ],
      }))

    case 'sendSucceeded':
      return updateChat(chats, action.chatId, (c) =>
        updateMessage(c, action.tempId, { id: action.idMessage, status: 'sent' }),
      )

    case 'sendFailed':
      return updateChat(chats, action.chatId, (c) => updateMessage(c, action.tempId, { status: 'failed' }))

    case 'notification':
      return applyNotification(chats, action.notification)
  }
}
