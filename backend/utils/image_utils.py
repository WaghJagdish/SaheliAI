"""utils/image_utils.py — Image preprocessing for OCR."""
import os


def preprocess_for_ocr(image_path: str, output_path: Optional[str] = None) -> str:
    """Preprocess image for better OCR accuracy (grayscale, denoise, threshold)."""
    try:
        from PIL import Image, ImageFilter, ImageEnhance
        img = Image.open(image_path).convert("L")  # Grayscale
        img = img.filter(ImageFilter.MedianFilter(size=3))  # Denoise
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)  # Increase contrast
        out = output_path or image_path.replace(".", "_processed.")
        img.save(out)
        return out
    except ImportError:
        return image_path  # Return original if PIL not available
    except Exception:
        return image_path


def get_image_url(image_path: str, base_url: str = "") -> str:
    """Convert local file path to accessible URL."""
    filename = os.path.basename(image_path)
    return f"{base_url}/uploads/{filename}" if base_url else f"/uploads/{filename}"


from typing import Optional
