'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FaSpinner } from 'react-icons/fa'

const AuthLayout = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          // No token, allow access to get-started page
          setLoading(false)
          return
        }
        
        // User has a token, verify it with backend
        const response = await fetch(`${apiUrl}/api/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          // Token is valid, redirect to chat if currently on get-started
          if (pathname === '/get-started') {
            router.push('/chat')
            return
          }
          // Otherwise, just finish loading
          setLoading(false)
        } else {
          // Token is invalid, clear it and stay on get-started
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          setLoading(false)
        }
      } catch (error) {
        console.error('Authentication error:', error)
        // On error, clear token
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router, pathname, apiUrl])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-grow flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
        
        {/* Footer */}
        <footer className="bg-black text-white py-6">
          <div className="container mx-auto px-6 text-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Invender AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-black text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Invender AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default AuthLayout