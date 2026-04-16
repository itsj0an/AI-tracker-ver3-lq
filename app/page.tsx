"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { FilterBar } from "@/components/filter-bar"
import { NewsFeed } from "@/components/news-feed"
import { TrendPanel } from "@/components/trend-panel"
import { Footer } from "@/components/footer"
import { mockStats, mockTrends } from "@/lib/mock-data"
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

  // 计算统计数据
  const stats = useMemo<StatsData>(() => {
    if (newsItems.length === 0) return mockStats
    
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

  // 加载数据
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch("/tencent_ai_renamed.json")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // 确保数据是数组
        const records = Array.isArray(data) ? data : []
        
        // 规范化并排序
        const normalizedItems = records.map((record, index) => 
          normalizeRecord(record as Record<string, unknown>, index)
        )
        const sortedItems = sortByDateDesc(normalizedItems)
        
        setNewsItems(sortedItems)
      } catch (err) {
        console.error("数据加载失败:", err)
        setError("数据加载失败，请检查 JSON 文件路径或格式。")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const filteredItems = useMemo(() => {
    return newsItems.filter((item) => {
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
  }, [newsItems, selectedRegion, selectedType, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
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
