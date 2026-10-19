import os

file_path = r'C:\Users\hp\Downloads\H-index\Crawlee.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = r"document.getElementById('progressText').innerText = `Processing ${i + 1} of ${staffList.length}: ${staff.name}...`;"
replacement = r"const pEl = document.getElementById('progressText'); if (pEl) pEl.innerText = `Processing ${i + 1} of ${staffList.length}: ${staff.name}...`;"

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced successfully!")
else:
    print("Target not found. Looking for similar...")
    # fallback search
    for line in content.splitlines():
        if "getElementById('progressText')" in line:
            print("Found this line instead:", line.strip())
