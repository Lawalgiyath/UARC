import urllib.request
import os
import json
import time

os.makedirs('public/images/conference-2026', exist_ok=True)

with open('article_images.json', 'r') as f:
    images = json.load(f)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

downloaded = []
for idx, item in enumerate(images, 1):
    orig = item['orig']
    src = item['src']
    filename = os.path.basename(orig)
    local_path = os.path.join('public/images/conference-2026', filename)
    
    # Try orig first, fallback to src
    success = False
    for target_url in [orig, src]:
        try:
            req = urllib.request.Request(target_url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
                if len(data) > 1000:
                    with open(local_path, 'wb') as out_f:
                        out_f.write(data)
                    print(f"[{idx}/{len(images)}] Downloaded {filename} ({len(data)} bytes) from {target_url}")
                    downloaded.append({
                        'filename': filename,
                        'url': target_url,
                        'size': len(data),
                        'path': f"/images/conference-2026/{filename}"
                    })
                    success = True
                    break
        except Exception as e:
            print(f"[{idx}/{len(images)}] Failed {target_url}: {e}")
    if not success:
        print(f"FAILED to download image {idx}: {orig}")

with open('downloaded_images.json', 'w') as out:
    json.dump(downloaded, out, indent=2)

print(f"Finished downloading {len(downloaded)} / {len(images)} images.")
