import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

const enrollmentData = [
  { month: 'Jan', students: 420 },
  { month: 'Feb', students: 445 },
  { month: 'Mar', students: 480 },
  { month: 'Apr', students: 510 },
  { month: 'May', students: 545 },
  { month: 'Jun', students: 580 },
]

const performanceData = [
  { subject: 'Math', score: 85 },
  { subject: 'Science', score: 78 },
  { subject: 'English', score: 92 },
  { subject: 'History', score: 88 },
  { subject: 'Arts', score: 75 },
]

const departmentData = [
  { name: 'Engineering', value: 340, color: '#6366f1' },
  { name: 'Business', value: 280, color: '#ec4899' },
  { name: 'Arts', value: 180, color: '#14b8a6' },
  { name: 'Science', value: 260, color: '#f59e0b' },
]

const recentStudents = [
  {
    id: 1,
    name: 'Emma Johnson',
    course: 'Computer Science',
    status: 'Active',
    grade: 'A',
    avatar: 'EJ',
    color: 'bg-purple-500',
  },
  {
    id: 2,
    name: 'Michael Chen',
    course: 'Business Admin',
    status: 'Active',
    grade: 'B+',
    avatar: 'MC',
    color: 'bg-blue-500',
  },
  {
    id: 3,
    name: 'Sarah Williams',
    course: 'Engineering',
    status: 'Active',
    grade: 'A-',
    avatar: 'SW',
    color: 'bg-pink-500',
  },
  {
    id: 4,
    name: 'James Brown',
    course: 'Arts & Design',
    status: 'Inactive',
    grade: 'B',
    avatar: 'JB',
    color: 'bg-green-500',
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    course: 'Data Science',
    status: 'Active',
    grade: 'A+',
    avatar: 'LA',
    color: 'bg-indigo-500',
  },
]

export default function StudentDashboard() {
  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto flex flex-col gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <p className="text-sm opacity-90">Total Students</p>
              <h3 className="text-4xl font-bold my-2">1,845</h3>
              <div className="flex items-center space-x-1 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12% from last month</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <p className="text-sm opacity-90">Active Courses</p>
              <h3 className="text-4xl font-bold my-2">56</h3>
              <div className="flex items-center space-x-1 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+3 new this week</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <p className="text-sm opacity-90">Avg. Performance</p>
              <h3 className="text-4xl font-bold my-2">85.6%</h3>
              <div className="flex items-center space-x-1 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+2.3% increase</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <p className="text-sm opacity-90">Graduation Rate</p>
              <h3 className="text-4xl font-bold my-2">92.3%</h3>
              <div className="flex items-center space-x-1 text-sm">
                <TrendingDown className="w-4 h-4" />
                <span>-1.2% from last year</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Student Enrollment Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Department Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Chart and Recent Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Average Performance by Subject
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="subject" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="score" fill="#ec4899" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Recent Students
              </h3>
              <div className="space-y-4">
                {recentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 ${student.color} rounded-full flex items-center justify-center text-white font-bold shadow-md`}
                      >
                        {student.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {student.course}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          student.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {student.status}
                      </span>
                      <span className="font-bold text-indigo-600 min-w-[3rem] text-right">
                        {student.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
