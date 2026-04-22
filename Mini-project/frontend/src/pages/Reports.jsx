import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { TbTrendingUp, TbArrowUpRight } from 'react-icons/tb';
import { HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCash } from 'react-icons/hi';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './Reports.css';

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: res } = await API.get('/reports/analytics');
        setData(res);
      } catch (error) {
        toast.error('Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Merge income + expenses into single array for area chart
  const areaData = (data?.monthlyIncome || []).map((inc, i) => ({
    month: inc.month,
    income: inc.amount,
    expenses: data?.monthlyExpenses?.[i]?.amount || 0,
  }));

  const savingsData = (data?.savingsTrend || []).map((s) => ({
    month: s.month,
    savings: s.savings,
  }));

  return (
    <div className="reports">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Detailed analytics and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-header">
            <p className="summary-label">Avg. Monthly Income</p>
            <div className="summary-icon-sm green">
              <TbTrendingUp size={18} />
            </div>
          </div>
          <h2 className="summary-value">{formatCurrency(data?.avgMonthlyIncome || 0)}</h2>
          <p className="summary-trend green-text">
            <TbArrowUpRight size={14} /> 8.5% from last period
          </p>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <p className="summary-label">Avg. Monthly Expenses</p>
            <div className="summary-icon-sm red">
              <TbTrendingUp size={18} />
            </div>
          </div>
          <h2 className="summary-value">{formatCurrency(data?.avgMonthlyExpenses || 0)}</h2>
          <p className="summary-trend red-text">
            <TbArrowUpRight size={14} /> 3.2% from last period
          </p>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <p className="summary-label">Savings Rate</p>
            <div className="summary-icon-sm blue">
              <TbTrendingUp size={18} />
            </div>
          </div>
          <h2 className="summary-value">{data?.savingsRate || 0}%</h2>
          <p className="summary-trend green-text">
            <TbArrowUpRight size={14} /> 2.3% improvement
          </p>
        </div>
      </div>

      {/* Income vs Expenses Area Chart */}
      <div className="chart-card">
        <h3 className="chart-title">Income vs Expenses</h3>
        <div className="chart-container">
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend iconType="circle" iconSize={8} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorIncome)"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#colorExpenses)"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No data available yet</div>
          )}
        </div>
      </div>

      {/* Savings Trend */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <h3 className="chart-title">Savings Trend</h3>
        <div className="chart-container">
          {savingsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  name="Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No savings data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
