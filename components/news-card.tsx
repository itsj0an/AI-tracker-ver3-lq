"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Building2, Calendar, MapPin, FileText, Link2, Lightbulb } from "lucide-react"
import { AINewsItem } from "@/lib/types"

interface NewsCardProps {
  item: AINewsItem
}

const typeColors: Record<string, string> = {
  "产品发布": "bg-primary/20 text-primary border-primary/30",
  "功能更新": "bg-accent/20 text-accent border-accent/30",
  "技术突破": "bg-chart-3/20 text-chart-3 border-chart-3/30",
  "战略合作": "bg-chart-4/20 text-chart-4 border-chart-4/30",
  "融资动态": "bg-chart-5/20 text-chart-5 border-chart-5/30",
  "政策法规": "bg-muted text-muted-foreground border-muted",
}

const regionColors: Record<string, string> = {
  "海外": "bg-primary/10 text-primary",
  "国内": "bg-accent/10 text-accent",
}

export function NewsCard({ item }: NewsCardProps) {
  return (
    <Card className="border-border bg-card transition-all hover:border-primary/50">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          {/* 标题和徽章 */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold leading-tight text-foreground">
              {item.title}
            </h3>
            <Badge 
              variant="outline" 
              className={`shrink-0 ${typeColors[item.type]}`}
            >
              {item.type}
            </Badge>
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              <span>{item.publisher}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{item.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <Badge variant="secondary" className={regionColors[item.region]}>
                {item.region}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>{item.sourceType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Link2 className="h-4 w-4" />
              <span>{item.source}</span>
            </div>
          </div>

          {/* 摘要 */}
          <p className="text-sm leading-relaxed text-foreground/90">
            {item.summary}
          </p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="bg-secondary text-secondary-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* 追踪价值 */}
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Lightbulb className="h-4 w-4" />
              <span>追踪价值</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {item.trackingValue}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(item.originalUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              查看原文
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
