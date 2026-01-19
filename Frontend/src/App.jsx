import { useState, useEffect } from 'react'
import {
  TrendingUp,
  PieChart,
  Download,
  Info,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Shield,
  Lock,
  User,
  ChevronDown,
  BarChart3,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Save,
} from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Checkbox } from './components/ui/checkbox'
import { Label } from './components/ui/label'
import { Card } from './components/ui/card'
import { useAuth } from './hooks/useAuth'
import { stocksAPI, brokersAPI, holdingsAPI, analyticsAPI, userAPI } from './services/api'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement)

function DashboardView() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [stocks, setStocks] = useState([])
  const [brokers, setBrokers] = useState([])
  const [userName, setUserName] = useState('')

  useEffect(() => {
    loadDashboardData()
    loadStocksAndBrokers()
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const profile = await userAPI.getProfile()
      setUserName(profile.name || '')
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  const loadStocksAndBrokers = async () => {
    try {
      const [stocksData, brokersData] = await Promise.all([
        stocksAPI.list(),
        brokersAPI.list(),
      ])
      setStocks(stocksData)
      setBrokers(brokersData)
    } catch (err) {
      console.error('Failed to load stocks/brokers:', err)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analyticsAPI.dashboard()
      setDashboardData(data)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (holding) => {
    setEditingId(holding.portfolio_id)
    setEditFormData({
      stock_id: holding.stock_id,
      broker_id: holding.broker_id,
      quantity: holding.quantity,
      invested: holding.invested,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditFormData({})
  }

  const handleSaveEdit = async (portfolioId) => {
    try {
      await holdingsAPI.update(
        portfolioId,
        editFormData.broker_id,
        editFormData.stock_id,
        parseFloat(editFormData.quantity),
        parseFloat(editFormData.invested)
      )
      setEditingId(null)
      setEditFormData({})
      await loadDashboardData()
    } catch (err) {
      alert('Failed to update holding: ' + err.message)
    }
  }

  const handleDelete = async (portfolioId) => {
    if (!confirm('Are you sure you want to delete this holding?')) {
      return
    }
    try {
      await holdingsAPI.remove(portfolioId)
      await loadDashboardData()
    } catch (err) {
      alert('Failed to delete holding: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!dashboardData || !dashboardData.holdings || dashboardData.holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-500">No holdings found. Add stocks to your portfolio to see your dashboard.</p>
      </div>
    )
  }

  // Group holdings by broker for the broker table
  const brokerMap = {}
  dashboardData.holdings.forEach(holding => {
    const brokerName = holding.broker_name || 'Unknown'
    if (!brokerMap[brokerName]) {
      brokerMap[brokerName] = {
        name: brokerName,
        holdings: 0,
        totalValue: 0,
        totalPnL: 0,
      }
    }
    brokerMap[brokerName].holdings += 1
    brokerMap[brokerName].totalValue += holding.value || 0
    brokerMap[brokerName].totalPnL += holding.pnl || 0
  })

  const brokerStats = Object.values(brokerMap)

  // Prepare chart data
  const distributionLabels = dashboardData.distribution?.map(d => d.label) || []
  const distributionValues = dashboardData.distribution?.map(d => d.value) || []
  const doughnutData = {
    labels: distributionLabels,
    datasets: [
      {
        data: distributionValues,
        backgroundColor: ['#1d4ed8', '#22c55e', '#f59e0b', '#ef4444', '#6366f1', '#a855f7', '#f97316'],
        borderWidth: 0,
      },
    ],
  }

  const pnlLabels = dashboardData.pnlBySymbol?.map(p => p.symbol) || []
  const pnlValues = dashboardData.pnlBySymbol?.map(p => p.pnl) || []
  const profitLossData = {
    labels: pnlLabels,
    datasets: [
      {
        label: 'Profit/Loss',
        data: pnlValues,
        backgroundColor: (ctx) => {
          const value = ctx.raw
          return value >= 0 ? '#22c55e' : '#ef4444'
        },
        borderRadius: 6,
      },
    ],
  }

  // Build portfolio value trend based on when holdings were added
  const buildValueTrend = () => {
    const holdings = dashboardData.holdings || []
    if (holdings.length === 0) {
      return {
        labels: ['No Data'],
        data: [0]
      }
    }

    // Sort holdings by creation date
    const sortedHoldings = [...holdings].sort((a, b) => {
      const dateA = new Date(a.date_created || 0)
      const dateB = new Date(b.date_created || 0)
      return dateA - dateB
    })

    // Build cumulative value over time
    const timeline = []
    let cumulativeValue = 0

    sortedHoldings.forEach((holding, index) => {
      cumulativeValue += (holding.value || 0)
      const date = holding.date_created ? new Date(holding.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Stock ${index + 1}`
      timeline.push({
        label: date,
        value: cumulativeValue
      })
    })

    // Add current total as the last point if we have multiple holdings
    if (timeline.length > 0 && timeline.length === sortedHoldings.length) {
      timeline[timeline.length - 1] = {
        label: 'Current',
        value: dashboardData.summary.totalValue
      }
    }

    return {
      labels: timeline.map(t => t.label),
      data: timeline.map(t => t.value)
    }
  }

  const trendData = buildValueTrend()
  const valueTrendData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: trendData.data,
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const summary = dashboardData.summary || {}
  const totalPnLPercent = summary.totalCost > 0 
    ? ((summary.totalPnL / summary.totalCost) * 100).toFixed(2)
    : '0.00'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {userName ? `Welcome back, ${userName}!` : 'Portfolio Dashboard'}
        </h1>
        <p className="text-sm text-gray-500">Track and manage your stock investments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Portfolio Value</p>
            <span className="text-xs text-gray-400">$</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">${(summary.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Profit/Loss</p>
            <TrendingUp className={`w-4 h-4 ${(summary.totalPnL || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
          <div>
            <p className={`text-2xl font-semibold text-gray-900 ${(summary.totalPnL || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${(summary.totalPnL || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`text-xs font-medium mt-1 ${(summary.totalPnL || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent}%
            </p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Holdings</p>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{summary.holdingsCount || 0}</p>
        </Card>
      </div>

      {/* Detailed Holdings Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">All Holdings</h3>
          <p className="text-xs text-gray-500 mt-1">Manage your individual stock positions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Broker</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Buy Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">P/L</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData.holdings.map((holding) => {
                const isEditing = editingId === holding.portfolio_id
                return (
                  <tr key={holding.portfolio_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editFormData.stock_id}
                          onChange={(e) => setEditFormData({ ...editFormData, stock_id: e.target.value })}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          {stocks.map((stock) => (
                            <option key={stock.stock_id} value={stock.stock_id}>
                              {stock.stock_symbol}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900">{holding.stock_symbol}</p>
                          <p className="text-xs text-gray-500">{holding.stock_name}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editFormData.broker_id}
                          onChange={(e) => setEditFormData({ ...editFormData, broker_id: e.target.value })}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          {brokers.map((broker) => (
                            <option key={broker.broker_id} value={broker.broker_id}>
                              {broker.broker_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-700">{holding.broker_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.quantity}
                          onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                          className="w-20 text-xs text-right border border-gray-300 rounded px-2 py-1"
                          step="0.01"
                        />
                      ) : (
                        <span className="text-gray-900">{holding.quantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFormData.invested}
                          onChange={(e) => setEditFormData({ ...editFormData, invested: e.target.value })}
                          className="w-24 text-xs text-right border border-gray-300 rounded px-2 py-1"
                          step="0.01"
                        />
                      ) : (
                        <span className="text-gray-900">${holding.invested?.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      ${holding.current_price?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ${holding.value?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <span className={`font-medium ${holding.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {holding.pnl >= 0 ? '+' : ''}${holding.pnl?.toFixed(2)}
                        </span>
                        <p className={`text-xs ${holding.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {holding.pnl_percent >= 0 ? '+' : ''}{holding.pnl_percent?.toFixed(2)}%
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(holding.portfolio_id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(holding)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(holding.portfolio_id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Portfolio Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={doughnutData}
              options={{
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { boxWidth: 10, boxHeight: 10, font: { size: 10 } },
                  },
                },
                cutout: '65%',
              }}
            />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Profit &amp; Loss Analysis</h3>
          <div className="h-64">
            <Bar
              data={profitLossData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: '#f3f4f6' } },
                },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

function AddStockView() {
  const [stocks, setStocks] = useState([])
  const [brokers, setBrokers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({
    stock_id: '',
    broker_id: '',
    quantity: '',
    invested: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [stocksData, brokersData] = await Promise.all([
        stocksAPI.list(),
        brokersAPI.list(),
      ])
      setStocks(stocksData)
      setBrokers(brokersData)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStockSelect = (stockId) => {
    setFormData({ ...formData, stock_id: stockId })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const calculateInvested = () => {
    const quantity = parseFloat(formData.quantity)
    const buyPrice = parseFloat(formData.invested)
    if (!isNaN(quantity) && !isNaN(buyPrice)) {
      return (quantity * buyPrice).toFixed(2)
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.stock_id || !formData.broker_id || !formData.quantity || !formData.invested) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const quantity = parseFloat(formData.quantity)
      const invested = parseFloat(formData.invested)

      if (isNaN(quantity) || quantity <= 0) {
        setError('Quantity must be a positive number')
        return
      }

      if (isNaN(invested) || invested < 0) {
        setError('Invested amount must be a non-negative number')
        return
      }

      // Backend expects invested as buy price per share, not total invested
      await holdingsAPI.add(
        formData.broker_id,
        formData.stock_id,
        quantity,
        invested
      )

      setSuccess('Stock added to portfolio successfully!')
      setFormData({
        stock_id: '',
        broker_id: '',
        quantity: '',
        invested: '',
      })
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to add stock to portfolio')
    }
  }

  const handleReset = () => {
    setFormData({
      stock_id: '',
      broker_id: '',
      quantity: '',
      invested: '',
    })
    setError(null)
    setSuccess(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading stocks and brokers...</p>
      </div>
    )
  }

  const selectedStock = stocks.find(s => s.stock_id === formData.stock_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Stock</h1>
          <p className="text-sm text-gray-500">Add a new stock to your investment portfolio.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Stock Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-xs text-gray-600 mb-1 block">Quick Select Popular Stock</Label>
                <select
                  value={formData.stock_id}
                  onChange={(e) => handleStockSelect(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  required
                >
                  <option value="">Select a stock...</option>
                  {stocks.map((stock) => (
                    <option key={stock.stock_id} value={stock.stock_id}>
                      {stock.stock_name} ({stock.stock_symbol}) - ${stock.price?.toFixed(2) || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStock && (
                <>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Stock Symbol</Label>
                    <Input value={selectedStock.stock_symbol} disabled />
                    <p className="text-[11px] text-gray-400 mt-1">Automatically filled</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Stock Name</Label>
                    <Input value={selectedStock.stock_name} disabled />
                    <p className="text-[11px] text-gray-400 mt-1">Automatically filled</p>
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <Label className="text-xs text-gray-600 mb-1 block">Broker Platform *</Label>
                <select
                  name="broker_id"
                  value={formData.broker_id}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  required
                >
                  <option value="">Select broker...</option>
                  {brokers.map((broker) => (
                    <option key={broker.broker_id} value={broker.broker_id}>
                      {broker.broker_name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Select the broker where you purchased this stock</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Purchase Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Quantity *</Label>
                <Input
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  step="0.01"
                  min="0.01"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">Number of shares</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Buy Price (USD) *</Label>
                <Input
                  name="invested"
                  type="number"
                  value={formData.invested}
                  onChange={handleInputChange}
                  placeholder="e.g., 150.50"
                  step="0.01"
                  min="0"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">Price per share</p>
                {formData.quantity && formData.invested && (
                  <p className="text-[11px] text-blue-600 mt-1">
                    Total Invested: ${calculateInvested()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
              <Button type="submit" className="w-full md:w-auto bg-blue-800 hover:bg-blue-900">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add to Portfolio
              </Button>
              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                className="w-full md:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Reset Form
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Tips for Adding Stocks</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900 text-xs mb-1">Accurate Data Entry</p>
                <p className="text-xs text-gray-500">
                  Ensure stock symbol, quantity, and buy price are entered correctly for accurate portfolio tracking.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-xs mb-1">Purchase Date</p>
                <p className="text-xs text-gray-500">
                  Record the actual purchase date to track your investment timeline and calculate holding periods.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-xs mb-1">Price Precision</p>
                <p className="text-xs text-gray-500">
                  Enter buy price with decimal precision (e.g., 150.50) for accurate profit/loss calculations.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-xs mb-1">Data Security</p>
                <p className="text-xs text-gray-500">
                  Your portfolio data is stored securely and remains private to your account only.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  )
}

function AnalyticsView() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analyticsAPI.dashboard()
      setAnalyticsData(data)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      // Get analytics data which includes calculated fields
      const data = await analyticsAPI.dashboard()
      const holdings = data.holdings || []
      
      // Convert to CSV
      const headers = ['Stock Symbol', 'Stock Name', 'Broker', 'Quantity', 'Buy Price', 'Current Price', 'Cost', 'Current Value', 'P/L', 'P/L %']
      const rows = holdings.map(h => [
        h.stock_symbol || '',
        h.stock_name || '',
        h.broker_name || '',
        h.quantity || 0,
        h.buy_price || h.invested || 0,
        h.current || h.current_price || 0,
        h.cost || 0,
        h.value || 0,
        h.pnl || 0,
        h.pnl_percent ? `${h.pnl_percent.toFixed(2)}%` : '0%'
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `portfolio-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export data: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!analyticsData || !analyticsData.holdings || analyticsData.holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-500">No holdings found. Add stocks to your portfolio to see analytics.</p>
      </div>
    )
  }

  const summary = analyticsData.summary || {}
  const holdings = analyticsData.holdings || []
  
  // Find best and worst performers
  const sortedByPnL = [...holdings].sort((a, b) => (b.pnl || 0) - (a.pnl || 0))
  const bestPerformer = sortedByPnL.length > 0 ? sortedByPnL[0] : null
  const worstPerformer = sortedByPnL.length > 1 ? sortedByPnL[sortedByPnL.length - 1] : (sortedByPnL.length === 1 ? sortedByPnL[0] : null)

  // Prepare chart data
  const distributionLabels = analyticsData.distribution?.map(d => d.label) || []
  const distributionValues = analyticsData.distribution?.map(d => d.value) || []
  const totalDistributionValue = distributionValues.reduce((a, b) => a + b, 0)
  const distributionPercentages = distributionValues.map(v => 
    totalDistributionValue > 0 ? ((v / totalDistributionValue) * 100).toFixed(1) : 0
  )

  const doughnutData = {
    labels: distributionLabels.map((label, i) => 
      `${label} (${distributionPercentages[i] !== undefined ? distributionPercentages[i] : 0}%)`
    ),
    datasets: [
      {
        data: distributionValues,
        backgroundColor: ['#1d4ed8', '#22c55e', '#a855f7', '#f97316', '#facc15', '#6366f1', '#ef4444'],
        borderWidth: 0,
      },
    ],
  }

  const pnlLabels = analyticsData.pnlBySymbol?.map(p => p.symbol) || []
  const pnlValues = analyticsData.pnlBySymbol?.map(p => p.pnl) || []
  const profitLossData = {
    labels: pnlLabels,
    datasets: [
      {
        label: 'Profit/Loss',
        data: pnlValues,
        backgroundColor: (ctx) => {
          const value = ctx.raw
          return value >= 0 ? '#22c55e' : '#ef4444'
        },
        borderRadius: 6,
      },
    ],
  }

  // Build portfolio value trend based on when holdings were added
  const buildValueTrend = () => {
    const holdings = analyticsData.holdings || []
    if (holdings.length === 0) {
      return {
        labels: ['No Data'],
        data: [0]
      }
    }

    // Sort holdings by creation date
    const sortedHoldings = [...holdings].sort((a, b) => {
      const dateA = new Date(a.date_created || 0)
      const dateB = new Date(b.date_created || 0)
      return dateA - dateB
    })

    // Build cumulative value over time
    const timeline = []
    let cumulativeValue = 0

    sortedHoldings.forEach((holding, index) => {
      cumulativeValue += (holding.value || 0)
      const date = holding.date_created ? new Date(holding.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Stock ${index + 1}`
      timeline.push({
        label: date,
        value: cumulativeValue
      })
    })

    // Add current total as the last point if we have multiple holdings
    if (timeline.length > 0 && timeline.length === sortedHoldings.length) {
      timeline[timeline.length - 1] = {
        label: 'Current',
        value: summary.totalValue
      }
    }

    return {
      labels: timeline.map(t => t.label),
      data: timeline.map(t => t.value)
    }
  }

  const trendData = buildValueTrend()
  const valueTrendData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: trendData.data,
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const totalPnLPercent = summary.totalCost > 0 
    ? ((summary.totalPnL / summary.totalCost) * 100).toFixed(2)
    : '0.00'
  const diversificationScore = holdings.length > 0 
    ? Math.min(100, Math.round((holdings.length / 10) * 100))
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio Analytics</h1>
          <p className="text-sm text-gray-500">Comprehensive visualization and performance analysis of your investments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {bestPerformer && (
          <Card className="p-4">
            <p className="text-xs text-gray-500 mb-1">Best Performer</p>
            <p className="text-sm font-semibold text-gray-900">{bestPerformer.stock_symbol || 'N/A'}</p>
            <p className="text-xs text-emerald-500 mt-1">
              {bestPerformer.pnl >= 0 ? '+' : ''}${(bestPerformer.pnl || 0).toFixed(2)} ({bestPerformer.pnl_percent ? (bestPerformer.pnl_percent >= 0 ? '+' : '') + bestPerformer.pnl_percent.toFixed(2) : '0.00'}%)
            </p>
          </Card>
        )}
        {worstPerformer && worstPerformer !== bestPerformer && (
          <Card className="p-4">
            <p className="text-xs text-gray-500 mb-1">Worst Performer</p>
            <p className="text-sm font-semibold text-gray-900">{worstPerformer.stock_symbol || 'N/A'}</p>
            <p className={`text-xs mt-1 ${(worstPerformer.pnl || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {worstPerformer.pnl >= 0 ? '+' : ''}${(worstPerformer.pnl || 0).toFixed(2)} ({worstPerformer.pnl_percent ? (worstPerformer.pnl_percent >= 0 ? '+' : '') + worstPerformer.pnl_percent.toFixed(2) : '0.00'}%)
            </p>
          </Card>
        )}
        <Card className="p-4">
          <p className="text-xs text-gray-500 mb-1">Total Gain/Loss</p>
          <p className={`text-sm font-semibold ${(summary.totalPnL || 0) >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            ${(summary.totalPnL || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-1 ${(summary.totalPnL || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent}%
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 mb-1">Diversification Score</p>
          <p className="text-sm font-semibold text-gray-900">{diversificationScore}%</p>
          <p className="text-xs text-gray-400 mt-1">{holdings.length} unique stocks</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 mb-1">Total Investment</p>
          <p className="text-sm font-semibold text-gray-900">
            ${(summary.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Initial capital deployed</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 mb-1">Current Value</p>
          <p className="text-sm font-semibold text-gray-900">
            ${(summary.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Current portfolio worth</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Portfolio Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={doughnutData}
              options={{
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { boxWidth: 10, boxHeight: 10, font: { size: 10 } },
                  },
                },
                cutout: '65%',
              }}
            />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Profit &amp; Loss Analysis</h3>
          <div className="h-64">
            <Bar
              data={profitLossData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: '#f3f4f6' } },
                },
              }}
            />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Portfolio Value Trend</h3>
        <div className="h-64">
          <Line
            data={valueTrendData}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: '#f3f4f6' } },
              },
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
          <div className="text-xs text-gray-500">
            Download your portfolio analytics data in CSV format for external analysis and record keeping.
          </div>
          <Button onClick={handleExport} className="bg-blue-800 hover:bg-blue-900 text-white text-sm px-4 py-2">
            Export to CSV
          </Button>
        </div>
      </Card>
    </div>
  )
}

function AccountView() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getProfile()
      setProfile(data)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (formData.newPassword && !formData.currentPassword) {
      setError('Current password is required to change password')
      return
    }

    try {
      await userAPI.updateProfile(
        formData.name,
        formData.email,
        formData.currentPassword || undefined,
        formData.newPassword || undefined
      )
      setSuccess('Profile updated successfully!')
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      await loadProfile()
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500">Manage your account information and preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Full Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Email Address *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password (Optional)</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Current Password</Label>
                <Input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-1 block">New Password</Label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Confirm New Password</Label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-blue-800 hover:bg-blue-900">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {profile && (
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Account Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Member Since:</span>
              <span className="text-gray-900">{new Date(profile.date_created).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">User ID:</span>
              <span className="text-gray-900 font-mono text-xs">{profile.user_id}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function App() {
  const { user, login, register, logout, loading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [view, setView] = useState('login') // 'login' | 'register' | 'dashboard' | 'addStock' | 'analytics' | 'account'
  const [authError, setAuthError] = useState(null)
  const [authLoadingState, setAuthLoadingState] = useState(false)

  useEffect(() => {
    if (user?.authenticated) {
      setView('dashboard')
    }
  }, [user])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoadingState(true)

    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const result = await login(email, password)
      if (result.success) {
        setView('dashboard')
      } else {
        setAuthError(result.error || 'Login failed')
      }
    } catch (error) {
      setAuthError(error.message || 'An error occurred during login')
    } finally {
      setAuthLoadingState(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoadingState(true)

    const formData = new FormData(e.target)
    const name = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const result = await register(name, email, password)
      if (result.success) {
        setView('dashboard')
      } else {
        setAuthError(result.error || 'Registration failed')
      }
    } catch (error) {
      setAuthError(error.message || 'An error occurred during registration')
    } finally {
      setAuthLoadingState(false)
    }
  }

  const handleLogout = () => {
    logout()
    setView('login')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Informational Section */}
          <div className="hidden lg:flex lg:flex-1 flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                StockPortfolio Manager
              </h1>
            </div>
            
            <p className="text-base text-gray-600 mb-10 leading-relaxed">
              Create your account to start tracking your stock portfolio and manage your investments with ease.
            </p>
            
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Track Performance
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Monitor your portfolio value and profit/loss in real-time
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <PieChart className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Visual Analytics
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Interactive charts for portfolio distribution and trends
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Download className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Export Data
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Download your portfolio data in CSV format anytime
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Register Form */}
          <div className="w-full lg:flex-1 flex items-center justify-center">
            <Card className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6 sm:p-7 lg:p-8 border-2 border-gray-300">
              <div className="mb-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                  Create Account
                </h2>
                <p className="text-base text-gray-600">
                  Sign up to start managing your portfolio
                </p>
              </div>
              
              <form onSubmit={handleRegister} className="mb-6">
                <div className="mb-4">
                  <Label htmlFor="register-name" className="text-sm font-semibold text-gray-900 mb-1 block">
                    Full Name *
                  </Label>
                  <Input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="w-full h-12 px-4 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="register-email" className="text-sm font-semibold text-gray-900 mb-1 block">
                    Email Address *
                  </Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="w-full h-12 px-4 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="register-password" className="text-sm font-semibold text-gray-900 mb-1 block">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      required
                      className="w-full h-12 px-4 pr-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-600 transition-colors p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{authError}</p>
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={authLoadingState}
                  className="w-full h-12 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{authLoadingState ? 'Creating account...' : 'Create Account'}</span>
                  {!authLoadingState && <ArrowRight className="w-5 h-5" />}
                </Button>
                
                <div className="text-center text-sm text-gray-900">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setView('login')
                      setAuthError(null)
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Informational Section */}
          <div className="hidden lg:flex lg:flex-1 flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              StockPortfolio Manager
            </h1>
          </div>
          
          <p className="text-base text-gray-600 mb-10 leading-relaxed">
            Welcome back! Sign in to access your personal stock portfolio and track your investments with ease.
          </p>
          
          <div className="flex flex-col gap-6 mb-10">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Track Performance
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Monitor your portfolio value and profit/loss in real-time
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <PieChart className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Visual Analytics
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Interactive charts for portfolio distribution and trends
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Download className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Export Data
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Download your portfolio data in CSV format anytime
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex gap-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                First time here?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Create a free account to start managing your stock portfolio today. No credit card required.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Column - Login Form */}
        <div className="w-full lg:flex-1 flex items-center justify-center">
          <Card className="w-full max-w-lg bg-white shadow-lg rounded-xl p-10 sm:p-12 lg:p-14 border-2 border-gray-300 min-h-auto">
            <div className="mb-10">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                Welcome Back
              </h2>
              <p className="text-base text-gray-600">
                Sign in to access your portfolio
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="mb-8">
              <div className="mb-8">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-900 mb-3 block">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full h-12 px-4 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              
              <div className="mb-6">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-900 mb-2 block">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    className="w-full h-12 px-4 pr-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-600 transition-colors p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-8">
                <label className="flex items-center cursor-pointer">
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium">
                  Forgot Password?
                </a>
              </div>

              {authError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{authError}</p>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={authLoadingState}
                className="w-full h-12 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{authLoadingState ? 'Signing in...' : 'Sign In'}</span>
                {!authLoadingState && <ArrowRight className="w-5 h-5" />}
              </Button>
              
              <div className="text-center text-sm text-gray-900">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setView('register')
                    setAuthError(null)
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Create Account
                </button>
              </div>
            </form>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-5">
                <Check className="w-5 h-5 text-green-600" />
                <h3 className="text-base font-semibold text-gray-900">
                  Your Security Matters
                </h3>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      SSL Encrypted
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Your data is protected with 256-bit encryption
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Secure Login
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Industry-standard authentication protocols
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Privacy Protected
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      We never share your personal information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900 text-sm sm:text-base">StockPortfolio Manager</span>
          </div>

          <nav className="flex-1 flex justify-center">
            <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
              <button
                type="button"
                onClick={() => setView('dashboard')}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                  view === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setView('addStock')}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                  view === 'addStock' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'
                }`}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => setView('analytics')}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                  view === 'analytics' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'
                }`}
              >
                <PieChart className="w-4 h-4 mr-1" />
                Analytics
              </button>
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setView('account')}
              className={`inline-flex items-center gap-1 text-xs sm:text-sm px-3 py-1.5 rounded-md transition ${
                view === 'account' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'dashboard' && <DashboardView />}
        {view === 'addStock' && <AddStockView />}
        {view === 'analytics' && <AnalyticsView />}
        {view === 'account' && <AccountView />}
      </main>
    </div>
  )
}

export default App
