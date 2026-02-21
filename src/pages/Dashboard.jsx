import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../firebase/auth';
import { addHealthRecord, subscribeToHealthRecords } from '../firebase/db';
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
import { LogOut, Activity, Scale, Heart, History, Plus } from 'lucide-react';

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
      await addHealthRecord(user.uid, {
        weight: parseFloat(weight),
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic)
      });
      setWeight('');
      setSystolic('');
      setDiastolic('');
    } catch (err) {
      alert("Error adding record: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const latestRecord = records[records.length - 1];
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
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
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
          <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} color="var(--primary)" /> New Entry
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Weight (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: '600' }}
            >
              {loading ? 'Saving...' : 'Save Record'}
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
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <div style={{ background: 'var(--glass)', padding: '12px', borderRadius: '12px', flex: 1 }}>
                   <Scale size={18} />
                   <div>{latestRecord.weight} kg</div>
                </div>
                <div style={{ background: 'var(--glass)', padding: '12px', borderRadius: '12px', flex: 1 }}>
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

      <section className="glass-card" style={{ height: '400px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>30-Day Trends</h2>
        <div style={{ height: '300px' }}>
          <LineChartJS data={chartData} options={chartOptions} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
