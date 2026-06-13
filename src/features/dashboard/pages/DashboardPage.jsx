import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  TrendingUp,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../services/dashboardService';
import PageWrapper from '../../../components/layout/PageWrapper';
import StatCard from '../../../components/data-display/StatCard';
import Card from '../../../components/ui/Card';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import { formatDate } from '../../../utils/helpers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/Table';

const COLORS = [
  '#10b981', // Emerald 500
  '#34d399', // Emerald 400
  '#059669', // Emerald 600
  '#6ee7b7', // Emerald 300
  '#047857', // Emerald 700
  '#a7f3d0', // Emerald 200
  '#065f46', // Emerald 800
];

export default function DashboardPage() {
  // Query Stats
  const { 
    data: stats, 
    isLoading: isStatsLoading, 
    error: statsError 
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getDashboardStats,
  });

  // Query Recent Registrations
  const { 
    data: recentMembers, 
    isLoading: isMembersLoading, 
    error: membersError 
  } = useQuery({
    queryKey: ['recentMembers'],
    queryFn: () => dashboardService.getRecentMembers(5),
  });

  const isLoading = isStatsLoading || isMembersLoading;

  if (isLoading) {
    return (
      <PageWrapper
        title="Dashboard Overview"
        subtitle="Welcome back! Here's what's happening with the association today."
      >
        <LoadingSkeleton type="stats" count={4} className="mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 h-96 skeleton-pulse" />
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 h-96 skeleton-pulse" />
        </div>
        <Card>
          <Card.Content>
            <LoadingSkeleton type="table" count={5} />
          </Card.Content>
        </Card>
      </PageWrapper>
    );
  }

  if (statsError || membersError) {
    return (
      <PageWrapper
        title="Dashboard Overview"
        subtitle="Welcome back! Here's what's happening with the association today."
      >
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Failed to load dashboard metrics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Please verify your Supabase database connectivity or check system logs.</p>
        </div>
      </PageWrapper>
    );
  }

  // Format Recharts data
  const chartMonthlyData = stats?.monthly_growth?.map(item => ({
    month: item.month,
    members: item.count || 0
  })) || [];

  const chartDistrictData = stats?.district_stats?.map((item, index) => ({
    name: item.district || 'Unknown',
    value: item.count || 0,
    color: COLORS[index % COLORS.length]
  })) || [];

  // Calculate monthly registrations trend compared to average
  const totalGrowthItems = chartMonthlyData.length;
  const currentMonthCount = totalGrowthItems > 0 ? chartMonthlyData[totalGrowthItems - 1].members : 0;
  const prevMonthCount = totalGrowthItems > 1 ? chartMonthlyData[totalGrowthItems - 2].members : 0;
  
  let growthTrendPercent = 0;
  if (prevMonthCount > 0) {
    growthTrendPercent = Math.round(((currentMonthCount - prevMonthCount) / prevMonthCount) * 100);
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">{label}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">
            {payload[0].value} Members
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <PageWrapper
      title="Dashboard Overview"
      subtitle="Welcome back! Here's what's happening with the association today."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value={stats?.total_members || 0}
          icon={Users}
          change={12}
          changeLabel="overall growth"
          gradient
        />
        <StatCard
          title="Active Members"
          value={stats?.active_members || 0}
          icon={UserCheck}
          change={8}
          changeLabel="verified farmers"
        />
        <StatCard
          title="Expired Members"
          value={stats?.expired_members || 0}
          icon={UserX}
          change={-2}
          changeLabel="awaiting renewals"
        />
        <StatCard
          title="New This Month"
          value={stats?.new_this_month || 0}
          icon={UserPlus}
          change={15}
          changeLabel="recent registrations"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Growth Area Chart */}
        <Card className="lg:col-span-2 flex flex-col h-full">
          <Card.Header>
            <div className="flex items-center justify-between">
              <div>
                <Card.Title>Growth Analytics</Card.Title>
                <Card.Description>Member registrations over the past year</Card.Description>
              </div>
              {growthTrendPercent !== 0 && (
                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {growthTrendPercent > 0 ? `+${growthTrendPercent}%` : `${growthTrendPercent}%`}
                  </span>
                </div>
              )}
            </div>
          </Card.Header>
          <Card.Content className="flex-1">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" className="opacity-30 dark:opacity-10" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="members"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#emeraldGradient)"
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* District Distribution Pie Chart */}
        <Card className="flex flex-col h-full">
          <Card.Header>
            <Card.Title>Regional Distribution</Card.Title>
            <Card.Description>Members by district breakdown</Card.Description>
          </Card.Header>
          <Card.Content className="flex-1 flex flex-col justify-between">
            <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDistrictData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartDistrictData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {chartDistrictData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {item.value.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Registrations Table */}
      <Card>
        <Card.Header className="pb-0">
          <Card.Title>Recent Members</Card.Title>
          <Card.Description>Latest farmer registration records</Card.Description>
        </Card.Header>
        <Card.Content className="pt-6">
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Village</TableHead>
                <TableHead className="hidden md:table-cell">District</TableHead>
                <TableHead>Registration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMembers && recentMembers.length > 0 ? (
                recentMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                      {member.member_id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {member.name}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {member.village || '—'}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {member.district || '—'}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {formatDate(member.joining_date)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow hover={false}>
                  <TableCell colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No registrations recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card.Content>
      </Card>
    </PageWrapper>
  );
}
