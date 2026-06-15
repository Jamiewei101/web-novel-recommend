#!/usr/bin/env python3
"""
从 NovelUpdates 抓取真实小说数据并生成 novels.json
需要 Node.js 环境（用于运行 generate-covers.js 生成封面）
"""
import json, os, time, random
from curl_cffi import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.novelupdates.com"
GENRES = ["Xianxia", "Xuanhuan", "Urban", "Sci-fi", "Romance", "Mystery"]
# 对应 NovelUpdates 的题材 ID（从 series-finder 页面获取）
GENRE_IDS = {
    "Xianxia": "226",
    "Xuanhuan": "225",
    "Urban": "240",
    "Sci-fi": "237",
    "Romance": "222",
    "Mystery": "236",
}

session = requests.Session(impersonate="chrome")
session.headers.update({
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.novelupdates.com/",
})

def fetch_series_finder(genre_id, page=1):
    """获取指定题材的排行榜页面"""
    params = {
        "sf": "1",
        "gi": genre_id,
        "sort": "sread",  # 按读者数排序
        "order": "desc",
        "pg": str(page),
    }
    try:
        r = session.get(f"{BASE_URL}/series-finder/", params=params, timeout=15)
        if r.status_code == 200:
            return BeautifulSoup(r.content, "html.parser")
    except Exception as e:
        print(f"  ❌ 请求失败: {e}")
    return None

def parse_series_list(html):
    """解析系列列表页面"""
    items = html.select("div.search_result")
    results = []
    for item in items:
        title_el = item.select_one("div.search_title a")
        if not title_el:
            continue
        title = title_el.text.strip()
        url = title_el.get("href", "")
        slug = url.strip("/").split("/")[-1] if url else ""
        results.append({"title": title, "slug": slug, "url": url})
    return results

def fetch_book_detail(slug):
    """获取小说详情"""
    try:
        r = session.get(f"{BASE_URL}/series/{slug}/", timeout=15)
        if r.status_code != 200:
            return None
        html = BeautifulSoup(r.content, "html.parser")

        # 题材
        genre_el = html.find("div", id="seriesgenre")
        genres = [a.text.strip() for a in genre_el.find_all("a")] if genre_el else []

        # 标签
        tags_el = html.find("div", id="showtags")
        tags = [a.text.strip() for a in tags_el.find_all("a")] if tags_el else []

        # 评分
        rating = 0.0
        rating_el = html.select_one("span.uvotes")
        if rating_el:
            try: rating = float(rating_el.text.strip()[1:4])
            except: pass

        # 章节数
        chapters = 0
        ch_el = html.select_one("div#editchapter")
        if ch_el:
            try: chapters = int(ch_el.text.strip().replace(",", ""))
            except: pass

        # 状态
        status = "Ongoing"
        status_el = html.find("b", string=lambda t: t and "Status" in t)
        if status_el:
            parent = status_el.parent
            if parent:
                status_text = parent.get_text(strip=True)
                if "Completed" in status_text: status = "Completed"
                elif "Hiatus" in status_text: status = "Hiatus"

        return {
            "genres": genres,
            "tags": tags[:5],
            "rating": rating,
            "chapters": chapters,
            "status": status,
        }
    except Exception as e:
        print(f"  ❌ 获取详情失败: {e}")
        return None

def main():
    all_novels = []
    novel_id = 1

    for genre_key, genre_id in GENRE_IDS.items():
        print(f"\n📂 获取 [{genre_key}] 题材...")
        for page in range(1, 3):  # 每个题材爬 2 页
            print(f"  第 {page} 页...")
            html = fetch_series_finder(genre_id, page)
            if not html:
                print("  ❌ 获取列表失败")
                continue

            series_list = parse_series_list(html)
            print(f"  找到 {len(series_list)} 部小说")

            for s in series_list[:10]:  # 每页取前10
                if novel_id > 60:  # 最多 60 部
                    break

                print(f"  📖 {s['title'][:30]}...", end=" ")
                detail = fetch_book_detail(s["slug"])
                if not detail:
                    print("❌")
                    time.sleep(random.uniform(2, 4))
                    continue

                novel = {
                    "id": novel_id,
                    "title": {"zh": s["title"], "en": s["title"]},
                    "author": {"zh": "Unknown", "en": "Unknown"},
                    "rating": detail["rating"],
                    "readers": 0,
                    "genres": detail["genres"][:3] or [genre_key],
                    "summary": {"zh": "", "en": ""},
                    "chapters": detail["chapters"],
                    "status": {"zh": "连载中" if detail["status"] == "Ongoing" else "已完结", "en": detail["status"]},
                    "tags": detail["tags"],
                }
                all_novels.append(novel)
                print(f"✅ (ID: {novel_id})")
                novel_id += 1
                time.sleep(random.uniform(2, 5))

            if novel_id > 60:
                break
            time.sleep(random.uniform(3, 6))

        if novel_id > 60:
            break

    # 保存
    output_path = os.path.join(os.path.dirname(__file__), "novels.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_novels, f, ensure_ascii=False, indent=2)
    print(f"\n🎉 完成！共获取 {len(all_novels)} 部小说")
    print(f"   已保存到 {output_path}")

if __name__ == "__main__":
    main()
