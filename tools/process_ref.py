"""把 img_ref/（自然考點導航的小卡插圖，薄荷綠底）處理成遊戲素材，輸出到 img/。
- hero：16:9 橫幅 webp（不去背）
- 其他：從四邊往內找跟底色相近、且連通的像素當背景 → 透明 → 裁邊 → webp
用法：python -I tools/process_ref.py（舊版小卡圖，已改用 img_raw 的 Gemini 新圖）
"""
import os
import numpy as np
import cv2
from PIL import Image
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, DST = os.path.join(ROOT, "img_ref"), os.path.join(ROOT, "img")
os.makedirs(DST, exist_ok=True)

# 遊戲位置 → 來源圖
MAP = {
    "mascot_think": "L08", "mascot_happy": "C04", "mascot_oops": "L09", "mascot_trophy": "P11",
    "mode_speed": "P01", "mode_survive": "L07", "mode_practice": "L01", "mode_duel": "P03",
    "mode_review": "L10", "mode_board": "C01", "mode_dex": "E04",
    "subj_bio": "L03", "subj_chem": "C07", "subj_phy": "P08", "subj_earth": "E01",
}

def cutout(im, lo=9, hi=17):
    """薄荷綠底：底色 G 明顯高於 R；小卡是白／灰（G≈R）。以 G−R 判斷背景，只取跟四邊連通的部分。"""
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    h, w, _ = a.shape
    gr = a[..., 1] - a[..., 0]
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(-1))
    cand = ((gr > lo) & (dist < 70)) | ((dist < 16) & (gr > 4))
    seen = np.zeros((h, w), bool)
    q = deque()
    for y in range(h):
        for x in range(w):
            if (y in (0, h - 1) or x in (0, w - 1)) and cand[y, x]:
                seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and cand[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    alpha = np.ones((h, w), np.float32)
    alpha[seen] = 1 - np.maximum(np.clip((gr[seen] - lo) / (hi - lo), 0, 1), np.clip((16 - dist[seen]) / 8, 0, 1) * (gr[seen] > 4))
    # 清掉零碎小島（壓縮雜訊）：只留面積夠大的不透明區塊
    solid = (alpha > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(solid, 8)
    keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] >= h * w * 0.002
    alpha[(lab > 0) & ~keep[lab]] = 0
    alpha[(solid == 0) & (alpha < 0.35)] = 0
    # 去色溢：半透明邊緣把多出來的綠拉回
    rgb = a.copy()
    spill = np.clip(gr, 0, None) * (1 - alpha)
    rgb[..., 1] -= spill
    out = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)
    res = Image.fromarray(out, "RGBA")
    box = res.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    return res.crop(box) if box else res

def save(im, name, size):
    im.thumbnail((size, size), Image.LANCZOS)
    im.save(os.path.join(DST, name + ".webp"), "WEBP", quality=85)

def main():
    hero = Image.open(os.path.join(SRC, "cover.webp")).convert("RGB")
    hero.save(os.path.join(DST, "hero.webp"), "WEBP", quality=82)
    for name, src in MAP.items():
        save(cutout(Image.open(os.path.join(SRC, src + ".webp"))), name, 400)
    for f in sorted(os.listdir(SRC)):
        stem = f[:-5]
        if len(stem) == 3 and stem[0] in "PCLE":
            save(cutout(Image.open(os.path.join(SRC, f))), "u_" + stem, 160)
    print("done", len(os.listdir(DST)), "files")

if __name__ == "__main__":
    main()
