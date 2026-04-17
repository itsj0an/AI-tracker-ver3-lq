import { AINewsItem } from "./types"

/**
 * 将标签字符串按顿号、逗号、分号、斜杠拆分成数组
 */
function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map(t => String(t).trim()).filter(Boolean)
  }
  if (typeof tags === "string") {
    return tags
      .split(/[、,，;；/／]/)
      .map(t => t.trim())
      .filter(Boolean)
  }
  return []
}

/**
 * 规范化单条记录，兼容中文字段名和可能的替代字段
 */
export function normalizeRecord(record: Record<string, unknown>, index: number): AINewsItem {
  // 兼容发布方字段：发布方 / 公司
  const publisher = String(record["发布方"] ?? record["公司"] ?? "未知")
  
  // 兼容摘要字段：一句话摘要 / 摘要
  const summary = String(record["一句话摘要"] ?? record["摘要"] ?? "")
  
  // 兼容链接字段：链接 / url
  const originalUrl = String(record["链接"] ?? record["url"] ?? "#")
  
  // 兼容标签字段：标签 / tag / tags
  const rawTags = record["标签"] ?? record["tag"] ?? record["tags"]
  const tags = parseTags(rawTags)
  
  // 规范化地区为 "海外" 或 "国内"
  const regionRaw = String(record["地区"] ?? "")
  const region: "海外" | "国内" = regionRaw.includes("海外") ? "海外" : "国内"
  
  // 规范化类型
  const typeRaw = String(record["类型"] ?? "")
  const validTypes = ["产品发布", "功能更新", "技术突破", "战略合作", "融资动态", "政策法规"]
  const type = validTypes.includes(typeRaw) ? typeRaw as AINewsItem["type"] : "功能更新"
  
  // 规范化来源类型
  const sourceTypeRaw = String(record["来源类型"] ?? "")
  const validSourceTypes = ["官方公告", "媒体报道", "社交媒体", "行业报告"]
  const sourceType = validSourceTypes.includes(sourceTypeRaw) 
    ? sourceTypeRaw as AINewsItem["sourceType"] 
    : "媒体报道"

  // 兼容日期字段：日期 / 发布日期
  const date = String(record["日期"] ?? record["发布日期"] ?? "")
  
  // 兼容追踪价值字段：追踪价值总结 / 追踪价值
  const trackingValue = String(record["追踪价值总结"] ?? record["追踪价值"] ?? "")

  return {
    id: String(record["id"] ?? record["col_1"] ?? `item-${index}`),
    title: String(record["标题"] ?? "无标题"),
    publisher,
    date,
    region,
    type,
    source: String(record["来源"] ?? ""),
    sourceType,
    summary,
    tags,
    trackingValue,
    originalUrl,
  }
}

/**
 * 按日期排序（最新优先）
 */
export function sortByDateDesc(items: AINewsItem[]): AINewsItem[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date).getTime() || 0
    const dateB = new Date(b.date).getTime() || 0
    return dateB - dateA
  })
}
