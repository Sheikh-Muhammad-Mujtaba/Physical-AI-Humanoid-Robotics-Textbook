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
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#1cd98e] via-[#17c97d] to-[#15a860] hover:from-[#2ee89f] hover:via-[#25d98d] hover:to-[#1db870] text-white shadow-xl shadow-[#1cd98e]/60 hover:shadow-2xl hover:shadow-[#1cd98e]/80 flex items-center justify-center transition-all duration-500 hover:scale-125 z-40 group backdrop-blur-sm border border-white/20 animate-pulse-glow"
        aria-label="Open chat"
      >
        <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300 animate-bounce-subtle" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1cd98e] to-transparent opacity-20 group-hover:opacity-40 transition-opacity blur-xl -z-10" />
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-[#1cd98e]/30 flex flex-col z-40 overflow-hidden transition-all duration-500 border border-white/20 hover:border-white/40 animate-slideIn ${
        isExpanded ? 'w-[900px] h-[600px]' : 'w-96 h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1cd98e] via-[#17c97d] to-[#15a860] text-white px-6 py-5 flex items-center justify-between flex-shrink-0 border-b border-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group hover:bg-white/30 transition-all duration-300 shadow-lg shadow-white/20">
            <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight drop-shadow-lg">Physical AI Assistant</h2>
            <p className="text-xs text-white/80 font-medium">AI-powered learning companion ✨</p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 border border-transparent hover:border-white/30 hover:shadow-lg hover:shadow-white/20"
            aria-label={isExpanded ? "Minimize" : "Expand"}
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 border border-transparent hover:border-white/30 hover:shadow-lg hover:shadow-white/20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/50 via-white/30 to-white/50 backdrop-blur-sm">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fadeIn group`}
          >
            <div
              className={`max-w-xs px-5 py-3 rounded-2xl text-sm leading-relaxed font-medium transition-all duration-300 backdrop-blur-md border ${
                message.type === "user"
                  ? "bg-gradient-to-br from-[#1cd98e] via-[#17c97d] to-[#15a860] text-white rounded-br-none shadow-lg shadow-[#1cd98e]/40 hover:shadow-2xl hover:shadow-[#1cd98e]/60 hover:scale-105 border-white/20 group-hover:border-white/40"
                  : "bg-white/20 text-gray-900 rounded-bl-none border border-white/30 hover:bg-white/30 hover:shadow-lg hover:shadow-white/20 group-hover:border-white/50 hover:scale-105"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Suggested Questions - Show only on initial state */}
        {messages.length === 1 && !isLoading && (
          <div className="mt-6 pt-6 border-t border-white/30 space-y-3 animate-slideUp">
            <p className="text-xs text-white/70 font-bold px-2 uppercase tracking-widest">✨ Quick Questions:</p>
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold bg-white/10 backdrop-blur-md border border-white/30 text-gray-900 hover:bg-gradient-to-r hover:from-[#1cd98e]/20 hover:to-[#15a860]/20 hover:border-[#1cd98e]/60 transition-all duration-300 group hover:shadow-lg hover:shadow-[#1cd98e]/30 hover:scale-105"
              >
                <span className="group-hover:text-[#1cd98e] transition-colors font-medium">✦ {question}</span>
              </button>
            ))}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white/20 backdrop-blur-md px-5 py-4 rounded-2xl rounded-bl-none flex gap-3 items-center border border-white/30 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 transition-all">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 bg-gradient-to-b from-[#1cd98e] to-[#15a860] rounded-full animate-bounce shadow-lg shadow-[#1cd98e]/50"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-900 ml-2 tracking-wide">Thinking<span className="animate-pulse">...</span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Text Banner - Web3 style context */}
      {capturedText && (
        <div className="bg-gradient-to-r from-[#1cd98e]/20 via-[#17c97d]/15 to-[#15a860]/20 backdrop-blur-md border-t-2 border-l-4 border-[#1cd98e] px-5 py-4 flex items-start gap-4 shadow-lg shadow-[#1cd98e]/20 hover:shadow-xl hover:shadow-[#1cd98e]/30 transition-all animate-slideDown">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-6 h-6 text-sm bg-white/20 rounded-lg">📖</span>
              <p className="text-xs font-bold text-[#1cd98e] uppercase tracking-widest drop-shadow-sm">✦ Selected from book</p>
            </div>
            <p className="text-sm text-gray-900 italic bg-white/40 backdrop-blur-sm p-3 rounded-lg border border-white/50 line-clamp-2 shadow-sm hover:bg-white/50 transition-all font-medium">
              "{capturedText.substring(0, 80)}{capturedText.length > 80 ? '...' : ''}"
            </p>
            <p className="text-xs text-gray-700 mt-2 font-medium">⚡ This context will be included with your message.</p>
          </div>
          <button
            onClick={() => setCapturedText("")}
            disabled={isLoading}
            className="flex-shrink-0 mt-1 text-gray-600 hover:text-[#1cd98e] hover:bg-white/20 hover:shadow-lg hover:shadow-[#1cd98e]/30 p-2 rounded-lg transition-all duration-300 border border-transparent hover:border-white/30"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-white/20 p-4 bg-white/10 backdrop-blur-md flex-shrink-0">
        <div className="flex gap-3">
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
            className="flex-1 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1cd98e]/70 focus:border-white/50 transition-all duration-300 disabled:opacity-50 hover:bg-white/30 hover:border-white/40 font-medium shadow-lg shadow-white/10 focus:shadow-xl focus:shadow-[#1cd98e]/30"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            className="px-5 py-3 bg-gradient-to-r from-[#1cd98e] via-[#17c97d] to-[#15a860] hover:from-[#2ee89f] hover:via-[#25d98d] hover:to-[#1db870] disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold hover:shadow-xl hover:shadow-[#1cd98e]/50 active:scale-95 border border-white/20 hover:border-white/40 shadow-lg"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 hover:rotate-12 transition-transform" />
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
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(28, 217, 142, 0.6), 0 0 40px rgba(28, 217, 142, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(28, 217, 142, 0.8), 0 0 60px rgba(28, 217, 142, 0.5);
          }
        }
        @keyframes bounceSubtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        .animate-pulse-glow {
          animation: pulseGlow 3s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 2s ease-in-out infinite;
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
