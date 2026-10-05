export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  text: string
  outgoing: boolean
  timestamp: number
  status?: MessageStatus
}

export interface Chat {
  id: string
  aliases: string[]
  name: string
  messages: Message[]
}

export interface Notification {
  receiptId: number
  body: {
    typeWebhook: string
    idMessage?: string
    timestamp?: number
    status?: string
    chatId?: string
    senderData?: {
      chatId: string
      chatName?: string
      sender?: string
      senderName?: string
    }
    messageData?: {
      typeMessage: string
      textMessageData?: { textMessage: string }
      extendedTextMessageData?: { text: string }
    }
  }
}
