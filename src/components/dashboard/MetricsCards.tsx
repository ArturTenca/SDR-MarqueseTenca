import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, Users, TrendingUp } from "lucide-react";
import { FollowupData } from "@/types/followup";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsCardsProps {
  data: FollowupData[];
  loading: boolean;
}

export const MetricsCards = ({ data, loading }: MetricsCardsProps) => {
  const totalMessages = data.length;
  const totalEncerrados = data.filter((item) => item.encerrado === true).length;
  const leadsInProgress = data.filter((item) => !item.encerrado && !item.followup1 && !item.followup2).length;
  const conversionRate = totalMessages > 0 ? ((totalEncerrados / totalMessages) * 100).toFixed(1) : "0";

  const metrics = [
    {
      title: "Mensagens Recebidas",
      value: totalMessages,
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Leads Encerrados",
      value: totalEncerrados,
      icon: Calendar,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Leads em Andamento",
      value: leadsInProgress,
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-accent/5 hover:shadow-primary/20 hover:shadow-2xl hover:ring-2 hover:ring-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`${metric.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
