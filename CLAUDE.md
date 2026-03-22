# ipynb-viewer

Android向けJupyter Notebook (.ipynb) ビューアアプリ。

## 目的

AndroidでJupyter Notebookを快適に閲覧するためのPWA。
TWA (Trusted Web Activity) でGoogle Play Store配布予定。

## 技術スタック

- **Next.js** (App Router) + **TypeScript** (strict mode)
- **Tailwind CSS** スタイリング
- **react-markdown** + **remark-gfm** Markdownレンダリング
- **highlight.js** シンタックスハイライト
- **dompurify** HTML sanitize

## ディレクトリ構成

```
app/
  layout.tsx         # ルートレイアウト (ダークモード対応)
  page.tsx           # メインビューア画面
  globals.css        # グローバルスタイル
lib/
  ipynb-parser.ts    # ipynbパーサー
components/
  NotebookViewer.tsx # ノートブック全体ビューア
  CodeCell.tsx       # コードセル + 出力
  MarkdownCell.tsx   # Markdownセル
  RawCell.tsx        # Rawセル
  OutputRenderer.tsx # 出力レンダラー
  ImageModal.tsx     # 全画面画像モーダル
  NavBar.tsx         # フローティングナビゲーション
```

## コーディング規約

- TypeScript strict mode
- コンポーネントは関数コンポーネント (FC)
- `'use client'` はインタラクティブコンポーネントのみ
- nbformat v4 を主対象
- HTMLはDOMPurifyでsanitize必須
