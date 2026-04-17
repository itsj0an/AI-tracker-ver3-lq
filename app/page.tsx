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
  const [searchQuery, setSearchQuery] = useState("")
  
  const [newsItems, setNewsItems] = useState<AINewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"auto" | "fallback" | null>(null)

  // 计算统计数据
  const stats = useMemo<StatsData>(() => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const weeklyNews = newsItems.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= oneWeekAgo
    }).length
    
    const overseasCount = newsItems.filter(item => item.region === "海外").length
    const overseasRatio = newsItems.length > 0 ? Math.round((overseasCount / newsItems.length) * 100) : 0
    
    const productReleases = newsItems.filter(item => item.type === "产品发布").length
    
    return {
      totalNews: newsItems.length,
      weeklyNews,
      overseasRatio,
      productReleases,
    }
  }, [newsItems])

  // 尝试解析并验证 JSON 数据，提取数组
  const parseAndValidateData = (data: unknown, sourceName: string): Record<string, unknown>[] | null => {
    console.log(`[v0] ${sourceName} 原始数据类型:`, typeof data, Array.isArray(data) ? "是数组" : "非数组")
    
    let records: Record<string, unknown>[] = []
    
    // 如果直接是数组
    if (Array.isArray(data)) {
      records = data
    } else if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>
      // 尝试从常见字段提取数组：data, items, records
      if (Array.isArray(obj.data)) {
        records = obj.data
        console.log(`[v0] ${sourceName} 从 data 字段提取数组`)
      } else if (Array.isArray(obj.items)) {
        records = obj.items
        console.log(`[v0] ${sourceName} 从 items 字段提取数组`)
      } else if (Array.isArray(obj.records)) {
        records = obj.records
        console.log(`[v0] ${sourceName} 从 records 字段提取数组`)
      } else {
        // 无法找到数组，返回 null
        console.log(`[v0] ${sourceName} 无法从对象中提取数组`)
        return null
      }
    }
    
    console.log(`[v0] ${sourceName} 标准化后 records.length:`, records.length)
    
    // 验证数据不为空
    if (records.length === 0) {
      return null
    }
    return records
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
        console.log("[v0] /updates.json 响应状态:", response.status)
        if (response.ok) {
          const data = await response.json()
          const records = parseAndValidateData(data, "/updates.json")
          if (records && records.length > 0) {
            const normalizedItems = records.map((record, index) => 
              normalizeRecord(record, index)
            )
            const sortedItems = sortByDateDesc(normalizedItems)
            console.log("[v0] /updates.json 最终用于渲染的 newsItems.length:", sortedItems.length)
            setNewsItems(sortedItems)
            setDataSource("auto")
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.log("[v0] /updates.json 加载失败:", err)
        // 主数据源失败，继续尝试备用数据源
      }

      // 回退到 /tencent_ai_renamed.json
      try {
        const response = await fetch("/tencent_ai_renamed.json")
        console.log("[v0] /tencent_ai_renamed.json 响应状态:", response.status)
        if (!response.ok) {
          throw new Error("备用数据源加载失败")
        }
        const data = await response.json()
        const records = parseAndValidateData(data, "/tencent_ai_renamed.json")
        if (!records || records.length === 0) {
          setError("数据结构异常，无法解析为动态列表")
          return
        }
        const normalizedItems = records.map((record, index) => 
          normalizeRecord(record, index)
        )
        const sortedItems = sortByDateDesc(normalizedItems)
        console.log("[v0] /tencent_ai_renamed.json 最终用于渲染的 newsItems.length:", sortedItems.length)
        setNewsItems(sortedItems)
        setDataSource("fallback")
      } catch (err) {
        console.log("[v0] /tencent_ai_renamed.json 加载失败:", err)
        setError("数据加载失败，请稍后重试。")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const filteredItems = useMemo(() => {
    const result = newsItems.filter((item) => {
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
    console.log("[v0] 当前用于列表渲染的 filteredItems.length:", result.length)
    return result
  }, [newsItems, selectedRegion, selectedType, searchQuery])

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
