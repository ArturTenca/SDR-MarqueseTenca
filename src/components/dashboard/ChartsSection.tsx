import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import { format, parseISO, startOfWeek, getWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChartsSectionProps {
  data: FollowupData[];
  loading: boolean;
}

export const ChartsSection = ({ data, loading }: ChartsSectionProps) => {
  // Process data for daily messages chart
  const dailyMessages = data.reduce((acc: any, item) => {
    if (!item.ultimaAtividade) return acc;
    const date = format(parseISO(item.ultimaAtividade), "dd/MM", { locale: ptBR });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const dailyData = Object.entries(dailyMessages)
    .map(([date, count]) => ({ date, messages: count }))
    .slice(-14); // Last 14 days

  // Process data for conversion rate chart
  const conversionByWeek = data.reduce((acc: any, item) => {
    if (!item.ultimaAtividade) return acc;
    const week = `S${getWeek(parseISO(item.ultimaAtividade), { locale: ptBR })}`;
    if (!acc[week]) {
      acc[week] = { total: 0, converted: 0 };
    }
    acc[week].total += 1;
    if (item.encerrado) {
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
    .slice(-8); // Last 8 weeks

  // Process data for status pie chart
  const statusCounts = {
    "Em Andamento": data.filter((item) => !item.encerrado).length,
    Encerrado: data.filter((item) => item.encerrado).length,
    "Follow-up 1": data.filter((item) => item.followup1 && !item.encerrado).length,
    "Follow-up 2": data.filter((item) => item.followup2 && !item.encerrado).length,
  };

  const statusData = Object.entries(statusCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
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
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Evolução Diária de Mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
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

      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conversão por Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: any, name: string) => {
                  if (name === "taxa") return [`${value}%`, "Taxa de Conversão"];
                  return [value, name === "convertidos" ? "Convertidos" : "Total"];
                }}
              />
              <Legend />
              <Bar dataKey="taxa" name="Taxa (%)" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
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
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
