"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { FilterBar } from "@/components/filter-bar"
import { NewsFeed } from "@/components/news-feed"
import { TrendPanel } from "@/components/trend-panel"
import { Footer } from "@/components/footer"
import { mockTrends } from "@/lib/mock-data"
import { normalizeRecord, sortByDateDesc } from "@/lib/normalize"
import { AINewsItem, StatsData } from "@/lib/types"
import { AlertCircle } from "lucide-react"

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("全部")
  const [selectedType, setSelectedType] = useState("全部")
  const [selectedTimeRange, setSelectedTimeRange] = useState("全部")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [newsItems, setNewsItems] = useState<AINewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"auto" | "fallback" | null>(null)



  // 统一数据适配函数：从 payload 中提取记录数组
  function extractRecords(payload: unknown): Record<string, unknown>[] {
    // 1. 如果 payload 是数组，直接返回
    if (Array.isArray(payload)) {
      return payload
    }
    // 2-4. 如果是对象，尝试从 data / items / records 字段提取
    if (payload && typeof payload === "object") {
      const obj = payload as Record<string, unknown>
      if (Array.isArray(obj.data)) {
        return obj.data
      }
      if (Array.isArray(obj.items)) {
        return obj.items
      }
      if (Array.isArray(obj.records)) {
        return obj.records
      }
    }
    // 5. 否则返回空数组
    return []
  }

  // 加载数据 - 双数据源模式
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      setDataSource(null)

      // 优先尝试 /updates.json
      try {
        const response = await fetch("/updates.json")
        if (response.ok) {
          const payload = await response.json()
          const records = extractRecords(payload)
          if (records.length > 0) {
            const normalizedItems = records.map((record, index) => 
              normalizeRecord(record, index)
            )
            const sortedItems = sortByDateDesc(normalizedItems)
            setNewsItems(sortedItems)
            setDataSource("auto")
            setLoading(false)
            return
          }
        }
      } catch {
        // 主数据源失败，继续尝试备用数据源
      }

      // 回退到 /tencent_ai_renamed.json
      try {
        const response = await fetch("/tencent_ai_renamed.json")
        if (!response.ok) {
          throw new Error("备用数据源加载失败")
        }
        const payload = await response.json()
        const records = extractRecords(payload)
        if (records.length === 0) {
          setError("数据结构异常，无法解析为动态列表")
          return
        }
        const normalizedItems = records.map((record, index) => 
          normalizeRecord(record, index)
        )
        const sortedItems = sortByDateDesc(normalizedItems)
        setNewsItems(sortedItems)
        setDataSource("fallback")
      } catch {
        setError("数据加载失败，请稍后重试。")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // 解析日期字符串为 Date 对象，支持 YYYY-MM-DD 格式
  function parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim() === "") return null
    // 尝试解析 YYYY-MM-DD 格式
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const [, year, month, day] = match
      const date = new Date(Number(year), Number(month) - 1, Number(day))
      if (!isNaN(date.getTime())) return date
    }
    // 尝试通用解析
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) return date
    return null
  }

  // 获取时间范围对应的天数
  function getTimeRangeDays(range: string): number | null {
    switch (range) {
      case "最近7天": return 7
      case "最近30天": return 30
      case "最近90天": return 90
      case "最近半年": return 180
      default: return null // "全部"
    }
  }

  const filteredItems = useMemo(() => {
    const now = new Date()
    const days = getTimeRangeDays(selectedTimeRange)
    const cutoffDate = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null

    const result = newsItems.filter((item) => {
      // 时间筛选
      if (cutoffDate) {
        const itemDate = parseDate(item.date)
        // 如果没有合法日期，在非"全部"模式下不显示
        if (!itemDate) return false
        if (itemDate < cutoffDate) return false
      }
      // 地区筛选
      if (selectedRegion !== "全部" && item.region !== selectedRegion) {
        return false
      }
      // 类型筛选
      if (selectedType !== "全部" && item.type !== selectedType) {
        return false
      }
      // 关键词搜索
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(query) ||
          item.publisher.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
        )
      }
      return true
    })
    return result
  }, [newsItems, selectedRegion, selectedType, selectedTimeRange, searchQuery])

  // 计算统计数据 - 基于筛选后的数据
  const stats = useMemo<StatsData>(() => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const weeklyNews = filteredItems.filter(item => {
      const itemDate = parseDate(item.date)
      return itemDate && itemDate >= oneWeekAgo
    }).length
    
    const overseasCount = filteredItems.filter(item => item.region === "海外").length
    const overseasRatio = filteredItems.length > 0 ? Math.round((overseasCount / filteredItems.length) * 100) : 0
    
    const productReleases = filteredItems.filter(item => item.type === "产品发布").length
    
    return {
      totalNews: filteredItems.length,
      weeklyNews,
      overseasRatio,
      productReleases,
    }
  }, [filteredItems])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* 数据源状态提示 */}
        {dataSource && (
          <div className={`mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
            dataSource === "auto" 
              ? "bg-accent/20 text-accent" 
              : "bg-muted text-muted-foreground"
          }`}>
            <div className={`h-2 w-2 rounded-full ${
              dataSource === "auto" ? "bg-accent" : "bg-muted-foreground"
            }`} />
            {dataSource === "auto" 
              ? "当前展示为自动更新数据" 
              : "当前展示为备用数据源"}
          </div>
        )}

        {/* 指标卡片 */}
        <section className="mb-6">
          <StatsCards stats={stats} />
        </section>

        {/* 筛选栏 */}
        <section className="mb-6">
          <FilterBar
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedTimeRange={selectedTimeRange}
            setSelectedTimeRange={setSelectedTimeRange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </section>

        {/* 主内容区：信息流 + 趋势面板 */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-muted-foreground">正在加载数据...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-card py-16">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="mt-4 text-lg font-medium text-foreground">{error}</p>
              </div>
            ) : (
              <NewsFeed items={filteredItems} />
            )}
          </div>
          <div className="lg:col-span-1">
            <TrendPanel trends={mockTrends} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
