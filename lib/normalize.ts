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
// 辅助函数：处理 null/undefined/"null" 值
function safeString(value: unknown, fallback: string = ""): string {
  if (value === null || value === undefined || value === "null") {
    return fallback
  }
  return String(value)
}

export function normalizeRecord(record: Record<string, unknown>, index: number): AINewsItem {
  // 兼容发布方字段：发布方 / 公司 / company
  const publisher = safeString(record["发布方"], "") || safeString(record["公司"], "") || safeString(record["company"], "未知")
  
  // 兼容摘要字段：一句话摘要 / 摘要 / summary
  const summary = safeString(record["一句话摘要"], "") || safeString(record["摘要"], "") || safeString(record["summary"], "")
  
  // 兼容链接字段：链接 / url（url 可能是数组）
  let originalUrl = "#"
  const urlField = record["链接"] ?? record["url"]
  if (Array.isArray(urlField) && urlField.length > 0) {
    originalUrl = safeString(urlField[0], "#")
  } else if (urlField) {
    originalUrl = safeString(urlField, "#")
  }
  
  // 兼容标签字段：标签 / tag / tags
  const rawTags = record["标签"] ?? record["tag"] ?? record["tags"]
  const tags = parseTags(rawTags)
  
  // 规范化地区为 "海外" 或 "国内"
  const regionRaw = safeString(record["地区"], "") || safeString(record["region"], "")
  const region: "海外" | "国内" = regionRaw.includes("海外") ? "海外" : "国内"
  
  // 规范化类型
  const typeRaw = safeString(record["类型"], "") || safeString(record["type"], "")
  const validTypes = ["产品发布", "功能更新", "技术突破", "战略合作", "融资动态", "政策法规", "企业方案", "开源项目", "研究动态"]
  const type = validTypes.includes(typeRaw) ? typeRaw as AINewsItem["type"] : "功能更新"
  
  // 规范化来源类型
  const sourceTypeRaw = safeString(record["来源类型"], "") || safeString(record["sourceType"], "")
  const validSourceTypes = ["官方公告", "媒体报道", "社交媒体", "行业报告", "官网", "论坛"]
  const sourceType = validSourceTypes.includes(sourceTypeRaw) 
    ? sourceTypeRaw as AINewsItem["sourceType"] 
    : "媒体报道"

  // 兼容日期字段：日期 / 发布日期 / date
  const date = safeString(record["日期"], "") || safeString(record["发布日期"], "") || safeString(record["date"], "")
  
  // 兼容追踪价值字段：追踪价值总结 / 追踪价值 / importance
  const trackingValue = safeString(record["追踪价值总结"], "") || safeString(record["追踪价值"], "") || (record["importance"] ? `重要性: ${record["importance"]}` : "")

  // 标题处理：标题 / title，如果为空则使用公司名
  const rawTitle = safeString(record["标题"], "") || safeString(record["title"], "")
  const title = rawTitle || `${publisher} 动态更新`
  
  // 来源字段：来源 / source
  const source = safeString(record["来源"], "") || safeString(record["source"], "")

  return {
    id: safeString(record["id"], "") || safeString(record["col_1"], `item-${index}`),
    title,
    publisher,
    date,
    region,
    type,
    source,
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
