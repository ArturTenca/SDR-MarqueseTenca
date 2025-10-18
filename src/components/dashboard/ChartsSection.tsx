import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FollowupData } from "@/types/followup";
import { Skeleton } from "@/components/ui/skeleton";
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
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { format, parseISO, startOfWeek, getWeek, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChartsSectionProps {
  data: FollowupData[];
  loading: boolean;
}

export const ChartsSection = ({ data, loading }: ChartsSectionProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(7);
  const [selectedWeeklyPeriod, setSelectedWeeklyPeriod] = useState<4 | 10 | 20>(4);

  // Process data for daily messages chart
  const dailyMessages = data.reduce((acc: any, item) => {
    if (!item.created_at) return acc;
    const date = format(parseISO(item.created_at), "dd/MM", { locale: ptBR });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const dailyData = Object.entries(dailyMessages)
    .map(([date, count]) => ({ date, messages: count }))
    .sort((a, b) => {
      // Sort by date to ensure chronological order
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-selectedPeriod); // Dynamic period

  // Process data for conversion rate chart
  const conversionByWeek = data.reduce((acc: any, item) => {
    if (!item.created_at) return acc;
    const date = parseISO(item.created_at);
    const week = format(date, "w/MMM", { locale: ptBR });
    if (!acc[week]) {
      acc[week] = { total: 0, converted: 0 };
    }
    acc[week].total += 1;
    if (item.status === 'converted' || item.status === 'meeting') {
      acc[week].converted += 1;
    }
    return acc;
  }, {});

  const conversionData = Object.entries(conversionByWeek)
    .map(([week, data]: [string, any]) => ({
      week,
      taxa: ((data.converted / data.total) * 100).toFixed(1),
      convertidos: data.converted,
      total: data.total,
    }))
    .sort((a, b) => {
      // Sort by week chronologically
      const dateA = new Date(a.week.split('/').reverse().join('-'));
      const dateB = new Date(b.week.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-8); // Last 8 weeks

  // Process data for status pie chart
  const statusCounts = {
    "Em Andamento": data.filter((item) => !item.status || item.status === 'active' || item.status === 'pending').length,
    "Convertido": data.filter((item) => item.status === 'converted' || item.status === 'meeting').length,
    "Sem Status": data.filter((item) => !item.status).length,
  };

  const statusData = Object.entries(statusCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  // Process data for hourly activity chart
  const hourlyActivity = data.reduce((acc: any, item) => {
    if (!item.created_at) return acc;
    const hour = new Date(item.created_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    messages: hourlyActivity[i] || 0,
  }));


  // Process data for weekly performance
  const weeklyPerformance = data.reduce((acc: any, item) => {
    if (!item.created_at) return acc;
    const date = parseISO(item.created_at);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekKey = format(weekStart, "dd/MM", { locale: ptBR });
    
    if (!acc[weekKey]) {
      acc[weekKey] = { total: 0, converted: 0, active: 0, pending: 0 };
    }
    
    acc[weekKey].total += 1;
    if (item.status === 'converted' || item.status === 'meeting') acc[weekKey].converted += 1;
    if (item.status === 'active') acc[weekKey].active += 1;
    if (item.status === 'pending') acc[weekKey].pending += 1;
    
    return acc;
  }, {});

  const weeklyData = Object.entries(weeklyPerformance)
    .map(([week, data]: [string, any]) => ({
      week,
      total: data.total,
      converted: data.converted,
      active: data.active,
      pending: data.pending,
      conversionRate: ((data.converted / data.total) * 100).toFixed(1),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.week.split('/').reverse().join('-'));
      const dateB = new Date(b.week.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-selectedWeeklyPeriod);



  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className={i === 1 ? "lg:col-span-2" : ""}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.005]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Evolução Diária de Mensagens</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(7)}
              >
                7 dias
              </Button>
              <Button
                variant={selectedPeriod === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(30)}
              >
                30 dias
              </Button>
              <Button
                variant={selectedPeriod === 90 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(90)}
              >
                90 dias
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" domain={[0, 'dataMax']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "white",
                }}
                labelStyle={{
                  color: "white",
                }}
                itemStyle={{
                  color: "white",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="messages"
                name="Mensagens"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="transition-all duration-500 hover:scale-[1.005]">
        <CardHeader>
          <CardTitle>Taxa de Conversão por Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={conversionData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--card-foreground))",
                }}
                formatter={(value: any, name: string) => {
                  if (name === "taxa") return [`${value}%`, "Taxa de Conversão"];
                  return [value, name === "convertidos" ? "Convertidos" : "Total"];
                }}
              />
              <Legend />
              <Bar 
                dataKey="taxa" 
                name="Taxa (%)" 
                fill="hsl(var(--chart-2))" 
                radius={[8, 8, 0, 0]}
                fillOpacity={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.005]">
        <CardHeader>
          <CardTitle>Distribuição de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "white",
                }}
                labelStyle={{
                  color: "white",
                }}
                itemStyle={{
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.005]">
        <CardHeader>
          <CardTitle>Atividade por Hora do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="hour" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Area
                type="monotone"
                dataKey="messages"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.005]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Semanal</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedWeeklyPeriod === 4 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedWeeklyPeriod(4)}
              >
                4 semanas
              </Button>
              <Button
                variant={selectedWeeklyPeriod === 10 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedWeeklyPeriod(10)}
              >
                10 semanas
              </Button>
              <Button
                variant={selectedWeeklyPeriod === 20 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedWeeklyPeriod(20)}
              >
                20 semanas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Legend />
              <Bar dataKey="total" name="Total" fill="hsl(var(--chart-1))" opacity={0.6} />
              <Bar dataKey="converted" name="Convertidos" fill="hsl(var(--chart-2))" />
              <Bar dataKey="active" name="Ativos" fill="hsl(var(--chart-3))" />
              <Bar dataKey="pending" name="Pendentes" fill="hsl(var(--chart-4))" />
              <Line
                type="monotone"
                dataKey="conversionRate"
                name="Taxa Conversão (%)"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
};
