"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, Target, Database, Lightbulb, User } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Card className="border-border bg-secondary/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              关于本工具
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  工具定位
                </div>
                <p className="text-sm text-muted-foreground">
                  AI动态追踪雷达是一款面向商业分析场景的情报监测工具，专注追踪全球AI产品发布、功能更新与行业趋势。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Database className="h-4 w-4 text-accent" />
                  数据来源
                </div>
                <p className="text-sm text-muted-foreground">
                  整合官方公告、科技媒体、社交平台及行业报告等多渠道信息，确保动态覆盖全面、时效性强。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lightbulb className="h-4 w-4 text-chart-3" />
                  核心价值
                </div>
                <p className="text-sm text-muted-foreground">
                  帮助商业分析师快速掌握AI行业动向，为企业战略决策、竞品分析和市场研究提供数据支撑。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-chart-4" />
                  版本说明
                </div>
                <p className="text-sm text-muted-foreground">
                  当前为MVP演示版本，展示核心功能框架。完整版本将支持数据订阅、智能推荐和深度分析报告等功能。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          © 2026 AI动态追踪雷达 · 商业分析笔试展示项目
        </div>
      </div>
    </footer>
  )
}
