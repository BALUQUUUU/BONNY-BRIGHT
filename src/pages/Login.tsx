import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import ForestBackdrop from '../components/ForestBackdrop'

const Login: React.FC = () => {
  const { logIn } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@') || password.length < 1) {
      setError('Enter your email and password to continue.')
      return
    }
    setError('')
    try {
      const signedInUser = await logIn(email.trim(), password)
      navigate(signedInUser?.onboarded ? '/home' : '/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not log you in. Please try again.')
    }
  }

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Enter the email on your account.')
      return
    }
    if (isSupabaseConfigured && supabase) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login` })
      if (resetError) {
        setError(resetError.message)
        return
      }
    }
    setSent(true)
  }

  return (
    <div className="forest-shell flex min-h-screen items-center justify-center px-5 py-12">
      <ForestBackdrop />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl text-cream-100">
            Bonny <span className="text-gold-light">&amp;</span> Bright
          </Link>
          <p className="mt-2 text-sm text-cream-300">
            {mode === 'login' ? 'Welcome back.' : 'Reset your password.'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={submit} className="card space-y-4 p-7">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-forest-700">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-forest-700">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
            </div>
            {error && <p className="text-xs font-medium text-clay">{error}</p>}
            <button type="submit" className="btn-primary w-full">
              Log in
            </button>
            <button type="button" onClick={() => setMode('forgot')} className="w-full text-center text-xs font-semibold text-forest-500 hover:underline">
              Forgot password?
            </button>
          </form>
        ) : (
          <form onSubmit={submitForgot} className="card space-y-4 p-7">
            {sent ? (
              <p className="text-sm text-forest-700">
                If an account exists for <strong>{email}</strong>, a reset link is on its way.
              </p>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-forest-700">Email</label>
                  <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                </div>
                {error && <p className="text-xs font-medium text-clay">{error}</p>}
                <button type="submit" className="btn-primary w-full">
                  Send reset link
                </button>
              </>
            )}
            <button type="button" onClick={() => setMode('login')} className="w-full text-center text-xs font-semibold text-forest-500 hover:underline">
              Back to log in
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-cream-300">
          New here?{' '}
          <Link to="/signup" className="font-semibold text-gold-light underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
