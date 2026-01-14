'use client';

import {
  Users,
  ShoppingBag,
  Store,
  TrendingUp,
  BarChart3,
  PiggyBank,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  mockDashboardStats,
  usersPerMonth,
  comparisonsPerSupermarket,
  topCategories,
  savingsPerCategory,
  activityPerDay,
  topProducts,
  cheapestByCategory
} from '../../data/mockData';

// ============================================
// COMPONENTES DE GRÁFICOS SIMPLES
// ============================================

// Gráfico de barras horizontal
function HorizontalBarChart({ data, maxValue }: {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number
}) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium text-gray-800">{item.value.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || '#77A14B'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Gráfico de barras vertical
function VerticalBarChart({ data }: {
  data: { label: string; value: number; color?: string }[]
}) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <span className="text-xs text-gray-600 mb-1">{item.value}</span>
          <div
            className="w-full rounded-t-lg transition-all duration-500"
            style={{
              height: `${(item.value / max) * 100}%`,
              backgroundColor: item.color || '#77A14B',
              minHeight: '8px'
            }}
          />
          <span className="text-xs text-gray-500 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Componente de estadística
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary'
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'accent';
}) {
  const colorClasses = {
    primary: 'bg-primary/20 text-accent-green-dark',
    secondary: 'bg-secondary/20 text-blue-700',
    accent: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-500'
            }`}>
              {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL DEL DASHBOARD
// ============================================
export default function DashboardPage() {
  // Preparar datos para los gráficos
  const usersChartData = usersPerMonth.map(d => ({
    label: d.month,
    value: d.users
  }));

  const supermarketChartData = comparisonsPerSupermarket.map(d => ({
    label: d.name,
    value: d.comparisons,
    color: d.color
  }));

  const categoriesChartData = topCategories.map(d => ({
    label: d.category,
    value: d.searches
  }));

  const activityChartData = activityPerDay.map(d => ({
    label: d.day,
    value: d.visits
  }));

  const savingsChartData = savingsPerCategory.map(d => ({
    label: d.category,
    value: d.savings
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Resumen general de la plataforma</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Usuarios"
          value={mockDashboardStats.totalUsers.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="+12% este mes"
          color="primary"
        />
        <StatCard
          title="Usuarios Activos"
          value={mockDashboardStats.activeUsers.toLocaleString()}
          icon={Eye}
          trend="up"
          trendValue="+8% esta semana"
          color="secondary"
        />
        <StatCard
          title="Productos"
          value={mockDashboardStats.totalProducts.toLocaleString()}
          icon={ShoppingBag}
          color="accent"
        />
        <StatCard
          title="Comparaciones"
          value={mockDashboardStats.totalComparisons.toLocaleString()}
          icon={BarChart3}
          trend="up"
          trendValue="+23% este mes"
          color="primary"
        />
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Supermercados"
          value={mockDashboardStats.totalSupermarkets}
          icon={Store}
          color="secondary"
        />
        <StatCard
          title="Ahorro Promedio"
          value={`${mockDashboardStats.averageSavings}%`}
          icon={PiggyBank}
          trend="up"
          trendValue="+2.3% vs mes anterior"
          color="primary"
        />
        <StatCard
          title="Tasa de Retención"
          value="71.5%"
          icon={TrendingUp}
          trend="up"
          trendValue="+5% este mes"
          color="accent"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios por mes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Nuevos Usuarios por Mes</h3>
          <VerticalBarChart data={usersChartData} />
        </div>

        {/* Actividad por día */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Visitas por Día de la Semana</h3>
          <VerticalBarChart data={activityChartData} />
        </div>

        {/* Comparaciones por supermercado */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Comparaciones por Supermercado</h3>
          <HorizontalBarChart data={supermarketChartData} />
        </div>

        {/* Categorías más buscadas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Categorías Más Buscadas</h3>
          <HorizontalBarChart data={categoriesChartData} />
        </div>
      </div>

      {/* Tercera fila de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ahorro por categoría */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Ahorro Promedio por Categoría (%)</h3>
          <HorizontalBarChart
            data={savingsChartData.map(d => ({ ...d, value: d.value }))}
            maxValue={40}
          />
        </div>

        {/* Productos más comparados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Productos Más Comparados</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-accent-green-dark text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{product.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {product.comparisons.toLocaleString()} comp.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supermercado más económico por categoría */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Supermercado Más Económico por Categoría</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {cheapestByCategory.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500 mb-1">{item.category}</p>
              <p className="font-semibold text-gray-800">{item.supermarket}</p>
              <p className="text-green-600 text-sm font-medium mt-1">
                {item.difference}% más barato
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
