"use client"

import { useState } from "react"
import { InputWithRing } from '@/components/ui/input'

export default function TestingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Form submitted! Check console for data.')
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Testing Vercel Inputs</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="w-full">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <InputWithRing 
                id="name"
                placeholder="Enter your name" 
                value={formData.name}
                onChange={handleChange('name')}
              />
            </div>

            <div className="w-full">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <InputWithRing 
                id="email"
                placeholder="Enter your email" 
                value={formData.email}
                onChange={handleChange('email')}
              />
            </div>

            <div className="w-full">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <InputWithRing 
                id="message"
                placeholder="Enter your message" 
                value={formData.message}
                onChange={handleChange('message')}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Form Data:</h3>
          <pre className="text-xs text-gray-600">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}