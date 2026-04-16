"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Flame } from "lucide-react"
import { TrendItem } from "@/lib/types"

interface TrendPanelProps {
  trends: TrendItem[]
}

const hotLevelColors: Record<string, string> = {
  "高": "bg-destructive/20 text-destructive",
  "中": "bg-chart-4/20 text-chart-4",
  "低": "bg-muted text-muted-foreground",
}

export function TrendPanel({ trends }: TrendPanelProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          趋势观察
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {trends.map((trend) => (
          <div
            key={trend.id}
            className="rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:border-primary/50"
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-foreground">{trend.title}</h4>
              <Badge className={`gap-1 ${hotLevelColors[trend.hotLevel]}`}>
                <Flame className="h-3 w-3" />
                {trend.hotLevel}
              </Badge>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              {trend.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {trend.relatedProducts.map((product) => (
                <Badge
                  key={product}
                  variant="outline"
                  className="text-xs"
                >
                  {product}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
