"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Calendar, Globe, Package } from "lucide-react"
import { StatsData } from "@/lib/types"

interface StatsCardsProps {
  stats: StatsData
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "累计追踪动态",
      value: stats.totalNews.toLocaleString(),
      icon: TrendingUp,
      suffix: "条",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "本周新增",
      value: stats.weeklyNews.toString(),
      icon: Calendar,
      suffix: "条",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "海外占比",
      value: stats.overseasRatio.toString(),
      icon: Globe,
      suffix: "%",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "产品发布",
      value: stats.productReleases.toString(),
      icon: Package,
      suffix: "次",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {card.value}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {card.suffix}
                  </span>
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
