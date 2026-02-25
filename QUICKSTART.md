# 📊 せどり利益管理アプリ - クイックスタート

## 🎯 5分で始める

### 1️⃣ Firebaseを準備（2分）

```
1. https://console.firebase.google.com を開く
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: sedori-app）
4. 左メニュー → Authentication → メール/パスワード有効化
5. 左メニュー → Firestore Database → テストモード で作成
6. プロジェクト設定 → ウェブアプリ登録 → 認証情報をコピー
```

### 2️⃣ コードをセットアップ（2分）

```bash
# プロジェクトをダウンロード
git clone https://github.com/[your-username]/sedori-app.git
cd sedori-app

# パッケージをインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集して Firebase の認証情報を入力
```

### 3️⃣ 開発サーバーを起動（1分）

```bash
npm run dev
```

ブラウザで http://localhost:3000 が自動で開きます。

### 4️⃣ 試す

- ✅ アカウント登録（メール/パスワード）
- ✅ 「+」ボタンで商品を追加
- ✅ 商品をクリック → 売却情報を入力
- ✅ ダッシュボードで利益を確認

---

## 📱 スマートフォンで使う

同じWi-Fi上のスマートフォンで以下にアクセス:

```
http://[あなたのPC-IPアドレス]:3000
```

`ipconfig` (Windows) または `ifconfig` (Mac) で IPアドレスを確認

---

## 🌍 本番環境にデプロイ（無料）

### Vercelへデプロイ

```bash
# GitHubにプッシュ
git push origin main

# https://vercel.com から インポート
# 環境変数を設定
# デプロイ!
```

完了！URLが発行されます。

---

## 📖 詳細なセットアップ

→ **SETUP_GUIDE.md** を参照

---

## 🆘 トラブル

| 問題 | 解決方法 |
|------|--------|
| Firebase API エラー | `.env.local` の認証情報を確認 |
| npm install エラー | Node.js をアップデート |
| ポート3000が塞がってる | `npm run dev -- --port 3001` |

---

## 💡 機能一覧

✅ **商品管理**
- 商品名・購入価格・ポイントを入力
- 購入日・購入場所を記録

✅ **売却管理**
- 売却先・売却価格・売却日を入力
- 利益を自動計算

✅ **ダッシュボード**
- 総売上・総利益・在庫価格を表示
- 利益率・売却件数を確認

✅ **データ操作**
- CSV出力（Google Sheets転記用）
- クラウド保存（Firebase）
- 複数デバイス自動同期

---

## 🔒 セキュリティ

- Firebase Authentication で保護
- 各ユーザーのデータは完全に分離
- パスワードはハッシュ化

---

**設定完了後 → README.md で詳細確認!**
