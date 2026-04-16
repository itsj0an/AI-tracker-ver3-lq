"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { FilterBar } from "@/components/filter-bar"
import { NewsFeed } from "@/components/news-feed"
import { TrendPanel } from "@/components/trend-panel"
import { Footer } from "@/components/footer"
import { mockStats, mockNewsItems, mockTrends } from "@/lib/mock-data"

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("全部")
  const [selectedType, setSelectedType] = useState("全部")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = useMemo(() => {
    return mockNewsItems.filter((item) => {
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
  }, [selectedRegion, selectedType, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* 指标卡片 */}
        <section className="mb-6">
          <StatsCards stats={mockStats} />
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
            <NewsFeed items={filteredItems} />
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
