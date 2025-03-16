'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const GetStarted = () => {
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (isLogin) {
        // Login request
        const response = await fetch(`${apiUrl}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.email, // Using email as username
            password: formData.password
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Login failed')
        }
        
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', data.user_id)
        
        // Redirect to dashboard or home
        router.push('/chat')
      } else {
        // Signup request
        const response = await fetch(`${apiUrl}/api/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.name,
            email: formData.email,
            password: formData.password
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Signup failed')
        }
        
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', data.user_id)
        
        // Redirect to dashboard or home
        router.push('/chat')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-black mb-6">
        {isLogin ? 'Welcome Back' : 'Get Started with Invender AI'}
      </h1>
      
      {/* Toggle buttons */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-center font-medium ${!isLogin ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-center font-medium ${isLogin ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
        >
          Login
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isLogin ? (
        // Login Form
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors cursor-pointer disabled:bg-gray-400"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      ) : (
        // Registration Form
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Create a password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors cursor-pointer disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}
    </div>
  )
}

export default GetStarted 