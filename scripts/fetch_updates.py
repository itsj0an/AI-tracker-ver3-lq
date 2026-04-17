import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

OUTPUT = Path("public/updates.json")
HEADERS = {"User-Agent": "Mozilla/5.0"}


def clean_text(text):
    if text is None:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()


def parse_date(text):
    text = clean_text(text)
    if not text:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    patterns = [
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%b %d, %Y",
        "%B %d, %Y",
        "%a, %d %b %Y %H:%M:%S %Z",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
    ]

    for p in patterns:
        try:
            return datetime.strptime(text, p).strftime("%Y-%m-%d")
        except Exception:
            pass

    m = re.search(r"\d{4}-\d{2}-\d{2}", text)
    if m:
        return m.group(0)

    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def split_tags(value):
    if not value:
        return []
    if isinstance(value, list):
        return [clean_text(x) for x in value if clean_text(x)]
    parts = re.split(r"[、,，;；|/]+", str(value))
    return [clean_text(p) for p in parts if clean_text(p)]


def infer_type(title, summary=""):
    text = f"{title} {summary}".lower()
    if "agent" in text or "agents" in text:
        return "Agent"
    if "api" in text or "sdk" in text or "developer" in text:
        return "开发者工具"
    if "partnership" in text or "enterprise" in text or "compute" in text or "infrastructure" in text:
        return "企业方案"
    if "model" in text or "gpt" in text or "claude" in text or "gemini" in text:
        return "模型升级"
    return "产品发布"


def make_record(
    title="",
    publisher="",
    date="",
    region="海外",
    type_="产品发布",
    source="",
    source_type="官方",
    summary="",
    tracking_value="",
    url="",
    tags=None,
):
    return {
        "标题": clean_text(title),
        "发布方": clean_text(publisher),
        "日期": parse_date(date),
        "地区": clean_text(region) or "海外",
        "类型": clean_text(type_) or "产品发布",
        "来源": clean_text(source),
        "来源类型": clean_text(source_type) or "官方",
        "一句话摘要": clean_text(summary),
        "标签": split_tags(tags),
        "追踪价值总结": clean_text(tracking_value),
        "链接": clean_text(url),
    }


def deduplicate(records):
    seen = set()
    result = []
    for r in records:
        link = clean_text(r.get("链接"))
        title = clean_text(r.get("标题"))
        key = link if link else title
        if not key:
            continue
        if key in seen:
            continue
        seen.add(key)
        result.append(r)
    return result


def sort_records(records):
    def key_func(r):
        try:
            return datetime.strptime(r.get("日期", ""), "%Y-%m-%d")
        except Exception:
            return datetime(1970, 1, 1)

    return sorted(records, key=key_func, reverse=True)


def fetch_html(url):
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    return resp.text


def fetch_openai():
    url = "https://openai.com/news/"
    items = []

    try:
        html = fetch_html(url)
        soup = BeautifulSoup(html, "html.parser")

        seen = set()
        for a in soup.find_all("a", href=True):
            href = clean_text(a.get("href"))
            title = clean_text(a.get_text(" ", strip=True))

            if not href:
                continue
            if not (href.startswith("/news/") or "openai.com/news/" in href):
                continue
            if href in ["/news/", "https://openai.com/news/"]:
                continue

            full_url = href if href.startswith("http") else f"https://openai.com{href}"
            if full_url in seen:
                continue
            seen.add(full_url)

            if len(title) < 8:
                continue

            summary = "OpenAI 发布新的产品、功能或公司动态。"
            tracking_value = "适合持续追踪头部 AI 公司在产品发布、功能更新与商业推进上的最新变化。"
            type_ = infer_type(title, summary)

            tags = ["OpenAI", type_]
            items.append(
                make_record(
                    title=title,
                    publisher="OpenAI",
                    date="",
                    region="海外",
                    type_=type_,
                    source="OpenAI News",
                    source_type="官方",
                    summary=summary,
                    tracking_value=tracking_value,
                    url=full_url,
                    tags=tags,
                )
            )

        return items[:15]
    except Exception as e:
        print("OpenAI fetch failed:", e)
        return []


def fetch_anthropic():
    url = "https://www.anthropic.com/news"
    items = []

    try:
        html = fetch_html(url)
        soup = BeautifulSoup(html, "html.parser")

        seen = set()
        for a in soup.find_all("a", href=True):
            href = clean_text(a.get("href"))
            title = clean_text(a.get_text(" ", strip=True))

            if not href:
                continue
            if not (href.startswith("/news/") or "anthropic.com/news/" in href):
                continue
            if href in ["/news", "/news/", "https://www.anthropic.com/news"]:
                continue

            full_url = href if href.startswith("http") else f"https://www.anthropic.com{href}"
            if full_url in seen:
                continue
            seen.add(full_url)

            if len(title) < 8:
                continue

            summary = "Anthropic 发布 Claude 相关产品、合作或基础设施动态。"
            tracking_value = "适合追踪 Claude 体系在产品能力、企业合作与算力布局上的最新方向。"
            type_ = infer_type(title, summary)

            tags = ["Anthropic", "Claude", type_]
            items.append(
                make_record(
                    title=title,
                    publisher="Anthropic",
                    date="",
                    region="海外",
                    type_=type_,
                    source="Anthropic Newsroom",
                    source_type="官方",
                    summary=summary,
                    tracking_value=tracking_value,
                    url=full_url,
                    tags=tags,
                )
            )

        return items[:15]
    except Exception as e:
        print("Anthropic fetch failed:", e)
        return []


def fetch_google_blog():
    url = "https://blog.google/rss/"
    items = []

    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        root = ET.fromstring(resp.text)

        for item in root.findall(".//item"):
            title = clean_text(item.findtext("title", default=""))
            link = clean_text(item.findtext("link", default=""))
            pub_date = clean_text(item.findtext("pubDate", default=""))
            description = clean_text(item.findtext("description", default=""))

            blob = f"{title} {description}".lower()
            keywords = ["ai", "gemini", "deepmind", "model", "agent", "workspace"]
            if not any(k in blob for k in keywords):
                continue

            summary = "Google 发布与 AI、Gemini 或相关产品能力有关的官方动态。"
            tracking_value = "适合持续观察 Google 在 AI 产品整合、平台能力与生态推进上的方向变化。"
            type_ = infer_type(title, summary)

            tags = ["Google", "AI"]
            if "gemini" in blob:
                tags.append("Gemini")
            tags.append(type_)

            items.append(
                make_record(
                    title=title,
                    publisher="Google",
                    date=pub_date,
                    region="海外",
                    type_=type_,
                    source="Google Blog",
                    source_type="官方",
                    summary=summary,
                    tracking_value=tracking_value,
                    url=link,
                    tags=tags,
                )
            )

        return items[:15]
    except Exception as e:
        print("Google fetch failed:", e)
        return []


def fetch_meta_ai():
    url = "https://ai.meta.com/blog/"
    items = []

    try:
        html = fetch_html(url)
        soup = BeautifulSoup(html, "html.parser")

        seen = set()
        for a in soup.find_all("a", href=True):
            href = clean_text(a.get("href"))
            title = clean_text(a.get_text(" ", strip=True))

            if not href:
                continue
            if "/blog/" not in href and "ai.meta.com/blog/" not in href:
                continue

            full_url = href if href.startswith("http") else f"https://ai.meta.com{href}"
            if full_url in seen:
                continue
            seen.add(full_url)

            if len(title) < 8:
                continue

            summary = "Meta 发布 AI 模型、研究或产品能力相关动态。"
            tracking_value = "适合补充观察大厂在开源模型、多模态能力与 AI 应用方向上的推进。"
            type_ = infer_type(title, summary)

            tags = ["Meta", "AI", type_]
            items.append(
                make_record(
                    title=title,
                    publisher="Meta",
                    date="",
                    region="海外",
                    type_=type_,
                    source="Meta AI Blog",
                    source_type="官方",
                    summary=summary,
                    tracking_value=tracking_value,
                    url=full_url,
                    tags=tags,
                )
            )

        return items[:15]
    except Exception as e:
        print("Meta fetch failed:", e)
        return []


def fetch_mistral():
    url = "https://mistral.ai/news"
    items = []

    try:
        html = fetch_html(url)
        soup = BeautifulSoup(html, "html.parser")

        seen = set()
        for a in soup.find_all("a", href=True):
            href = clean_text(a.get("href"))
            title = clean_text(a.get_text(" ", strip=True))

            if not href:
                continue
            if "/news/" not in href and "mistral.ai/news" not in href:
                continue

            full_url = href if href.startswith("http") else f"https://mistral.ai{href}"
            if full_url in seen:
                continue
            seen.add(full_url)

            if len(title) < 8:
                continue

            summary = "Mistral 发布模型、产品或公司相关动态。"
            tracking_value = "适合补充观察海外模型公司的产品推进、开源策略和企业化方向。"
            type_ = infer_type(title, summary)

            tags = ["Mistral", "海外AI", type_]
            items.append(
                make_record(
                    title=title,
                    publisher="Mistral",
                    date="",
                    region="海外",
                    type_=type_,
                    source="Mistral News",
                    source_type="官方",
                    summary=summary,
                    tracking_value=tracking_value,
                    url=full_url,
                    tags=tags,
                )
            )

        return items[:15]
    except Exception as e:
        print("Mistral fetch failed:", e)
        return []


def main():
    records = []
    records.extend(fetch_openai())
    records.extend(fetch_anthropic())
    records.extend(fetch_google_blog())
    records.extend(fetch_meta_ai())
    records.extend(fetch_mistral())

    records = deduplicate(records)
    records = sort_records(records)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(records)} records to {OUTPUT}")


if __name__ == "__main__":
    main()
