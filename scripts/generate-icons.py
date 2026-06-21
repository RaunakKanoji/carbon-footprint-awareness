import os
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Pillow not found, installing it...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw

def create_icon(size, path):
    # Create an image with transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw an emerald green circle (matching Carbon Compass theme)
    padding = max(1, size // 8)
    draw.ellipse([padding, padding, size - padding, size - padding], fill=(16, 185, 129, 255)) # emerald-500
    
    # Draw a white leaf/compass needle shape
    center = size // 2
    offset = max(1, size // 6)
    draw.polygon([
        (center, center - 2 * offset),
        (center + offset, center),
        (center, center + 2 * offset),
        (center - offset, center)
    ], fill=(255, 255, 255, 255))
    
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "PNG")

if __name__ == "__main__":
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    icon_dir = os.path.join(workspace_dir, "browser-extension", "public", "icons")
    
    create_icon(16, os.path.join(icon_dir, "icon-16.png"))
    create_icon(32, os.path.join(icon_dir, "icon-32.png"))
    create_icon(48, os.path.join(icon_dir, "icon-48.png"))
    create_icon(128, os.path.join(icon_dir, "icon-128.png"))
    print("Successfully generated all extension icons!")
