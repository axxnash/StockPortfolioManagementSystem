import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.register(fullName, email, password)
      localStorage.setItem('token', response.token)
      onLogin()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left Column - Features */}
      <div className="auth-left">
        <div className="logo-section">
          <span className="logo-icon">📈</span>
          <h1 className="app-title">StockFolio Manager</h1>
        </div>
        
        <p className="app-description">
          Create your account to start tracking your stock portfolio and manage your investments with ease.
        </p>

        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <div className="feature-content">
              <h3>Track Performance</h3>
              <p>Monitor your portfolio value and profit/loss in real-time</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <div className="feature-content">
              <h3>Visual Analytics</h3>
              <p>Interactive charts for portfolio distribution and trends</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">⬇️</div>
            <div className="feature-content">
              <h3>Export Data</h3>
              <p>Download your portfolio data in CSV format anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="form-subtitle">Sign up to start managing your portfolio</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <Label htmlFor="fullName">Full Name <span className="required">*</span></Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <Label htmlFor="email">Email Address <span className="required">*</span></Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <Label htmlFor="password">Password <span className="required">*</span></Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="create-btn">
              {loading ? 'Creating Account...' : 'Create Account'} →
            </Button>
          </form>

          <p className="signin-link">
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
