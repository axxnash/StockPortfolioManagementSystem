import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function DashboardPage({ onLogout }) {
  const navigate = useNavigate()
  const [portfolioData, setPortfolioData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch portfolio data
    setPortfolioData({
      totalValue: 0,
      holdings: [],
      pnl: 0
    })
    setLoading(false)
  }, [])

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <h2>Welcome to your portfolio</h2>
        <p>Portfolio management features coming soon...</p>
      </div>
    </div>
  )
}

export default DashboardPage
