# 自然戰力覺醒｜學測自然知識挑戰遊戲

> 解鎖知識，挑戰你的自然實力！

學測自然必背考點的計時競賽遊戲（國中版 cap-science-game 的高中版）。

- 題庫共 743 題，只收 108 課綱學測自然 111～115 年（289 題）考過的知識點，每題標示考過的年份與題號，並標示考點類型：
  - 🎯 直接得分（533 題）：記住就能直接判斷學測題的正解或選項對錯。
  - 🧩 判讀基礎（210 題）：學測題要讀圖、計算或推理，但必須先記得這個知識點。
  - 來源分四種，顯示在題目標籤：課本考點（四科必修課本）；「・另版CHn」（四科第二版本課本才有，`src/bank_<科>_v2.json`，兩版比對見 `work/report_<科>_v2.json`）；「・國中學過」與「・高中選修」（學測考過但兩版必修課本都沒有，放 `src/bank_<科>_extra.json`；依國中版南一七上～九下題庫比對分類，證據在 `work/audit/jr_labels.json`）。
  - 2026-11 逐題盤點後刪除 184 題：考題沒用到、題幹已給出、人名年代單位等瑣碎細節、只是情境、或只是重做考題計算。逐題判定與理由見 `work/audit/盤點報告.html`（`report.json`、`deleted.json`）。
- 模式：極速 60 秒、生存挑戰、單元特訓、雙人對決、錯題特訓、排行榜、考點圖鑑；可依科目、單元、考過年份篩選。
- 音效：WebAudio 即時合成的對戰風音效（不用音檔），含倒數開戰、揮劍命中（連對越多音越高）、連擊升級、被擊中、失去生命、最後幾秒心跳、時間到、結算與破紀錄號角；首頁喇叭鈕可關閉。
- 學習紀錄與排行榜只存在各自的裝置（localStorage，前綴 gsatgame_，與國中版分開）。

## 檔案
- `src/bank_phy.json`、`bank_chem.json`、`bank_bio.json`、`bank_earth.json`：課本考點；`src/bank_<科>_extra.json`：課本外的學測考點（`ch` 為「・國中學過」或「・高中選修」）。每題 `{u, t:"mc"|"tf", q, a, w[3] | tf, exp, ch, refs:["113-05"]}`
- `src/gsat_ref/`：歷屆學測自然逐題資料（取自自然考點導航 gsat-science-map 的 tools/data、detail2）
- `src/exam_index/gsat_N111_115.jsonl`：289 題考點索引
- `src/template.html`：遊戲本體；`node build.js` 組出 `index.html`（沒有 refs 或重複的題目不收）
- `img/`：遊戲圖片。新版對戰風圖片由老師用 Gemini 生成：提示詞在 `Gemini生圖提示詞.md`，用「生圖工作台」（`python -I -X utf8 tools/studio_server.py`，http://localhost:8768/）貼上，原圖存 `img_raw/`、自動去背縮圖到 `img/`。還沒換的位置沿用舊版小卡圖（來源 `img_ref/`，`tools/process_ref.py`）。單元標籤改用科目徽章。
- `tools/UPDATE.md`：每年加入新一屆學測的步驟（排程 gsat-science-game-yearly-update 每年 3/16 執行）
- `tools/apply_audit.js`：套用盤點結果（含老師規則覆核）；`tools/check_bank.js`：格式檢查；`tools/gen/`：各科產生題庫的腳本
- `work/report_chem.md`、`work/report_bio.md`：各章候選、保留、刪除的知識點清單
- `work/books/`：課本 PDF 與抽出的文字（不上傳）

## 單元
沿用自然考點導航的 38 單元代碼，目前 38 個單元都有題目；沒有題目的單元遊戲會自動隱藏。
