import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ForestBackdrop from '../components/ForestBackdrop'

const SignUp: React.FC = () => {
  const { signUp } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.includes('@') || password.length < 6) {
      setError('Please enter your name, a valid email, and a password of at least 6 characters.')
      return
    }
    setError('')
    try {
      const result = await signUp(name.trim(), email.trim(), password)
      if (result.requiresEmailConfirmation) {
        setError('Check your email to confirm your account, then log in to continue.')
        return
      }
      navigate('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not create your account. Please try again.')
    }
  }

  return (
    <div className="forest-shell flex min-h-screen items-center justify-center px-5 py-12">
      <ForestBackdrop />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl text-cream-100">
            Bonny <span className="text-gold-light">&amp;</span> Bright
          </Link>
          <p className="mt-2 text-sm text-cream-300">Create your account to build your skin profile.</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-7">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-forest-700">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-forest-700">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-forest-700">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          {error && <p className="text-xs font-medium text-clay">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Create account
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-cream-300">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-gold-light underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp
