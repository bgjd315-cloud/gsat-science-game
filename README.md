# 自然戰力覺醒｜學測自然知識挑戰遊戲

> 解鎖知識，挑戰你的自然實力！

學測自然必背考點的計時競賽遊戲（國中版 cap-science-game 的高中版）。

- 題庫：從 115 學年度高中物理、化學、生物、地科（全）課本抽出要背誦的知識點，逐點比對 108 課綱學測自然 111～115 年共 289 題，只保留考過的，出成 672 題（選擇 438、是非 234）。每題標示考過的年份與題號。
- 模式：極速 60 秒、生存挑戰、單元特訓、雙人對決、錯題特訓、排行榜、考點圖鑑；可依科目、單元、考過年份篩選。
- 學習紀錄與排行榜只存在各自的裝置（localStorage，前綴 gsatgame_，與國中版分開）。

## 檔案
- `src/bank_phy.json`、`bank_chem.json`、`bank_bio.json`、`bank_earth.json`：題庫，每題 `{u, t:"mc"|"tf", q, a, w[3] | tf, exp, ch, refs:["113-05"]}`
- `src/gsat_ref/`：歷屆學測自然逐題資料（取自自然考點導航 gsat-science-map 的 tools/data、detail2）
- `src/exam_index/gsat_N111_115.jsonl`：289 題考點索引
- `src/template.html`：遊戲本體；`node build.js` 組出 `index.html`（沒有 refs 或重複的題目不收）
- `img/`：遊戲圖片，來源是 `img_ref/`（自然考點導航的吉祥物小卡，Canva AI 生成），`python -I tools/process_images.py` 去背縮圖；哪張圖放哪個位置寫在腳本的 MAP
- `tools/UPDATE.md`：每年加入新一屆學測的步驟（排程 gsat-science-game-yearly-update 每年 3/16 執行）
- `tools/check_bank.js`：格式檢查；`tools/gen/`：各科產生題庫的腳本
- `work/report_chem.md`、`work/report_bio.md`：各章候選、保留、刪除的知識點清單
- `work/books/`：課本 PDF 與抽出的文字（不上傳）

## 單元
沿用自然考點導航的 38 單元代碼；必修課本沒教、因此沒有題目的單元（P03、C07、C08、L05、L07、L08、L09）不顯示。
