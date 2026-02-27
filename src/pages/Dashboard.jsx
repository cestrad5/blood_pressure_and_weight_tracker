import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../firebase/auth';
import { addHealthRecord, subscribeToHealthRecords, deleteHealthRecord, updateHealthRecord } from '../firebase/db';
import { getBloodPressureStatus } from '../utils/healthLogic';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend as ChartLegend 
} from 'chart.js';
import { Line as LineChartJS } from 'react-chartjs-2';
import { LogOut, Activity, Scale, Heart, History, Plus, Trash2, Edit2, X } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const Dashboard = () => {
  const { user } = useAuth();
  const [weight, setWeight] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToHealthRecords(user.uid, (data) => {
        setRecords([...data].reverse()); // Chronological order for chart
      });
      return unsubscribe;
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        weight: parseFloat(weight),
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic)
      };

      if (editingId) {
        await updateHealthRecord(editingId, data);
        setEditingId(null);
      } else {
        await addHealthRecord(user.uid, data);
      }
      
      setWeight('');
      setSystolic('');
      setDiastolic('');
    } catch (err) {
      alert("Error saving record: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setWeight(record.weight.toString());
    setSystolic(record.systolic.toString());
    setDiastolic(record.diastolic.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setWeight('');
    setSystolic('');
    setDiastolic('');
  };

  const handleDelete = async (recordId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteHealthRecord(recordId);
      } catch (err) {
        alert("Error deleting record: " + err.message);
      }
    }
  };

  const latestRecord = [...records].sort((a, b) => {
    const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
    const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
    return timeB - timeA;
  })[0];
  const bpStatus = latestRecord 
    ? getBloodPressureStatus(latestRecord.systolic, latestRecord.diastolic)
    : null;

  const chartData = {
    labels: records.map(r => r.timestamp ? new Date(r.timestamp.toDate()).toLocaleDateString() : ''),
    datasets: [
      {
        label: 'Systolic',
        data: records.map(r => r.systolic),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Diastolic',
        data: records.map(r => r.diastolic),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Weight',
        data: records.map(r => r.weight),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        tension: 0.3,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'BP (mmHg)', color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Weight (kg)', color: '#94a3b8' },
        grid: { drawOnChartArea: false },
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    },
    plugins: {
      legend: { labels: { color: '#f8fafc' } }
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Health Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Tracking your vitals</p>
        </div>
        <button 
          onClick={logout}
          style={{ background: 'var(--glass)', color: 'white', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--glass-border)' }}
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <section className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editingId ? <Edit2 size={20} color="var(--warning)" /> : <Plus size={20} color="var(--primary)" />}
              {editingId ? 'Edit Entry' : 'New Entry'}
            </h2>
            {editingId && (
              <button 
                onClick={handleCancelEdit}
                style={{ background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Weight (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div className="bp-input-grid" style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Systolic</label>
                <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Diastolic</label>
                <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} required />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: editingId ? 'var(--warning)' : 'var(--primary)', 
                color: 'white', 
                padding: '12px', 
                borderRadius: '8px', 
                fontWeight: '600' 
              }}
            >
              {loading ? 'Saving...' : editingId ? 'Update Record' : 'Save Record'}
            </button>
          </form>
        </section>

        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary)" /> Latest Status
          </h2>
          {latestRecord ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '42px', fontWeight: 'bold' }}>
                {latestRecord.systolic}/{latestRecord.diastolic}
              </div>
              <div style={{ color: bpStatus.color, fontWeight: '600', marginBottom: '16px' }}>{bpStatus.label}</div>
              <div className="latest-status-stats" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <div className="stat-item" style={{ background: 'var(--glass)', padding: '12px', borderRadius: '12px', flex: 1 }}>
                   <Scale size={18} />
                   <div>{latestRecord.weight} kg</div>
                </div>
                <div className="stat-item" style={{ background: 'var(--glass)', padding: '12px', borderRadius: '12px', flex: 1 }}>
                   <History size={18} />
                   <div style={{ fontSize: '12px' }}>{latestRecord.timestamp ? new Date(latestRecord.timestamp.toDate()).toLocaleDateString() : 'Pending'}</div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No records yet.</p>
          )}
        </section>
      </div>

      <section className="glass-card" style={{ minHeight: '400px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>30-Day Trends</h2>
        <div style={{ height: '300px' }}>
          <LineChartJS data={chartData} options={chartOptions} />
        </div>
      </section>

      <section className="glass-card">
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>History</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>BP (mmHg)</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Weight (kg)</th>
                <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '12px' }}>
                    {record.timestamp ? new Date(record.timestamp.toDate()).toLocaleDateString() : 'Pending'}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>
                    {record.systolic}/{record.diastolic}
                  </td>
                  <td style={{ padding: '12px' }}>{record.weight}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleEdit(record)}
                        style={{ background: 'transparent', color: 'var(--primary)', padding: '6px' }}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        style={{ background: 'transparent', color: 'var(--danger)', padding: '6px' }}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>

  );
};

export default Dashboard;
