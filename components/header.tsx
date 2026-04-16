"use client"

import { Radar, Zap } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Radar className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI动态追踪雷达</h1>
            <p className="text-sm text-muted-foreground">全球AI产品动态监测平台</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1.5 text-sm text-accent">
          <Zap className="h-4 w-4" />
          <span>实时更新</span>
        </div>
      </div>
    </header>
  )
}
