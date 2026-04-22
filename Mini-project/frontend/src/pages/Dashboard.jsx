import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { HiOutlineCash, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { TbWallet, TbArrowUpRight, TbArrowDownRight } from 'react-icons/tb';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './Dashboard.css';

const CATEGORY_COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await API.get('/reports/dashboard');
      setData(res);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await API.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const totalBalance = data?.totalBalance || 0;
  const totalIncome = data?.totalIncome || 0;
  const totalExpenses = data?.totalExpenses || 0;

  // Process pie chart data
  const pieData = (data?.expenseByCategory || []).map((cat) => ({
    name: cat._id,
    value: cat.total,
  }));

  const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);
  const pieDataWithPercent = pieData.map((d) => ({
    ...d,
    percent: totalPie > 0 ? ((d.value / totalPie) * 100).toFixed(0) : 0,
  }));

  // Process bar chart data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const barData = (data?.monthlyExpenses || []).map((m) => ({
    month: months[m._id.month - 1],
    expenses: m.total,
  }));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toISOString().split('T')[0];
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your financial activity</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-header">
            <div className="summary-icon blue">
              <TbWallet size={22} />
            </div>
            <span className="summary-badge green">+12.5%</span>
          </div>
          <p className="summary-label">Total Balance</p>
          <h2 className="summary-value">{formatCurrency(totalBalance)}</h2>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <div className="summary-icon green">
              <TbArrowUpRight size={22} />
            </div>
            <span className="summary-badge green">+8.2%</span>
          </div>
          <p className="summary-label">Total Income</p>
          <h2 className="summary-value">{formatCurrency(totalIncome)}</h2>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <div className="summary-icon red">
              <TbArrowDownRight size={22} />
            </div>
            <span className="summary-badge red">-3.1%</span>
          </div>
          <p className="summary-label">Total Expenses</p>
          <h2 className="summary-value">{formatCurrency(totalExpenses)}</h2>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3 className="chart-title">Expense by Category</h3>
          <div className="chart-container pie-chart-container">
            {pieDataWithPercent.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieDataWithPercent}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${percent}%`}
                    labelLine={true}
                  >
                    {pieDataWithPercent.map((entry, index) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No expense data yet</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Monthly Expenses</h3>
          <div className="chart-container">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="expenses" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No monthly data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="table-card">
        <h3 className="chart-title">Recent Transactions</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentTransactions || []).length > 0 ? (
                data.recentTransactions.map((t) => (
                  <tr key={t._id}>
                    <td>{formatDate(t.date)}</td>
                    <td>{t.category}</td>
                    <td>{t.description}</td>
                    <td className={t.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount).replace('$', '')}
                    </td>
                    <td>
                      <span className={`status-badge ${t.status}`}>{t.status}</span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit" title="Edit">
                          <HiOutlinePencil size={16} />
                        </button>
                        <button className="action-btn delete" title="Delete" onClick={() => handleDelete(t._id)}>
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data-cell">No transactions yet. Start by adding one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
