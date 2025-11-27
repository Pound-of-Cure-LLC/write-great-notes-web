'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createClient as createRegularClient } from '@supabase/supabase-js'

export default function TestAuthPage() {
  const [ssrResult, setSsrResult] = useState<string>('')
  const [regularResult, setRegularResult] = useState<string>('')

  const testSSRClient = async () => {
    setSsrResult('Testing SSR client...')
    const supabase = createClient()

    const timeout = new Promise((resolve) =>
      setTimeout(() => resolve({ error: { message: 'TIMEOUT: Promise never resolved' } }), 5000)
    )

    try {
      const result = await Promise.race([
        supabase.auth.signInWithPassword({
          email: 'mjweiner@gmail.com',
          password: 'Mjwmjw1!'
        }),
        timeout
      ]) as any

      if (result.error) {
        setSsrResult(`SSR Error: ${result.error.message}`)
      } else {
        setSsrResult(`SSR Success: ${result.data?.user?.email}`)
      }
    } catch (error) {
      setSsrResult(`SSR Exception: ${error}`)
    }
  }

  const testRegularClient = async () => {
    setRegularResult('Testing regular client...')
    const supabase = createRegularClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'mjweiner@gmail.com',
        password: 'Mjwmjw1!'
      })

      if (error) {
        setRegularResult(`Regular Error: ${error.message}`)
      } else {
        setRegularResult(`Regular Success: ${data?.user?.email}`)
      }
    } catch (error) {
      setRegularResult(`Regular Exception: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Client Test</h1>

      <div className="space-y-4">
        <div>
          <button
            onClick={testSSRClient}
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
          >
            Test SSR Client
          </button>
          <div className="mt-2">{ssrResult}</div>
        </div>

        <div>
          <button
            onClick={testRegularClient}
            className="px-4 py-2 bg-green-500 text-white rounded mr-4"
          >
            Test Regular Client
          </button>
          <div className="mt-2">{regularResult}</div>
        </div>
      </div>
    </div>
  )
}
