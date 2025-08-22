# Mischief Cam (Web)
iPhoneのSafariで動く“いたずらメイク & 心霊風”カメラ。

## 使い方
1. 任意のサーバーで `mischief-cam/` をそのまま公開（HTTPS推奨）  
2. `index.html` を開き、カメラ許可を与える  
3. プリセットを選んで「撮影」

### パラメータファイル
- `params.json` に複数プリセットを定義
- 画面の「外部params.json読込」で手元のJSONを読み替え可能
- 「テキストで上書き」に `キー=値;` 形式 or JSONを入れて即時反映

### 開発メモ
- FaceMesh: CDNで @mediapipe/face_mesh を利用（オフラインは `vendor/mediapipe` に置換）
- 描画: Canvas 2D。`filters.js` で眉/口紅/アイシャドウ/チーク、`overlay.js` で心霊系PNG合成
- 保存: `canvas.toDataURL('image/jpeg',0.95)`

