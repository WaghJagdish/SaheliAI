"""
services/ocr_service.py — Two-tier OCR: Tesseract (local) and Google Cloud Vision (production).
Controlled by OCR_PROVIDER environment variable.
"""
import os
from dataclasses import dataclass
from config import settings


@dataclass
class OCRResult:
    text: str
    confidence: float
    provider: str


class OCRService:
    """Two-tier OCR: Tesseract for offline/free, Google Vision for production."""

    def __init__(self):
        self.provider = settings.OCR_PROVIDER

    async def extract_text(self, image_path: str) -> OCRResult:
        if settings.DEMO_MODE:
            return self._demo_result(image_path)
        if self.provider == "google_vision":
            return await self._google_vision_extract(image_path)
        return await self._tesseract_extract(image_path)

    def _demo_result(self, image_path: str) -> OCRResult:
        """Return pre-extracted demo text based on filename hint."""
        filename = os.path.basename(image_path).lower()
        if "prescription" in filename or "rx" in filename:
            text = (
                "Dr. Ramesh Sharma, MD (MBBS, MD Medicine)\n"
                "Fortis Hospital, Bangalore\n"
                "Date: 28/02/2026\n\n"
                "Patient: Priya's Mother (Lakshmi Devi)\n\n"
                "Rx:\n"
                "1. Metformin 500mg - BD (Twice Daily, after meals)\n"
                "2. Vitamin D3 60000 IU - Once weekly (Sunday)\n"
                "3. Atorvastatin 10mg - OD at night\n\n"
                "Duration: 30 days. Follow-up: 28/03/2026"
            )
        else:
            text = (
                "ST. MARY'S INTERNATIONAL SCHOOL\n"
                "Circular No. 15/2025-26\n"
                "Date: 25/02/2026\n\n"
                "Dear Parent,\n\n"
                "We are pleased to inform you that our Annual Sports Day will be held on\n"
                "15th March 2026 at the school ground.\n\n"
                "Sports fee: Rs. 250/- to be paid by 10th March 2026.\n\n"
                "Please send your ward in P.E. kit with sports shoes on the day.\n\n"
                "Regards,\nPrincipal"
            )
        return OCRResult(text=text, confidence=0.97, provider="demo")

    async def _tesseract_extract(self, image_path: str) -> OCRResult:
        try:
            import pytesseract
            from PIL import Image

            if settings.TESSERACT_PATH and settings.TESSERACT_PATH != "tesseract":
                pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH

            img = Image.open(image_path).convert("L")  # Grayscale for better OCR
            text = pytesseract.image_to_string(img, lang="eng+hin")
            data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            confidences = [c for c in data["conf"] if c != -1]
            avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
            return OCRResult(text=text, confidence=avg_conf / 100, provider="tesseract")
        except ImportError:
            raise RuntimeError(
                "pytesseract or Pillow not installed. Run: pip install pytesseract Pillow"
            )
        except Exception as e:
            raise RuntimeError(f"Tesseract OCR failed: {e}")

    async def _google_vision_extract(self, image_path: str) -> OCRResult:
        try:
            from google.cloud import vision

            if settings.GOOGLE_VISION_CREDENTIALS_PATH:
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.GOOGLE_VISION_CREDENTIALS_PATH

            client = vision.ImageAnnotatorClient()
            with open(image_path, "rb") as f:
                content = f.read()
            image = vision.Image(content=content)
            response = client.text_detection(image=image)
            texts = response.text_annotations
            text = texts[0].description if texts else ""
            return OCRResult(text=text, confidence=0.95, provider="google_vision")
        except ImportError:
            raise RuntimeError(
                "google-cloud-vision not installed. Run: pip install google-cloud-vision"
            )
        except Exception as e:
            raise RuntimeError(f"Google Vision OCR failed: {e}")


ocr_service = OCRService()
