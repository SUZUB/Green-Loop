"""
GREEN LOOP — Plastic AI Scanner  (HTTP server mode)
====================================================
Runs a lightweight Flask server that:
  POST /scan   — accepts { "image": "<base64 jpeg>" }
               — returns  { "label": str, "classification": "RECYCLABLE"|"NON-RECYCLABLE"|"UNKNOWN", "confidence": float }

Also supports the original interactive CLI:
  python plastic_scanner.py          → menu
  python plastic_scanner.py live     → webcam
  python plastic_scanner.py gallery  → file picker
  python plastic_scanner.py --download → cache model as best.pt

Requires:
    pip install ultralytics opencv-python flask flask-cors
"""

import sys
import base64
import io
import cv2
import numpy as np
from pathlib import Path

try:
    from ultralytics import YOLO
except ImportError:
    print("ERROR: ultralytics not installed.  Run:  pip install ultralytics")
    sys.exit(1)

# ── Model loading ─────────────────────────────────────────────────────────────
LOCAL_MODEL       = Path(__file__).parent / "best.pt"
PRIMARY_HF_MODEL  = "turhancan97/yolov8-segment-trash-detection"
FALLBACK_HF_MODEL = "kendrickfff/waste-classification-yolov8-ken"

def load_model() -> YOLO:
    if LOCAL_MODEL.exists():
        print(f"[Model] Loading local model: {LOCAL_MODEL}")
        return YOLO(str(LOCAL_MODEL))
    try:
        print(f"[Model] Loading from HuggingFace: {PRIMARY_HF_MODEL}")
        return YOLO(PRIMARY_HF_MODEL)
    except Exception as e:
        print(f"[Model] Primary failed ({e}), trying fallback…")
        return YOLO(FALLBACK_HF_MODEL)

model = load_model()

# ── Class → recyclability mapping ────────────────────────────────────────────
RECYCLABLE_CLASSES = {
    "bottle", "plastic", "can", "carton", "cup", "lid",
    "pop_tab", "cardboard", "paper", "metal",
    "brown-glass", "green-glass", "white-glass",
}
NON_RECYCLABLE_CLASSES = {
    "wrapper", "plastic_bag", "plastic_film", "styrofoam",
    "straw", "other", "trash", "biological", "battery", "clothes", "shoes",
}

def classify(label: str) -> str:
    l = label.lower().replace("-", "_").replace(" ", "_")
    if l in RECYCLABLE_CLASSES:
        return "RECYCLABLE"
    if l in NON_RECYCLABLE_CLASSES:
        return "NON-RECYCLABLE"
    if any(k in l for k in ("bottle", "can", "glass", "metal", "paper", "cardboard")):
        return "RECYCLABLE"
    if any(k in l for k in ("bag", "wrap", "film", "foam", "straw", "foil", "laminate")):
        return "NON-RECYCLABLE"
    return "UNKNOWN"

def run_inference(frame: np.ndarray) -> dict:
    """Run YOLO on a BGR numpy frame, return best detection."""
    results = model(frame, verbose=False)
    best = {"label": "unknown", "classification": "UNKNOWN", "confidence": 0.0}
    for r in results:
        for box in (r.boxes or []):
            conf = float(box.conf[0])
            if conf < 0.30:
                continue
            label = model.names[int(box.cls[0])]
            if conf > best["confidence"]:
                best = {
                    "label": label,
                    "classification": classify(label),
                    "confidence": round(conf, 3),
                }
    return best

# ── Flask HTTP server ─────────────────────────────────────────────────────────
def run_server(host: str = "0.0.0.0", port: int = 5050):
    try:
        from flask import Flask, request, jsonify
        from flask_cors import CORS
    except ImportError:
        print("ERROR: flask / flask-cors not installed.")
        print("       Run:  pip install flask flask-cors")
        sys.exit(1)

    app = Flask(__name__)
    CORS(app)  # allow requests from localhost:8080 / 8084

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "model": str(LOCAL_MODEL if LOCAL_MODEL.exists() else PRIMARY_HF_MODEL)})

    @app.route("/scan", methods=["POST"])
    def scan():
        data = request.get_json(force=True, silent=True) or {}
        b64 = data.get("image", "")
        if not b64:
            return jsonify({"error": "No image provided"}), 400

        try:
            img_bytes = base64.b64decode(b64)
            arr = np.frombuffer(img_bytes, dtype=np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is None:
                return jsonify({"error": "Could not decode image"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 400

        result = run_inference(frame)
        return jsonify(result)

    print(f"\n[Server] GREEN LOOP AI Scanner running on http://{host}:{port}")
    print(f"[Server] POST http://localhost:{port}/scan  {{ image: '<base64>' }}")
    print(f"[Server] GET  http://localhost:{port}/health\n")
    app.run(host=host, port=port, debug=False, threaded=True)

# ── Drawing helpers (CLI modes) ───────────────────────────────────────────────
RECYCLABLE_COLOR     = (0, 220, 60)
NON_RECYCLABLE_COLOR = (0, 50, 220)
UNKNOWN_COLOR        = (0, 200, 255)

COLOR_MAP = {
    "RECYCLABLE":     RECYCLABLE_COLOR,
    "NON-RECYCLABLE": NON_RECYCLABLE_COLOR,
    "UNKNOWN":        UNKNOWN_COLOR,
}

def draw_results(frame, results):
    for r in results:
        for box in (r.boxes or []):
            conf = float(box.conf[0])
            if conf < 0.35:
                continue
            label = model.names[int(box.cls[0])]
            classification = classify(label)
            color = COLOR_MAP[classification]
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            text = f"{label.upper()}  {classification}  {conf:.0%}"
            (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(frame, (x1, y1 - th - 12), (x1 + tw + 8, y1), color, -1)
            cv2.putText(frame, text, (x1 + 4, y1 - 6),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    return frame

def draw_hud(frame, mode: str):
    h, w = frame.shape[:2]
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, h - 44), (w, h), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
    cv2.putText(frame, f"GREEN LOOP  |  {mode}  |  Q = quit  |  G = gallery",
                (12, h - 14), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (200, 255, 200), 1)
    return frame

# ── Gallery mode ──────────────────────────────────────────────────────────────
def open_gallery():
    import tkinter as tk
    from tkinter import filedialog
    root = tk.Tk(); root.withdraw()
    path = filedialog.askopenfilename(
        title="Select a plastic image",
        filetypes=[("Images", "*.jpg *.jpeg *.png *.bmp *.webp"), ("All files", "*.*")]
    )
    root.destroy()
    if not path:
        return
    img = cv2.imread(path)
    if img is None:
        print(f"Could not read: {path}"); return
    results = model(img)
    img = draw_results(img, results)
    img = draw_hud(img, "GALLERY MODE")
    max_w, max_h = 1280, 720
    h, w = img.shape[:2]
    if w > max_w or h > max_h:
        scale = min(max_w / w, max_h / h)
        img = cv2.resize(img, (int(w * scale), int(h * scale)))
    cv2.imshow("GREEN LOOP — Plastic Scanner", img)
    cv2.waitKey(0); cv2.destroyAllWindows()

# ── Live camera mode ──────────────────────────────────────────────────────────
def open_live_camera():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Could not open camera."); return
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    print("Live camera active. Q = quit, G = gallery.")
    while cap.isOpened():
        ok, frame = cap.read()
        if not ok: break
        results = model(frame, verbose=False)
        frame = draw_results(frame, results)
        frame = draw_hud(frame, "LIVE CAMERA")
        cv2.imshow("GREEN LOOP — Plastic Scanner", frame)
        key = cv2.waitKey(1) & 0xFF
        if key in (ord("q"), 27): break
        if key == ord("g"):
            cap.release(); cv2.destroyAllWindows()
            open_gallery(); return
    cap.release(); cv2.destroyAllWindows()

# ── Download helper ───────────────────────────────────────────────────────────
def download_model():
    import shutil
    print(f"[Download] Fetching {PRIMARY_HF_MODEL} …")
    m = YOLO(PRIMARY_HF_MODEL)
    cached = Path(m.ckpt_path) if hasattr(m, "ckpt_path") else None
    if cached and cached.exists():
        dest = Path(__file__).parent / "best.pt"
        shutil.copy(cached, dest)
        print(f"[Download] Saved to {dest}")
    else:
        print("[Download] Model cached by Ultralytics automatically.")

# ── Main ──────────────────────────────────────────────────────────────────────
def main_menu():
    print("\n" + "=" * 50)
    print("  GREEN LOOP — Plastic AI Scanner")
    print("=" * 50)
    print("  [1]  Live Camera")
    print("  [2]  Gallery")
    print("  [3]  Start HTTP Server  (for web dashboard)")
    print("  [Q]  Quit")
    print("=" * 50)
    while True:
        choice = input("Choose: ").strip().lower()
        if choice in ("1", "l"):   open_live_camera(); break
        elif choice in ("2", "g"): open_gallery(); break
        elif choice in ("3", "s"): run_server(); break
        elif choice in ("q", "quit", "exit"): sys.exit(0)
        else: print("Enter 1, 2, 3, or Q.")

if __name__ == "__main__":
    arg = sys.argv[1].lower() if len(sys.argv) > 1 else ""
    if arg in ("live", "camera", "1"):   open_live_camera()
    elif arg in ("gallery", "photo", "2"): open_gallery()
    elif arg in ("server", "serve", "3"): run_server()
    elif arg == "--download":             download_model()
    else:                                 main_menu()
