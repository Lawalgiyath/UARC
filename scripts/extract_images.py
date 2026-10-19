import urllib.request
import re
import os
import json
from bs4 import BeautifulSoup

with open('temp_page.html', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

imgs = []
for img in soup.find_all('img'):
    src = img.get('src') or ''
    srcset = img.get('srcset') or ''
    alt = img.get('alt') or ''
    if 'wp-content/uploads/2026/10' in src:
        orig = re.sub(r'-\d+x\d+(\.[a-zA-Z]+)$', r'\1', src)
        imgs.append({'src': src, 'orig': orig, 'alt': alt})

seen = set()
unique = []
for item in imgs:
    if item['orig'] not in seen:
        seen.add(item['orig'])
        unique.append(item)

print(f"Total unique original images: {len(unique)}")
for i, item in enumerate(unique, 1):
    print(f"{i}: {item['orig']}")

with open('article_images.json', 'w') as out:
    json.dump(unique, out, indent=2)
