export interface AINewsItem {
  id: string
  title: string
  publisher: string
  date: string
  region: "海外" | "国内"
  type: "产品发布" | "功能更新" | "技术突破" | "战略合作" | "融资动态" | "政策法规" | "企业方案" | "开源项目" | "研究动态"
  source: string
  sourceType: "官方公告" | "媒体报道" | "社交媒体" | "行业报告" | "官网" | "论坛"
  summary: string
  tags: string[]
  trackingValue: string
  originalUrl: string
}

export interface TrendItem {
  id: string
  title: string
  description: string
  hotLevel: "高" | "中" | "低"
  relatedProducts: string[]
}

export interface StatsData {
  totalNews: number
  weeklyNews: number
  overseasRatio: number
  productReleases: number
}
