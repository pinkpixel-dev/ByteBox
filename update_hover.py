import re

with open('src/app/settings/page.tsx', 'r') as f:
    content = f.read()

# Replace hover:text-[var(--accent-primary)] with group-hover:text-[var(--accent-primary)] for buttons
updated = re.sub(r'(class(?:Name)?=.*?)hover:text-\[var\(--accent-primary\)\]', r'\1group-hover:text-[var(--accent-primary)]', content)

with open('src/app/settings/page.tsx', 'w') as f:
    f.write(updated)
