'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaSpinner } from 'react-icons/fa'

const Layout = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          // If no token found, redirect to get-started
          router.push('/get-started')
          return
        }
        
        // Verify token with backend
        const response = await fetch(`${apiUrl}/api/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          // Token is invalid, clear it and redirect
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          router.push('/get-started')
          return
        }
        
        // Token is valid, continue to the app
        setLoading(false)
      } catch (error) {
        console.error('Authentication error:', error)
        // On error, clear token and redirect to get-started
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        router.push('/get-started')
      }
    }
    
    verifyToken()
  }, [router, apiUrl])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    )
  }

  return <div>{children}</div>
}

export default Layout