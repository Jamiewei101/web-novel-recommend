#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re, os, json, sys
from curl_cffi import requests

proj = 'C:/Users/Lenovo/Desktop/网络小说出海推荐网页'
os.chdir(proj)

# 所有需要封面的小说（百度百科URL）
novels_to_find = {
    '魔道祖师': 'https://baike.baidu.com/item/%E9%AD%94%E9%81%93%E7%A5%96%E5%B8%88/131877413',
    '天官赐福': 'https://baike.baidu.com/item/%E5%A4%A9%E5%AE%98%E8%B5%90%E7%A6%8F/22170872',
    '仙王的日常生活': 'https://baike.baidu.com/item/%E4%BB%99%E7%8E%8B%E7%9A%84%E6%97%A5%E5%B8%B8%E7%94%9F%E6%B4%BB/20607819',
    '紫府仙缘': 'https://baike.baidu.com/item/%E7%B4%AB%E5%BA%9C%E4%BB%99%E7%BC%98/392288',
    '重生之都市修仙': 'https://baike.baidu.com/item/%E9%87%8D%E7%94%9F%E4%B9%8B%E9%83%BD%E5%B8%82%E4%BF%AE%E4%BB%99/60641020',
    '医道官途': 'https://baike.baidu.com/item/%E5%8C%BB%E9%81%93%E5%AE%98%E9%80%94/25662',
    '我真是大明星': 'https://baike.baidu.com/item/%E6%88%91%E7%9C%9F%E6%98%AF%E5%A4%A7%E6%98%8E%E6%98%9F/18660979',
    '末日轮盘': 'https://baike.baidu.com/item/%E6%9C%AB%E6%97%A5%E8%BD%AE%E7%9B%98/19842929',
    '星穹之主': 'https://baike.baidu.com/item/%E6%98%9F%E7%A9%B9%E4%B9%8B%E4%B8%BB/22853687',
    '深空之下': 'https://baike.baidu.com/item/%E6%B7%B1%E7%A9%BA%E4%B9%8B%E4%B8%8B/19661183',
    '噩梦惊袭': 'https://baike.baidu.com/item/%E5%99%A9%E6%A2%A6%E6%83%8A%E8%A2%AD/61986926',
    '苗疆蛊事': 'https://baike.baidu.com/item/%E8%8B%97%E7%96%86%E8%9B%8A%E4%BA%8B/16177111',
    '鬼吹灯': 'https://baike.baidu.com/item/%E9%AC%BC%E5%90%B9%E7%81%AF/3017',
    '死亡万花筒': 'https://baike.baidu.com/item/%E6%AD%BB%E4%BA%A1%E4%B8%87%E8%8A%B1%E7%AD%92/23351785',
    '全球高考': 'https://baike.baidu.com/item/%E5%85%A8%E7%90%83%E9%AB%98%E8%80%83/24288591',
    '我在泰国卖佛牌': 'https://baike.baidu.com/item/%E6%88%91%E5%9C%A8%E6%B3%B0%E5%9B%BD%E5%8D%96%E4%BD%9B%E7%89%8C/24513828',
    '三体': 'https://baike.baidu.com/item/%E4%B8%89%E4%BD%93/5733909',
    '微微一笑很倾城': 'https://baike.baidu.com/item/%E5%BE%AE%E5%BE%AE%E4%B8%80%E7%AC%91%E5%BE%88%E5%80%BE%E5%9F%8E/10603311',
    '何以笙箫默': 'https://baike.baidu.com/item/%E4%BD%95%E4%BB%A5%E7%AC%99%E7%AE%AB%E9%BB%98/10687738',
    '花千骨': 'https://baike.baidu.com/item/%E8%8A%B1%E5%8D%83%E9%AA%A8/7683709',
    '三生三世十里桃花': 'https://baike.baidu.com/item/%E4%B8%89%E7%94%9F%E4%B8%89%E4%B8%96%E5%8D%81%E9%87%8C%E6%A1%83%E8%8A%B1/6137',
    '香蜜沉沉烬如霜': 'https://baike.baidu.com/item/%E9%A6%99%E8%9C%9C%E6%B2%89%E6%B2%89%E7%83%AC%E5%A6%82%E9%9C%9C/20408915',
    '知否知否应是绿肥红瘦': 'https://baike.baidu.com/item/%E7%9F%A5%E5%90%A6%E7%9F%A5%E5%90%A6%E5%BA%94%E6%98%AF%E7%BB%BF%E8%82%A5%E7%BA%A2%E7%98%A6/17526861',
    '琅琊榜': 'https://baike.baidu.com/item/%E7%90%85%E7%90%8A%E6%A6%9C/2135131',
    '扶摇': 'https://baike.baidu.com/item/%E6%89%B6%E6%91%87/13402278',
    '穿越之诗酒趁年华': 'https://baike.baidu.com/item/%E7%A9%BF%E8%B6%8A%E4%B9%8B%E8%AF%97%E9%85%92%E8%B6%81%E5%B9%B4%E5%8D%8E/16696896',
    '十年一品温如言': 'https://baike.baidu.com/item/%E5%8D%81%E5%B9%B4%E4%B8%80%E5%93%81%E6%B8%A9%E5%A6%82%E8%A8%80/10661887',
    '我在精神病院学斩神': 'https://baike.baidu.com/item/%E6%88%91%E5%9C%A8%E7%B2%BE%E7%A5%9E%E7%97%85%E9%99%A2%E5%AD%A6%E6%96%A9%E7%A5%9E/58937945',
}

with open('novels.json', encoding='utf-8') as f:
    novels_list = json.load(f)

name_to_id = {n['title']['zh']: n['id'] for n in novels_list}

for name, url in novels_to_find.items():
    try:
        r = requests.get(url, impersonate='chrome', timeout=10)
        if r.status_code == 200:
            text = r.text
            # 找 bkimg.cdn.bcebos.com 的图片
            pattern = r'https://bkimg\.cdn\.bcebos\.com/pic/[^"\'\\ ]+'
            matches = re.findall(pattern, text)
            found_img = None
            for m in matches:
                # 清理掉 ?x-bce-process 等参数
                m_clean = m.split('?')[0]
                if m_clean.endswith(('.jpg', '.png', '.jpeg', '.webp')):
                    found_img = m_clean
                    break
            if not found_img:
                # 尝试其他任何 baike 相关的大图
                pattern2 = r'https://bkimg[^"\'\\ ]+\.(?:jpg|png|jpeg)'
                matches2 = re.findall(pattern2, text)
                if matches2:
                    found_img = matches2[0].split('?')[0]
            if found_img:
                nid = name_to_id.get(name)
                if nid:
                    r2 = requests.get(found_img, impersonate='chrome', timeout=10)
                    if r2.status_code == 200 and len(r2.content) > 3000:
                        fname = f'covers_real/cover_{nid}.jpg'
                        with open(fname, 'wb') as f:
                            f.write(r2.content)
                        for n in novels_list:
                            if n['id'] == nid:
                                n['cover'] = fname
                                break
                        print(f'OK: {name} -> {fname} ({len(r2.content)} bytes)')
                    else:
                        print(f'IMGFAIL: {name} -> HTTP {r2.status_code}, size={len(r2.content)} bytes, URL: {found_img[:80]}')
                else:
                    print(f'NOMAP: {name}')
            else:
                print(f'NOIMG: {name} (status {r.status_code}, len {len(text)})')
        elif r.status_code == 403:
            # 403 - 试试用 requests 库（非 curl_cffi）
            print(f'BLOCKED: {name} (HTTP 403)')
        else:
            print(f'FAIL: {name} (HTTP {r.status_code})')
    except Exception as e:
        print(f'ERROR: {name} -> {e}')

with open('novels.json', 'w', encoding='utf-8') as f:
    json.dump(novels_list, f, ensure_ascii=False, indent=2)

real = sum(1 for n in novels_list if n['cover'].startswith('covers_real'))
svg = sum(1 for n in novels_list if not n['cover'].startswith('covers_real'))
print(f'\nTotal: {len(novels_list)}, Real: {real}, SVG: {svg}')
