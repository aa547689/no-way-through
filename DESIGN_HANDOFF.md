# Handoff: 《騎樓沒有路 NO WAY THROUGH》UI 重設計

## Overview
像素風手機網頁遊戲的完整 UI 介面層重設計。遊戲主題是體驗輪椅族與視障者在台灣街道通勤的不便。本次重設計涵蓋 6 個畫面：標題、怎麼玩、車庫、Game Over 結算、遊玩中 HUD、底部操作區，以及 canvas 繪製的分享成績圖與 6 個車種的像素 sprite。

## About the Design Files
本包中的 `wheelchair-street-runner.html` 是**已可直接運行的完整實作**（單一檔案、純 HTML/CSS/JS、無框架），不只是設計參考。遊戲邏輯（canvas 俯視街景、關卡生成、碰撞、存檔）與 UI 層都在同一檔案內。

交給 Claude Code 的任務通常是：
- 直接沿用此檔案並繼續迭代；或
- 若要移植到既有 codebase（React/Vue 等），依本文件的規格重建 UI 層，**遊戲邏輯 JS 可原樣搬移**。搬移時必須保留所有元素 id 與事件綁定（見「Interactions」）。

## Fidelity
**High-fidelity**。所有顏色、字級、間距、狀態均為最終值，可直接照抄。

## 視覺方向（設計語彙）
- 日間明亮的台灣街道感：騎樓磁磚米色、柏油灰、標線黃、禁停紅線紅
- 像素／8-bit 街機語彙：粗邊框（3–5px 實線 ink 色）、硬陰影（`box-shadow: 0 Npx 0 <color>`，無模糊）、直角無圓角
- 字體：英文/數字用 `"Press Start 2P"`（Google Fonts）；繁中一律 `"Noto Sans TC"`（500/700/900），**繁中不用像素字型**以維持可讀性
- 社會議題調性：警示斜紋、事故章、導盲磚等元素，不做可愛休閒風

## Design Tokens
CSS 變數（定義於 `:root`）：
- `--cream:#f6efdc`（底色米）、`--paper:#fdfbf4`（卡片紙白）
- `--ink:#232733`（主墨色，所有邊框/文字）、`--ink2:#4a4636`（次要文字）、`--mut:#8b8674`（弱文字）
- `--sun:#f2b705`（標線黃，主 CTA）、`--sunL:#ffcc33`（亮黃，招牌/斜坡）、`--sunD:#c98f00`（暗黃）
- `--cone:#e8551f`（工程橘）、`--blood:#d94f43`（禁停紅線紅）
- 磁磚底紋：`repeating-linear-gradient` 每 44px 一條 2px `rgba(35,39,51,.05)` 格線，疊在 `linear-gradient(180deg,#f3ead0,#eadfbe)` 上
- 警示斜紋：`repeating-linear-gradient(-45deg, var(--ink) 0 16px, var(--sun) 16px 32px)`
- 硬陰影規格：按鈕 `0 7px 0 var(--ink)`（按下時 `translateY(5px)` + `0 2px 0`）；卡片 `0 5px 0 rgba(35,39,51,.35)`；招牌 `9px 9px 0 rgba(24,28,40,.82)`

舞台：`#stage` 固定 256:456 比例（手機直式），桌機置中，`image-rendering: pixelated`。

## Screens / Views

### 1. 標題畫面 `#scTitle`（class `screen trans`）
- 背景**透明**讓自動捲動街景 demo 透出：`linear-gradient(180deg, rgba(20,26,40,.45), rgba(20,26,40,.06) 30% 52%, rgba(20,26,40,.58))` 只壓暗上下
- 頂部 kicker：黑底黃點 Press Start 2P 9px「TAIWAN STREET COMMUTE」
- 招牌 `.signboard`：亮黃底 `--sunL`、5px ink 邊、9px 硬陰影、四角 11px 紅色鉚釘（`--blood` + 3px ink 邊）；`h1` 44px/900/字距3px 單行「騎樓沒有路」；下方黑底黃字 Press Start 2P 12px「NO WAY THROUGH」
- 引言 `.t-lead`：半透明紙白 95%、3px ink 邊、5px 硬陰影，15px/700/1.85
- 中段 spacer 留空給 demo
- 圖例 `.legend`：兩枚小牌（15px 色塊 + 12.5px/900 文字）：黃=上下騎樓、紅=過不去
- 主按鈕 `#btnStart`：黃底、21px/900/字距9px「開始挑戰」+ 9px Press Start 2P 副標「▶ PRESS START」
- 次按鈕列：`#btnGarage`「車庫 GARAGE」、`#btnHow`「怎麼玩 HOW TO PLAY」（紙白 ghost 款）
- hint 文字在深色上：`#e9eef4` + 文字陰影

### 2. 怎麼玩 `#scHow`
- 三條規則列 `.rule`：紙白卡 + 32px 方形圖示（▲ 紙白 / ✗ 紅底白字 / ◎ 黃底），14.5px/700
- **核心視覺化 `.diagram`**（重點需求：黃斜坡規則不用純文字）：
  - 182px 高、CSS grid `36% 34px 1fr` 三欄俯視剖面：騎樓（磁磚紋 #e6d8b2 + 直式「騎樓」字）｜路緣（三段：米色+右側 40% 紅線帶；中段黃斜坡 `#ffcc33` + 白色梯紋 + 內陰影 `--sunD`）｜車道（#8f95a3 + 黃虛線中線 + 直式「車道」）
  - 疊加元素：藍色「你」方塊（#3f7fc8）在車道側；紅色虛線 `.dg-line.no` 撞在紅線段止步（✗ 端點）；綠色虛線 `.dg-line.ok`（#1f6b3e）穿過黃斜坡進騎樓（◀ 端點）；「紅線」「斜坡」小標籤釘在對應段上
- 圖例兩行 + `.factbox`（見下）+ `#btnHowBack`

### 3. 車庫 `#scGarage`
- 頂列：kicker「GARAGE」+ 錢包 `.wallet`（黑底、coin 圖示、Press Start 2P 黃字 `#walletCoins`，由 `renderGarage()` 更新）
- 卡片 `.card`（`renderGarage()` 動態生成，6 車種）：
  - 縮圖 `.thumb` 66px、3px ink 邊、#b9c6cf 底，內含 60px canvas（sprite 以 3x scale 繪製）；未解鎖 `grayscale(.85)`
  - 資訊：名稱 16.5px/900 不換行（白手杖行人附藍色「體積小」mini 章）；速度條 6 格（13×9px 格、亮黃=有）+ 數值；描述 12.5px/500
  - 右欄狀態章：`使用中`（黑底黃字）／`選用`（紙白+硬陰影）／`◎價格`（Press Start 2P 琥珀色）+「你有 ◎N」
  - 選中 `.sel`：底色 #fff3c4 + ink 硬陰影；未解鎖 `.lock`：底 #eee8d4
- 點卡片：已擁有→選用；金幣夠→購買；不足→toast「金幣不足，還差 N」

### 4. Game Over `#scOver`（玩家會截圖，優先顧觀感）
- 頂部滿版 `.go-band` 警示斜紋帶，中央黑底白框 Press Start 2P 16px「GAME OVER」
- 結算卡 `.result`：4px ink 邊 + 8px 硬陰影
  - 「存活時間 SURVIVED」小標 → 大字秒數 `.bigtime`：Press Start 2P 44px ink + 黃色硬字影 `4px 4px 0 var(--sun)`，baseline flex 排「秒」單位；**秒數 ≥5 字元（100 秒以上）時 JS 降為 34px** 防溢出
  - 事故章 `.cause`：紅框紅字、旋轉 -2°、CSS `::before "✗ "`，內容由 JS 塞「你撞上了 <死因>」
  - 三欄 meta：金幣 `#rCoin`／最佳 `#rBest`（Press Start 2P）／角色 `#rCar`（黑體 900）
- `.factbox` 無障礙小知識：黃色標籤頭（紅色小方塊 + 「無障礙小知識」）+ 內文 14px/1.9，`<b>` 關鍵字黃色底線；文案從 `FACTS[]` 隨機
- `#btnAgain`「再來一次 ▶ RETRY」+ `#btnShare`／`#btnHome`

### 5. 遊玩 HUD `#hud` + `#mute`
- 左右兩枚 `.tag`：紙白、3px ink 邊、`0 4px 0` 硬陰影；左「時間」+ Press Start 2P 15px 數字，右像素 coin 方塊（15px 黃 + inset 暗黃）+ 琥珀數字；`pointer-events:none` 不擋操作
- 中央 `#mute`：黑底黃字 Press Start 2P 8px「♪ ON/OFF」，刻意縮小避免擠到兩側

### 6. 底部操作區 `#pad`（絕對定位拖曳邏輯不可動）
- 概念：**警示導盲磚**。112px 高、`#f5b90d` 底 + `radial-gradient` 32px 網格圓點磚面（#d79b06）
- 頂緣 5px ink 邊 + 7px 黑黃警示斜紋 `::before`
- 標籤「◀　操作區・左右拖曳　▶」13px/900/字距3px
- 軌道 `.rail`：左右 16px 內縮（**必須是 16px**，對應 JS `padTo()` 的 `r.left+16 / r.width-32`）、暗黃底 + inset 陰影
- 拖曳鈕 `#padHandle`：60×60、紙白、4px ink 邊、`0 6px 0` 硬陰影、「↔」；`margin-left:-30px` 置中；按住時 `translateY(4px)` 壓下。JS 每 frame 寫 `style.left`

## Interactions & Behavior（不可破壞的合約）
必須保留的 id：`game, scan, vig, hud, hudTime, hudCoin, mute, pad, padHandle, scTitle, scHow, scGarage, scOver, btnStart, btnHow, btnHowBack, btnGarage, btnGarageBack, btnAgain, btnShare, btnHome, causeTxt, rTime, rCoin, rBest, rCar, cardList, walletCoins, factTxt, toast`
- `hudTime`/`hudCoin` 內**必須各有一個 `<b>`**（JS 用 `querySelector('b')` 更新）
- `#pad` 的 pointer 事件（pointerdown/move/up/cancel + setPointerCapture）與 `#padHandle` 的 `style.left` 計算式綁 16px 內縮
- 畫面切換：`.hide` class 開關；`.screen.hide{display:none}`
- 鍵盤：← → / A D 移動，空白鍵在標題頁 = 開始
- 存檔：`window.storage` key `wcgame:save`（coins/best/owned/current）
- Toast：`#toast.on` 淡入 1.6s

## 車種 Sprite（`drawPlayer()`，基準座標 15×20 或 15×24，繪製時 2x）
各車種視覺差異（車庫縮圖與遊戲中共用）：
- **manual 手推輪椅**：藍衣（#3f7fc8）、兩側白手推圈
- **carer 看護推**：綠衣（#3f9b62）乘客 + 後方紫衣（#7a6aa0）看護（頭+肩+雙手握把）；縮圖 y 軸上移 2px 防裁切
- **blind 白手杖行人**：橘衣小體型、白手杖左右掃動動畫（獨立 `drawBlind()`）
- **power 電動輪椅**：綠椅身（#31543a/#3f7a4e）、後驅動輪+前小輪、電池+綠電量燈、右扶手橘搖桿
- **trike 三輪電動車**：紅車身（#7c3530/#a04a42）、深色把手、前輪、雙黃燈、米白衣
- **head 電動車頭**：銀把手、黃大燈、寬前輪、椅身快拆扣、紅衣（#d94f43）

## 分享成績圖（`shareResult()`，canvas 繪製 1080×1350 直式）
玩家分享用，版面（座標為實際值）：
1. 磁磚米底 + 90px 格線 + 10px ink 外框
2. 頂部 208px 黑招牌帶：黃字 66px「騎樓沒有路」+ 白 Press Start 2P 17px「NO WAY THROUGH · TAIWAN STREET」+ 兩角紅鉚釘；帶下 26px 警示斜紋（`hazard()` 平行四邊形）
3. 「我在台灣的街道上撐了」34px → 秒數 Press Start 2P 148px，黃色錯位硬影（先黃 +10,+10 再 ink）→「秒」52px
4. 右側 266px 磁磚牌框住角色 sprite（10x scale）
5. 紅色事故章（旋轉 -2°、6px 紅框）「✗ 撞上了 <死因>」
6. 三格統計卡（金幣／最佳紀錄／角色，硬陰影紙白卡）
7. 警示細紋 + 議題文案兩行 + 底部黑帶：黃字 hashtag「#騎樓沒有路　#無障礙」
- 繪製前 `await document.fonts.load('10px "Press Start 2P"')`
- 輸出走 `navigator.share`（檔案）→ fallback 下載 png

## Assets
無外部圖片。字體：Google Fonts `Press Start 2P` + `Noto Sans TC:wght@500;700;900`。所有圖像均為 CSS 或 canvas 程序繪製。

## Files
- `wheelchair-street-runner.html` — 完整遊戲（UI + 邏輯，單檔可直接開啟）
