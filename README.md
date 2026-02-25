# 📊 せどり利益管理アプリ

スマートフォンから簡単に商品情報や売却情報を管理できる、フル機能の利益管理ツール。

## ✨ 特徴

- 📱 **スマホ対応**: iOS/Android対応のレスポンシブデザイン
- ☁️ **クラウド同期**: Firebaseで複数デバイス間のデータ同期
- 👥 **マルチユーザー**: 各ユーザーのデータを完全に分離
- ⚡ **リアルタイム計算**: 利益やP利益を自動計算
- 📊 **ダッシュボード**: 売上・利益・在庫を一目で確認
- 📥 **CSV出力**: スプレッドシートへの転記が簡単

## 🎯 主な機能

### 商品管理
- **商品登録**: 商品名、購入価格、ポイント・優待値引きを入力
- **売却登録**: 売却先、売却価格を入力して利益を自動計算
- **ステータス管理**: 待機中 → 売却済へステータス更新
- **在庫管理**: 在庫中の商品を簡単追跡

### 利益管理
- **実時間計算**: P利益（ポイント利用時）と通常利益を区別
- **ダッシュボード**: 総売上、総利益、在庫価格を可視化
- **月別集計**: 期間ごとの利益を確認

### データ操作
- **CSV出力**: Google Sheetsに簡単転記
- **クラウド保存**: 自動的にFirebaseに保存
- **バックアップ**: 複数デバイス間でデータを同期

## 🚀 セットアップ

### 前提条件
- Node.js 16+ 
- npm または yarn
- Firebaseアカウント

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/[your-username]/sedori-app.git
cd sedori-app

# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.localを編集してFirebase認証情報を入力
```

### Firebase設定

1. [Firebase Console](https://console.firebase.google.com)にアクセス
2. 新規プロジェクトを作成
3. Authentication（メール/パスワード）を有効化
4. Firestoreデータベースを作成（テストモード）
5. プロジェクト設定からウェブアプリを作成
6. 認証情報を `.env.local` にコピー

### 開発サーバー起動

```bash
npm run dev
```

ブラウザが自動で http://localhost:3000 に開きます。

## 📁 プロジェクト構造

```
sedori-app/
├── src/
│   ├── components/          # UIコンポーネント
│   │   ├── LoginForm.tsx    # ログイン/登録
│   │   ├── Header.tsx       # ヘッダー
│   │   ├── Dashboard.tsx    # 統計ダッシュボード
│   │   ├── ProductList.tsx  # 商品リスト
│   │   ├── AddProductForm.tsx    # 商品追加フォーム
│   │   └── SaleForm.tsx     # 売却情報入力
│   ├── hooks/               # Reactカスタムフック
│   │   ├── useAuth.ts       # 認証管理
│   │   └── useProducts.ts   # 商品管理
│   ├── lib/                 # ユーティリティ
│   │   ├── firebase.ts      # Firebase初期化
│   │   ├── firestore.ts     # Firestore操作
│   │   ├── store.ts         # 状態管理（Zustand）
│   │   └── utils.ts         # ヘルパー関数
│   ├── types/
│   │   └── index.ts         # TypeScript型定義
│   ├── App.tsx              # メインコンポーネント
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
├── index.html               # HTMLテンプレート
├── vite.config.ts           # Vite設定
├── tsconfig.json            # TypeScript設定
├── tailwind.config.ts       # Tailwind CSS設定
├── postcss.config.js        # PostCSS設定
├── package.json
├── .env.example             # 環境変数テンプレート
└── README.md
```

## 🛠️ 開発

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

### 本番デプロイ

#### Vercelへのデプロイ（推奨）

```bash
# Vercelアカウントを作成
npm install -g vercel
vercel login

# デプロイ
vercel
```

#### Netlifyへのデプロイ

```bash
# Netlifyアカウントを作成
npm run build
# dist/フォルダをNetlifyにドラッグ&ドロップ
```

## 💾 Firestore セキュリティルール

テストモード以外で使用する場合、以下のセキュリティルールをFirebase Consoleで設定してください：

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /products/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    match /sales/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 📱 スマホ最適化

- Viewport メタタグ設定済み
- タッチフレンドリーなUI（大きなボタン）
- モバイル向けのフォーム設計
- オフラインサポート（今後実装予定）

## 🔒 セキュリティ

- Firebase Authentication による認証
- Firestore セキュリティルール
- 環境変数で認証情報を保護
- HTTPS通信のみ

## 📊 今後の機能

- [ ] オフラインサポート（Service Worker）
- [ ] 複数月の集計表示
- [ ] グラフ・チャート分析
- [ ] CSVインポート機能
- [ ] 複数ユーザーのチーム管理
- [ ] プッシュ通知（売却期限など）
- [ ] 自動バックアップ

## 🤝 貢献

プルリクエストを歓迎します！大きな変更の場合はまずissueを開いて変更内容を議論してください。

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照

## 📞 サポート

問題が発生した場合は、[GitHubのIssue](https://github.com/[your-username]/sedori-app/issues)を作成してください。

---

**Made with ❤️ for せどラー**
