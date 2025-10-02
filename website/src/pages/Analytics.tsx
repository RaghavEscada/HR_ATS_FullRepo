import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Users, Mic, BarChart2, FileText, Eye, XCircle, CheckCircle } from 'lucide-react';

interface Applicant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string | null;
  is_interviewed: boolean | null;
  created_at: string;
  cv_scoring: number;
}

const Analytics = () => {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('applicants')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
        } else {
          setApplicants(data || []);
        }
      } catch (err) {
        setError('Failed to fetch applicants');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [user]);

  // Process data for charts with error handling
  const statusCounts = applicants.reduce((acc, applicant) => {
    try {
      const status = applicant.status || 'Applied';
      acc[status] = (acc[status] || 0) + 1;
    } catch (err) {
      console.error('Error processing applicant status:', err);
    }
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: applicants.length > 0 ? ((count / applicants.length) * 100).toFixed(1) : '0'
  }));

  const interviewedCount = applicants.filter(a => a.is_interviewed === true).length;
  const totalApplicants = applicants.length;

  // Monthly data based on actual creation dates
  const monthlyData = applicants.reduce((acc, applicant) => {
    try {
      const date = new Date(applicant.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, applications: 0, interviewed: 0 };
      }
      
      acc[monthKey].applications += 1;
      if (applicant.is_interviewed === true) {
        acc[monthKey].interviewed += 1;
      }
    } catch (err) {
      console.error('Error processing monthly data:', err);
    }
    return acc;
  }, {} as Record<string, { month: string; applications: number; interviewed: number }>);

  const monthlyChartData = Object.values(monthlyData).slice(-6); // Last 6 months

  const COLORS = {
    'Applied': '#3b82f6',
    'Reviewing': '#f59e0b', 
    'Interviewed': '#10b981',
    'Rejected': '#ef4444',
    'Hired': '#8b5cf6'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
        <p>{error}</p>
      </div>
    );
  }
  // Fallback data if no applicants
  const safePieData = pieData.length > 0 ? pieData : [
    { status: 'No Data', count: 1, percentage: '100' }
  ];
  
  const safeMonthlyData = monthlyChartData.length > 0 ? monthlyChartData : [
    { month: 'No Data', applications: 0, interviewed: 0 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
          Analytics Dashboard
        </h1>
        <p className="text-slate-600 text-lg">Comprehensive recruitment insights and pipeline overview</p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">Applied</h3>
            <p className="text-3xl font-bold text-blue-800">{statusCounts['Applied'] || 0}</p>
            <p className="text-sm text-blue-600 mt-1">New Applications</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-1">Reviewing</h3>
            <p className="text-3xl font-bold text-yellow-800">{statusCounts['Reviewing'] || 0}</p>
            <p className="text-sm text-yellow-600 mt-1">Under Review</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-1">Interviewed</h3>
            <p className="text-3xl font-bold text-green-800">{statusCounts['Interviewed'] || 0}</p>
            <p className="text-sm text-green-600 mt-1">Completed Interviews</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">Rejected</h3>
            <p className="text-3xl font-bold text-red-800">{statusCounts['Rejected'] || 0}</p>
            <p className="text-sm text-red-600 mt-1">Not Selected</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900 mb-1">Hired</h3>
            <p className="text-3xl font-bold text-purple-800">{statusCounts['Hired'] || 0}</p>
            <p className="text-sm text-purple-600 mt-1">Successfully Hired</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Applicants</p>
                <p className="text-3xl font-bold text-slate-900">{totalApplicants}</p>
              </div>
              <div className="w-12 h-12 bg-slate-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Interview Rate</p>
                <p className="text-3xl font-bold text-emerald-900">
                  {totalApplicants > 0 ? ((interviewedCount / totalApplicants) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Avg CV Score</p>
                <p className="text-3xl font-bold text-amber-900">
                  {applicants.length > 0 ? (applicants.reduce((sum, a) => sum + (a.cv_scoring || 0), 0) / applicants.length).toFixed(1) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Status Distribution</CardTitle>
            <CardDescription className="text-slate-600">Complete pipeline breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Applied: { label: 'Applied', color: '#3b82f6' },
                Reviewing: { label: 'Reviewing', color: '#f59e0b' },
                Interviewed: { label: 'Interviewed', color: '#10b981' },
                Rejected: { label: 'Rejected', color: '#ef4444' },
                Hired: { label: 'Hired', color: '#8b5cf6' },
              }}
              className="h-80"
            >
              <PieChart>
                <Pie
                  data={safePieData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  label={({ status, percentage }) => `${status}: ${percentage}%`}
                  labelLine={false}
                >
                  {safePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#6b7280'} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Monthly Trends</CardTitle>
            <CardDescription className="text-slate-600">Applications and interviews over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                applications: { label: 'Applications', color: '#3b82f6' },
                interviewed: { label: 'Interviewed', color: '#10b981' },
              }}
              className="h-80"
            >
              <LineChart data={safeMonthlyData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={12}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={12}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="var(--color-applications)" 
                  strokeWidth={4} 
                  dot={{ fill: 'var(--color-applications)', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: 'var(--color-applications)', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="interviewed" 
                  stroke="var(--color-interviewed)" 
                  strokeWidth={4} 
                  dot={{ fill: 'var(--color-interviewed)', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: 'var(--color-interviewed)', strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;


