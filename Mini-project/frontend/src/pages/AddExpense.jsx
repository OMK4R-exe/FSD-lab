import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineTag, HiOutlineDocumentText } from 'react-icons/hi';
import './AddExpense.css';

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Travel',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Others',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Others'];

function AddExpense() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
  });
  const [loading, setLoading] = useState(false);

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'type' ? { category: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.description || !formData.amount || !formData.date) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await API.post('/transactions', {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success(`${formData.type === 'expense' ? 'Expense' : 'Income'} added successfully!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-expense">
      <div className="page-header">
        <h1 className="page-title">Add Transaction</h1>
        <p className="page-subtitle">Record a new income or expense</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div className="type-toggle">
            <button
              type="button"
              className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
              onClick={() => setFormData((p) => ({ ...p, type: 'expense', category: '' }))}
            >
              Expense
            </button>
            <button
              type="button"
              className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
              onClick={() => setFormData((p) => ({ ...p, type: 'income', category: '' }))}
            >
              Income
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="input-wrapper">
                <HiOutlineTag className="input-icon" size={18} />
                <select
                  name="category"
                  className="form-input form-select"
                  value={formData.category}
                  onChange={handleChange}
                  id="add-category"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount</label>
              <div className="input-wrapper">
                <HiOutlineCurrencyDollar className="input-icon" size={18} />
                <input
                  type="number"
                  name="amount"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  id="add-amount"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <div className="input-wrapper">
                <HiOutlineCalendar className="input-icon" size={18} />
                <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                  id="add-date"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="input-wrapper">
                <HiOutlineTag className="input-icon" size={18} />
                <select
                  name="status"
                  className="form-input form-select"
                  value={formData.status}
                  onChange={handleChange}
                  id="add-status"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Description</label>
            <div className="input-wrapper">
              <HiOutlineDocumentText className="input-icon" size={18} />
              <input
                type="text"
                name="description"
                className="form-input"
                placeholder="e.g. Restaurant, Uber ride, salary..."
                value={formData.description}
                onChange={handleChange}
                id="add-description"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} id="add-submit">
              {loading ? <span className="btn-spinner"></span> : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpense;
