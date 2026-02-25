# 📊 せどり利益管理アプリ - プロジェクト概要

## 🎯 プロジェクト概要

**目的**: スマートフォンからせどり（買取流し）の利益管理を簡単に行えるアプリ

**対象ユーザー**: 個人せどラー、転売ビジネス従事者

**主な解決課題**:
- ✅ スプレッドシートの複雑さを解消
- ✅ スマートフォンでの素早い入力
- ✅ リアルタイム利益計算
- ✅ 複数デバイス間の自動同期

---

## 🏗️ 技術構成

### フロントエンド
```
React 18 + TypeScript
├─ Vite (ビルドツール)
├─ Tailwind CSS (スタイリング)
├─ Lucide React (アイコン)
└─ Zustand (状態管理)
```

### バックエンド
```
Firebase
├─ Authentication (認証)
├─ Firestore (データベース)
└─ Storage (ファイル保存)
```

### デプロイ
```
Vercel / Netlify (推奨)
または
セルフホスティング (Node.js + Express)
```

---

## 📁 ファイル構造

```
sedori-app/
├── 📋 設定ファイル
│   ├── package.json              # npm パッケージ定義
│   ├── tsconfig.json             # TypeScript 設定
│   ├── vite.config.ts            # Vite ビルド設定
│   ├── tailwind.config.ts        # Tailwind CSS 設定
│   ├── postcss.config.js         # PostCSS 設定
│   ├── .gitignore                # Git 除外ファイル
│   ├── .env.example              # 環境変数テンプレート
│   └── .vscode/settings.json     # VS Code 設定
│
├── 📄 HTML
│   └── index.html                # メイン HTML

├── 🎨 ソースコード
│   └── src/
│       ├── main.tsx              # React マウントポイント
│       ├── App.tsx               # メインアプリコンポーネント
│       ├── index.css             # グローバルスタイル
│       │
│       ├── 🧩 components/        # UI コンポーネント
│       │   ├── LoginForm.tsx      # ログイン/登録フォーム
│       │   ├── Header.tsx         # ヘッダー
│       │   ├── Dashboard.tsx      # 統計ダッシュボード
│       │   ├── ProductList.tsx    # 商品リスト表示
│       │   ├── AddProductForm.tsx # 商品追加フォーム
│       │   └── SaleForm.tsx       # 売却情報入力フォーム
│       │
│       ├── 🪝 hooks/             # React カスタムフック
│       │   ├── useAuth.ts        # 認証管理
│       │   └── useProducts.ts    # 商品管理
│       │
│       ├── 📚 lib/               # ユーティリティ層
│       │   ├── firebase.ts       # Firebase 初期化
│       │   ├── firestore.ts      # Firestore API操作
│       │   ├── store.ts          # Zustand 状態管理
│       │   └── utils.ts          # ヘルパー関数
│       │
│       └── 🏷️ types/            # TypeScript 型定義
│           └── index.ts          # 全型定義
│
└── 📖 ドキュメント
    ├── README.md                 # プロジェクト説明
    ├── SETUP_GUIDE.md            # セットアップガイド
    └── QUICKSTART.md             # クイックスタート
```

---

## 🔄 データフロー

```
ユーザー入力 (UI)
    ↓
React Component
    ↓
Zustand (状態管理)
    ↓
Firestore API
    ↓
Firebase (クラウド保存)
    ↓
自動同期 (複数デバイス)
```

---

## 🗄️ データベーススキーマ

### Firestore コレクション: `products`

```typescript
{
  id: string;                    // ドキュメントID
  userId: string;                // ユーザーID（外部キー）
  productName: string;           // 商品名
  purchasePrice: number;         // 購入価格
  point: number;                 // ポイント/優待値引き
  purchaseDate: string;          // 購入日 (YYYY-MM-DD)
  purchaseLocation: string;      // 購入場所
  status: 'pending' | 'sold' | 'inventory'; // ステータス
  salePrice?: number;            // 売却価格（売却済みの場合）
  saleLocation?: string;         // 売却先
  saleDate?: string;             // 売却日 (YYYY-MM-DD)
  createdAt: Timestamp;          // 作成日時
  updatedAt: Timestamp;          // 更新日時
}
```

### Firestore コレクション: `sales`

```typescript
{
  id: string;                    // ドキュメントID
  productId: string;             // 商品ID（外部キー）
  userId: string;                // ユーザーID（外部キー）
  salePrice: number;             // 売却価格
  saleLocation: string;          // 売却先
  saleDate: string;              // 売却日 (YYYY-MM-DD)
  profitAmount: number;          // 利益（売却価格 - 実質購入価格）
  pointProfit: number;           // P利益（売却価格 - 購入価格）
  createdAt: Timestamp;          // 作成日時
  updatedAt: Timestamp;          // 更新日時
}
```

---

## 📊 状態管理（Zustand）

```typescript
AppStore {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setProducts: (products: Product[]) => void;

  // UI
  loading: boolean;
  error: string | null;
  success: string | null;
}
```

---

## 🔐 セキュリティ

### Firebase Authentication
- **メール/パスワード認証**
- パスワードハッシュ化（Firebase側で管理）
- セッション自動管理

### Firestore セキュリティルール
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

---

## 📱 UIコンポーネント一覧

### 認証系
- **LoginForm**: ログイン/登録フォーム

### メイン画面
- **Header**: ナビゲーション + ログアウト + CSV出力
- **Dashboard**: 利益サマリー表示
- **ProductList**: 商品リスト（ステータス別）

### フォーム
- **AddProductForm**: 商品追加フォーム（モーダル）
- **SaleForm**: 売却情報入力フォーム（モーダル）

---

## 🎨 デザイン原則

### 色彩
- **Primary**: Sky Blue (`#0ea5e9`)
- **Success**: Green (`#10b981`)
- **Alert**: Red (`#ef4444`)
- **Background**: Gray (`#f9fafb`)

### タイポグラフィ
- **Display**: Inter Bold
- **Body**: Inter Regular
- **Mono**: JetBrains Mono

### レイアウト
- **モバイルファースト**: スマートフォン最適化
- **レスポンシブ**: 2カラム～1カラム自動切り替え
- **アニメーション**: スライドイン・フェードイン

---

## 📊 利益計算ロジック

```typescript
// 実質購入価格
実質価格 = 購入価格 - ポイント

// 利益（通常）
利益 = 売却価格 - 実質価格
    = 売却価格 - (購入価格 - ポイント)

// P利益（ポイント利用時）
P利益 = 売却価格 - 購入価格

// 利益率
利益率 = (利益 / 売却価格) × 100
```

---

## 🚀 パフォーマンス最適化

- **Code Splitting**: Vite による自動分割
- **Lazy Loading**: React Suspense（今後実装）
- **Caching**: Firebase SDK キャッシング
- **Bundle Size**: Tree shaking による最小化

---

## 📈 スケーラビリティ

### 現在
- 単一ユーザー
- 小～中規模データ（商品数 < 10,000）

### 将来の拡張
- チーム管理（複数ユーザー）
- 分析機能（グラフ・レポート）
- API 連携（Amazon/メルカリAPI）
- モバイルアプリ化（React Native）

---

## 🔄 開発ワークフロー

1. **フィーチャーブランチを作成**
   ```bash
   git checkout -b feature/商品検索機能
   ```

2. **開発**
   ```bash
   npm run dev
   ```

3. **テスト & コミット**
   ```bash
   git add .
   git commit -m "feat: 商品検索機能を追加"
   ```

4. **プッシュ & プルリクエスト**
   ```bash
   git push origin feature/商品検索機能
   ```

5. **マージ & デプロイ**
   ```bash
   git checkout main
   git pull origin main
   npm run build
   # Vercel / Netlify 自動デプロイ
   ```

---

## 📞 開発支援

- **Issue**: バグ報告・機能リクエスト
- **Discussion**: 設計・アーキテクチャ議論
- **Wiki**: ドキュメント・FAQ

---

## 📄 ライセンス

MIT License - 自由に使用・改変・配布が可能

---

## 🎯 次のステップ

1. [ ] SETUP_GUIDE.md でセットアップ
2. [ ] QUICKSTART.md で基本操作
3. [ ] README.md で詳細確認
4. [ ] GitHub に own repository をフォーク
5. [ ] 本番環境にデプロイ

---

**Built with ❤️ for Sedori Community**
