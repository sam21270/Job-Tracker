import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5075/api/jobapplications';
const COUNTS_URL = `${API_URL}/counts`;
const LOGIN_URL = 'http://localhost:5075/api/auth/login';

const statusLabels = ['Applied', 'Assessment', 'Interviewing', 'Rejected', 'Offer'];
const statusColors = [
  'bg-gray-100 text-gray-700',
  'bg-yellow-100 text-yellow-700',
  'bg-blue-100 text-blue-700',
  'bg-red-100 text-red-700',
  'bg-green-100 text-green-700',
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({ total: 0, today: 0, thisWeek: 0, thisMonth: 0 });
  const [form, setForm] = useState({
    company: '', role: '', source: '', status: 0, followUpStatus: '', dateApplied: ''
  });

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchApplications = async () => {
    const res = await axios.get(API_URL, authHeaders);
    setApplications(res.data);
  };

  const fetchCounts = async () => {
    const res = await axios.get(COUNTS_URL, authHeaders);
    setCounts(res.data);
  };

  useEffect(() => {
    if (token) {
      (async () => {
        await fetchApplications();
        await fetchCounts();
      })();
    }
  }, [token]);

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(LOGIN_URL, loginForm);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      status: Number(form.status),
      dateApplied: new Date(form.dateApplied).toISOString(),
    };
    await axios.post(API_URL, payload, authHeaders);
    setForm({ company: '', role: '', source: '', status: 0, followUpStatus: '', dateApplied: '' });
    fetchApplications();
    fetchCounts();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`, authHeaders);
    fetchApplications();
    fetchCounts();
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-white rounded-lg border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Job Tracker Login</h1>
          <input name="username" placeholder="Username" value={loginForm.username} onChange={handleLoginChange} required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3" />
          <input name="password" type="password" placeholder="Password" value={loginForm.password} onChange={handleLoginChange} required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3" />
          {loginError && <p className="text-red-500 text-sm mb-3">{loginError}</p>}
          <button type="submit" className="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-800">
            Log In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Job Tracker</h1>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">Log out</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            ['Total', counts.total],
            ['Today', counts.today],
            ['This Week', counts.thisWeek],
            ['This Month', counts.thisMonth],
          ].map(([label, value]) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 mb-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          <input name="company" placeholder="Company" value={form.company} onChange={handleChange} required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input name="role" placeholder="Role" value={form.role} onChange={handleChange} required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input name="source" placeholder="Source" value={form.source} onChange={handleChange} required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input name="dateApplied" type="date" value={form.dateApplied} onChange={handleChange} required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <select name="status" value={form.status} onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            {statusLabels.map((label, i) => <option key={i} value={i}>{label}</option>)}
          </select>
          <input name="followUpStatus" placeholder="Follow-up status (optional)" value={form.followUpStatus} onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <button type="submit"
            className="col-span-2 md:col-span-3 bg-gray-900 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-800">
            Add Application
          </button>
        </form>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {applications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No applications yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Follow-up</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{app.company}</td>
                    <td className="px-4 py-3 text-gray-700">{app.role}</td>
                    <td className="px-4 py-3 text-gray-700">{app.source}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status ?? 0]}`}>
                        {statusLabels[app.status ?? 0]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{app.followUpStatus || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{app.dateApplied.split('T')[0]}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;