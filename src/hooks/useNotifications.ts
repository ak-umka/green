import { useEffect, useRef, useState } from 'react'
import { deleteNotification, describeError, receiveNotification } from '../api/greenApi'
import type { Credentials, Notification } from '../types'

const RETRY_DELAY_MS = 3000

export function useNotifications(creds: Credentials, onNotification: (n: Notification) => void) {
  const [error, setError] = useState<string | null>(null)
  const handlerRef = useRef(onNotification)
  useEffect(() => {
    handlerRef.current = onNotification
  }, [onNotification])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function loop() {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(creds, signal)
          setError(null)
          if (!notification) continue
          handlerRef.current(notification)
          await deleteNotification(creds, notification.receiptId)
        } catch (e) {
          if (signal.aborted) return
          setError(describeError(e))
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        }
      }
    }

    loop()
    return () => controller.abort()
  }, [creds])

  return error
}
