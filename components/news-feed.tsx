"use client"

import { NewsCard } from "./news-card"
import { AINewsItem } from "@/lib/types"
import { FileX } from "lucide-react"

interface NewsFeedProps {
  items: AINewsItem[]
}

export function NewsFeed({ items }: NewsFeedProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
        <FileX className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium text-foreground">暂无匹配的动态</p>
        <p className="mt-2 text-sm text-muted-foreground">请尝试调整筛选条件</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">动态信息流</h2>
        <span className="text-sm text-muted-foreground">
          共 {items.length} 条动态
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
