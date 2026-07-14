
import { useCallback, useEffect, useRef, useState } from 'react'
import { askAI, type ChatMessage } from '../ai/openai'
import { useVoiceSession } from './useVoiceSession'
import { speak, stopSpeaking } from '../utils/tts'
import { trimMessages } from '../utils/trimMessages'
import { loadMessages, saveMessages } from '../utils/chatStorage'
import { PHASE_LABELS } from './types'
import { ChatMessageBubble } from '../components/ChatMessage'
import { InputBar } from '../components/InputBar'
import { combineAbortSignals, createTimeoutSignal, isTimeoutAbort } from '../utils/withTimeout'

const SAVE_DEBOUNCE_MS = 300
const API_TIMEOUT_MS = 60_000

export default function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [historyReady, setHistoryReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef(messages)
  const abortControllerRef = useRef<AbortController | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const flushSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    void saveMessages(messagesRef.current)
  }, [])

  useEffect(() => {
    void loadMessages().then((stored) => {
      setMessages(stored)
      setHistoryReady(true)
    })
  }, [])

  useEffect(() => {
    if (!historyReady) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null
      void saveMessages(messages)
    }, SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
        void saveMessages(messages)
      }
    }
  }, [messages, historyReady])

  useEffect(() => {
    if (!historyReady) return

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushSave()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', flushSave)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', flushSave)
    }
  }, [historyReady, flushSave])

  const handleVoiceSend = useCallback(async (text: string, signal?: AbortSignal) => {
    setError(null)
    const userMessage: ChatMessage = { role: 'user', content: text }
    const nextMessages = trimMessages([...messagesRef.current, userMessage])
    setMessages(nextMessages)
    const reply = await askAI(nextMessages, signal)
    setMessages([...nextMessages, { role: 'assistant', content: reply }])
    return reply
  }, [])

  const voice = useVoiceSession({
    onSend: handleVoiceSend,
    onInputPreview: setInput,
  })

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, voice.phase])

  const sendText = async () => {
    const text = input.trim()
    if (!text || voice.isBusy) return

    stopSpeaking()
    await voice.stop()
    setError(null)

    const userMessage: ChatMessage = { role: 'user', content: text }
    const nextMessages = trimMessages([...messages, userMessage])
    setMessages(nextMessages)
    setInput('')

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    const userSignal = abortControllerRef.current.signal
    const { signal: timeoutSignal, clear: clearTimeoutTimer } = createTimeoutSignal(API_TIMEOUT_MS)
    const signal = combineAbortSignals([userSignal, timeoutSignal])

    try {
      const reply = await askAI(nextMessages, signal)
      clearTimeoutTimer()
      setMessages([...nextMessages, { role: 'assistant', content: reply }])
      void speak(reply)
    } catch (err) {
      clearTimeoutTimer()
      if (userSignal.aborted && !isTimeoutAbort(signal)) return
      const message =
        isTimeoutAbort(signal) || isTimeoutAbort(userSignal)
          ? '请求超时，请重试'
          : err instanceof Error
            ? err.message
            : '请求失败，请稍后重试'
      setError(message)
    }
  }

  const handleStopSpeaking = () => {
    if (voice.autoVoiceMode && voice.phase === 'speaking') {
      void voice.skipSpeakingAndContinue()
      return
    }
    stopSpeaking()
  }

  const displayError = error ?? voice.error

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <div>
            <h1>免费库存语音助手</h1>
            <p>本机识别 · 不使用 OpenAI 额度</p>
          </div>
          <div className="header-actions">
            <span className={`phase-pill phase-pill-${voice.phase}`}>{PHASE_LABELS[voice.phase]}</span>
          </div>
        </div>
      </header>

      <main className="chat-area" ref={listRef}>
        {messages.length === 0 && !voice.isBusy && (
          <div className="empty-state">
            <p>点 🎤 说库存命令（Android 弹出系统“请说话”界面属正常）</p>
            <p className="empty-hint">支持进货、出货、收入、欠款及库存查询；不会消耗你的 AI 额度</p>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessageBubble key={`${message.role}-${index}`} message={message} />
        ))}

        {voice.phase === 'thinking' && (
          <div className="loading-row">
            <span className="loading-dot" />
            正在处理库存指令...
          </div>
        )}
      </main>

      {displayError && (
        <div className="error-banner">
          {displayError}
          {voice.error && (
            <button type="button" className="error-dismiss" onClick={voice.dismissError}>
              关闭
            </button>
          )}
        </div>
      )}

      <InputBar
        input={input}
        loading={voice.isBusy}
        listening={voice.isListening}
        autoVoiceMode={voice.autoVoiceMode}
        phase={voice.phase}
        onInputChange={setInput}
        onSend={sendText}
        onVoiceStart={voice.start}
        onVoiceStop={voice.stop}
        onAutoVoiceToggle={voice.toggleAutoVoiceMode}
        onStopSpeaking={handleStopSpeaking}
      />

    </div>
  )
}
