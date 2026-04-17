"use client"

import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

interface FilterBarProps {
  selectedRegion: string
  setSelectedRegion: (region: string) => void
  selectedType: string
  setSelectedType: (type: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const regions = ["全部", "海外", "国内"]
const types = ["全部", "产品发布", "功能更新", "模型升级", "技术突破", "战略合作", "融资动态", "融资合作", "政策法规", "企业方案", "开源项目", "研究动态", "开发者工具"]

export function FilterBar({
  selectedRegion,
  setSelectedRegion,
  selectedType,
  setSelectedType,
  searchQuery,
  setSearchQuery,
}: FilterBarProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">筛选：</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">地区：</span>
            {regions.map((region) => (
              <Button
                key={region}
                variant={selectedRegion === region ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRegion(region)}
                className="h-7 px-3 text-xs"
              >
                {region}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">类型：</span>
            {types.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="h-7 px-3 text-xs"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索关键词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-input pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:w-64"
          />
        </div>
      </div>
    </div>
  )
}
