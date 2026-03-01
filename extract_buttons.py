
import re

with open(r'c:\Users\ASYV\Desktop\Programming\Personal Projects\CRC\src\framer\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Look for button-like structures
# Framer often uses div with specific classes or data-reset="button"
buttons = re.findall(r'<div[^>]*class=[^>]*framer-[^>]*>.*?</div>', content, re.DOTALL)
for i, btn in enumerate(buttons):
    if 'button' in btn.lower() or 'Submit' in btn or 'Next' in btn:
        print(f"Button {i}:\n{btn[:500]}...\n")

# Also look for anything that looks like a button label
tags = re.findall(r'<p[^>]*class=\"framer-text\"[^>]*>.*?</p>', content)
for tag in tags:
    if any(word in tag for word in ['Next', 'Back', 'Submit', 'Add', 'Cancel']):
        print(f"Label tag: {tag}")
