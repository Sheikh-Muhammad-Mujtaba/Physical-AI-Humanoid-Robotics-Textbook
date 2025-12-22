"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Send, X, Maximize2, MessageCircle, Sparkles } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

interface ChatRequest {
  query: string
  session_id: string
}

interface ChatResponse {
  message_id: string
  answer: string
  context: string[]
}

// Dynamically determine API URL based on environment
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8000'
    }
    return '/api'
  }
  return '/api'
}

async function sendChatMessage(
  query: string,
  sessionId: string
): Promise<ChatResponse> {
  const requestBody: ChatRequest = {
    query,
    session_id: sessionId,
  }

  const apiUrl = getApiUrl()
  const response = await fetch(`${apiUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "Failed to parse error response",
    }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

const SUGGESTED_QUESTIONS = [
  "What is Physical AI?",
  "What are hardware requirements?",
  "What is ROS 2?",
]

// Generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

interface ChatBotProps {
  selectedText?: string
}

export default function ChatBot({ selectedText }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "👋 Hi! I'm your Physical AI Assistant. Ask me anything about humanoid robotics and physical AI!",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [capturedText, setCapturedText] = useState(selectedText || "")

  // Generate session ID once per component mount
  const sessionId = useMemo(() => generateUUID(), [])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 0)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    setCapturedText(selectedText || "")
  }, [selectedText])

  const handleSendMessage = async (message: string, isSelectedText = false) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: isSelectedText ? `📌 About: "${message.substring(0, 50)}..."` : message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await sendChatMessage(message, sessionId)

      const botResponse: Message = {
        id: response.message_id || (Date.now() + 1).toString(),
        type: "bot",
        content: response.answer,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unable to get a response"}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const handleAskAboutSelection = () => {
    if (capturedText.trim()) {
      handleSendMessage(capturedText, true)
      setCapturedText("")
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#1cd98e] to-[#15a860] hover:from-[#19c380] hover:to-[#138f56] text-white shadow-lg shadow-[#1cd98e]/40 hover:shadow-xl hover:shadow-[#1cd98e]/60 flex items-center justify-center transition-all duration-300 hover:scale-110 z-40 group"
        aria-label="Open chat"
      >
        <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl shadow-black/20 flex flex-col z-40 overflow-hidden transition-all duration-300 border border-gray-200 ${
        isExpanded ? 'w-[900px] h-[600px]' : 'w-96 h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1cd98e] to-[#15a860] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Physical AI Assistant</h2>
            <p className="text-xs text-white/70">AI-powered learning companion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={isExpanded ? "Minimize" : "Expand"}
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg text-sm leading-relaxed font-medium transition-all ${
                message.type === "user"
                  ? "bg-gradient-to-br from-[#1cd98e] to-[#15a860] text-white rounded-br-none shadow-md hover:shadow-lg"
                  : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200 hover:bg-gray-150"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Suggested Questions - Show only on initial state */}
        {messages.length === 1 && !isLoading && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <p className="text-xs text-gray-500 font-semibold px-2">Quick Questions:</p>
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:border-[#1cd98e] hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group"
              >
                <span className="group-hover:text-[#1cd98e] transition-colors">+ {question}</span>
              </button>
            ))}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 px-4 py-3 rounded-lg rounded-bl-none flex gap-2 items-center">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 ml-1">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Text Banner - WhatsApp-style context */}
      {capturedText && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border-t-2 border-l-4 border-[#1cd98e] px-4 py-3.5 flex items-start gap-3 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 text-sm">📖</span>
              <p className="text-xs font-bold text-[#1cd98e] uppercase tracking-wider">Selected from book</p>
            </div>
            <p className="text-sm text-gray-700 italic bg-white/70 p-2 rounded border border-gray-200 line-clamp-2">
              "{capturedText.substring(0, 80)}{capturedText.length > 80 ? '...' : ''}"
            </p>
            <p className="text-xs text-gray-500 mt-1.5">This context will be included with your message.</p>
          </div>
          <button
            onClick={() => setCapturedText("")}
            disabled={isLoading}
            className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleSendMessage(inputValue)
              }
            }}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1cd98e]/50 focus:border-transparent transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#1cd98e] to-[#15a860] hover:from-[#19c380] hover:to-[#138f56] disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold hover:shadow-lg"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
