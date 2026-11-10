# 年度更新：加入新一屆學測自然

每年 3/16 由排程 `gsat-science-game-yearly-update` 執行（自然考點導航的排程 `sci-map-116-gsat` 每年 3/2 先把新年度學測自然整理好，這裡直接沿用它的資料）。以下 `NEW` 代表新年度民國年（例如 116）。

原則（老師指定，不要改）：只收**學測自然**，不收分科；只用 108 課綱以後（111 年起）；**沒有在學測考過的知識點不放進遊戲**。知識點分兩種：
- 課本考點：來自高中物理、化學、生物、地科（全）部定必修課本，放在 `src/bank_<科>.json`。
- 學測補充：學測考過、但必修課本沒有的內容（選修或國中內容），放在 `src/bank_<科>_extra.json`，`ch` 固定為 `"・學測補充"`。
- 老師刪過、不要再加回的：黑體溫度升高峰值波長變短、藍白恆星溫度較高（物理）；溫度越高酵素活性一定越強、釀酒酵母有氧下仍可發酵、幹細胞（生物）；重力波不屬於電磁波、臺灣地表出露最廣是沉積岩、大地震使地表瞬間抬升（地科）。純讀圖或計算、沒有可背知識的考題不出題。

## 0. 準備與檢查
1. `cd "C:\Claude 系統及作品\gsat-science-game" && git pull`（資料夾不在就 `gh repo clone bgjd315-cloud/gsat-science-game "C:\Claude 系統及作品\gsat-science-game"`）。
2. 若 `src/gsat_ref/data/NNEW.json` 已存在，代表今年做過了，回報後結束。
3. 取自然考點導航的新年度資料：
   ```
   gh api repos/bgjd315-cloud/gsat-science-map/contents/tools/data/NNEW.json --jq .download_url
   gh api repos/bgjd315-cloud/gsat-science-map/contents/tools/detail2/NNEW.json --jq .download_url
   ```
   兩個都要有。任一個不存在（404），代表自然考點導航還沒加入今年學測：**不要改任何檔案、不要 push**，回報「自然考點導航尚未加入 NEW 年學測自然，請先確認排程 sci-map-116-gsat 是否跑過，之後再手動執行本排程」，結束。
   有的話下載到 `src/gsat_ref/data/` 與 `src/gsat_ref/detail2/`。
4. 課本文字在 `work/books/<物理|化學|生物|地科>/*.txt`（不進 git）。不存在時，看 `C:\Users\bgjd3\Downloads\` 有沒有「115學年度_高中_<科>_檔案資源_教材資源_高中<科>(全).zip」（或更新學年度的同名檔），解壓到 `work/books/<科>/`，用 pymupdf 把每個 PDF 抽成同名 .txt。都找不到就停下來回報，請老師把四科課本 zip 放回下載資料夾。

## 1. 更新考點索引
把 NNEW 的題目照現有格式附加到 `src/exam_index/gsat_N111_115.jsonl`（每題一行：y, n, u, un, sec, topic, pts, pitfall, diff；pts 取 detail2 的 formulas 文字與 takeaway）。檔名保留不改。

## 2. 四科比對（可交給 4 個子代理平行，一科一個）
每個子代理要拿到：該科課本 txt、`src/gsat_ref/data/NNEW.json` 與 `detail2/NNEW.json`、該科現有題庫 `src/bank_<phy|chem|bio|earth>.json` 與 `src/bank_<科>_extra.json`、`src/gsat_ref/units.json`，以及下面規則原文：

- 只看 NEW 年學測自然的題目（全部題目都要掃，物理知識可能出現在地科題，以此類推）。
- **A. 補出處**：現有題庫中，考點在 NEW 年某題確實被考到或解題必須用到（或就是某選項在判斷的內容）的題目，在 `refs` 加上 `"NEW-題號"`（題號補成兩位數，例如 `"116-05"`）。不要牽強。
- **B. 新增課本考點**：課本裡要背誦的知識點，若 NEW 年考到、但題庫還沒有，就出 1–3 題加入 `bank_<科>.json`，`refs` 填 NEW 的題號。
- **C. 新增學測補充**：NEW 年考到、但課本沒有的知識點（選修或國中內容），出 1–3 題加入 `bank_<科>_extra.json`，`ch` 為 `"・學測補充"`。現有補充題若 NEW 年又考到，同 A 補 refs。
- 跨科避免重複：先掃過四科的 bank 與 extra，同一知識點只出現在一科。
- 題目格式與現有一樣：
  `{"u":"P04","t":"mc","q":"…","a":"正解","w":["誤1","誤2","誤3"],"exp":"考點說明","ch":"CH5","refs":["116-05"]}`
  `{"u":"P11","t":"tf","q":"敘述","tf":true,"exp":"…","ch":"CH6","refs":["116-20"]}`
  題目約 45 字內、選項約 20 字內、不靠圖；選擇題錯誤選項要合理（可用 pitfall）；是非題約占新增題的三成、對錯約各半；純文字不用 LaTeX，化學式用 Unicode 下標（CO₂、H₂O）；內容以課本為準。
- 不刪除舊題，不改舊題文字；題目文字不可與現有題目重複（題目文字是遊戲錯題本的 ID）。
- u 用 units.json 的代碼（38 個單元都已在遊戲裡；沒有題目的單元會自動隱藏，不必改 template）。
- 子代理回報：補了幾題出處、新增幾題（選擇／是非）、各單元增加數、NEW 年有哪些題目內容對不到課本。

## 3. 檢查與建置
```
node tools/check_bank.js      # ascii formula / latex 要 0；看是非真假比例
node build.js                 # dropped 應只有原本的 1 題重複
```
再把 index.html 第二個 `<script>` 抽出來 `node --check`。用 python http.server 或預覽開本機頁面，確認首頁「考過年份」多了 NEW 年、頁尾顯示「111～NEW」、答題後出處列出 NEW 年題號。

## 4. 更新說明文字
- `README.md`：題數（選擇／是非）與年份範圍。
- 佳慧老師的網站總覽 https://claude.ai/artifact/EtpwShg6DGoTnEd4mNBUUr ：「高中生 › 遊戲化複習」裡「自然戰力覺醒（學測版）」那張卡的 desc，只改題數與年份範圍（「111–115 年」「888 題」→ 新數字），其他一字不動。先用 Artifact `read`（不帶 path）看目前版本，再用 `read` 的 `path: "index.html"` 下載頁面檔，取 `<body>` 與 `</body>` 之間的內容修改後 publish 回同一個 url。Artifact 工具不能用時跳過，回報中列出新文字請老師自己改。

## 5. 發布
`git add -A && git commit`（訊息結尾加 `Co-Authored-By: Claude <noreply@anthropic.com>`）`&& git push`，等 GitHub Pages 建好後確認線上網址 https://bgjd315-cloud.github.io/gsat-science-game/ 題數正確。

## 回報（繁體中文）
NEW 年學測自然題數；四科各補了幾題出處、新增幾題並各舉 2 例；遊戲總題數（舊→新）與年份範圍；NEW 年對不到課本的題號；有沒有新開的單元；網站網址；網站總覽是否已更新。
