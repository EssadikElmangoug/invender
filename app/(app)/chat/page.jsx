'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Invender AI. How can I assist you today?", sender: 'ai' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()
  
  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/get-started')
    }
  }, [router])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim()) return
    
    // Add user message to chat
    const userMessage = { id: messages.length + 1, text: inputMessage, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = { 
        id: messages.length + 2, 
        text: "I'm processing your request. This is a placeholder response that would normally come from your AI backend.",
        sender: 'ai' 
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
    
    // Actual API implementation would look like:
    /*
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: inputMessage })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessages(prev => [...prev, { 
          id: messages.length + 2, 
          text: data.response, 
          sender: 'ai' 
        }])
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        id: messages.length + 2, 
        text: "Sorry, I encountered an error processing your request.", 
        sender: 'ai' 
      }])
    } finally {
      setIsLoading(false)
    }
    */
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-black">Invender AI</h1>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            router.push('/')
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </header>
      
      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.sender === 'user' 
                    ? 'bg-black text-white rounded-tr-none' 
                    : 'bg-white text-black border border-gray-200 rounded-tl-none shadow-sm'
                }`}
              >
                <p className="text-sm md:text-base">{message.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white text-black border border-gray-200 rounded-lg rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-black text-white px-6 py-2 rounded-r-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage 