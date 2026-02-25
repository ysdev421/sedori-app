# 🚀 せどり利益管理アプリ - セットアップガイド

## 📋 前提条件

- **Node.js 16以上** ([ダウンロード](https://nodejs.org/))
- **Git** ([ダウンロード](https://git-scm.com/))
- **Firebaseアカウント** (無料)
- **VSCode** (推奨) ([ダウンロード](https://code.visualstudio.com/))

---

## 🔧 セットアップ手順

### ステップ1: Firebaseプロジェクトの作成

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com にアクセス

2. **新規プロジェクトを作成**
   - 「プロジェクトを追加」をクリック
   - プロジェクト名: `sedori-app` (任意)
   - Google Analyticsは不要

3. **Authenticationを設定**
   - 左メニューから「Authentication」を選択
   - 「Sign-in method」タブを開く
   - 「メール/パスワード」を有効化
   - 「Save」をクリック

4. **Firestoreを設定**
   - 左メニューから「Firestore Database」を選択
   - 「データベースを作成」をクリック
   - 「テストモード」を選択（開発用）
   - ロケーション: `asia-northeast1` (日本)
   - 「作成」をクリック

5. **ウェブアプリの登録**
   - プロジェクト設定ページを開く
   - 「</> アイコン」をクリックしてウェブアプリを登録
   - アプリのニックネーム: `Web App`
   - 「登録」をクリック

6. **認証情報をコピー**
   ```javascript
   // 以下のようなコードが表示されます
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456"
   };
   ```

---

### ステップ2: プロジェクトのセットアップ

1. **プロジェクトをダウンロード**
   ```bash
   # GitHubからクローン（または手動でダウンロード）
   git clone https://github.com/[your-username]/sedori-app.git
   cd sedori-app
   ```

2. **依存パッケージをインストール**
   ```bash
   npm install
   ```

3. **環境変数を設定**
   ```bash
   # .env.exampleをコピー
   cp .env.example .env.local
   ```

4. **.env.localを編集**
   - VS Codeで `.env.local` を開く
   - Firebase Consoleからコピーした値を入力
   
   例：
   ```env
   VITE_FIREBASE_API_KEY=AIza1234567890abcdefg
   VITE_FIREBASE_AUTH_DOMAIN=sedori-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=sedori-app-12345
   VITE_FIREBASE_STORAGE_BUCKET=sedori-app-12345.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
   ```

---

### ステップ3: 開発サーバーの起動

```bash
npm run dev
```

出力例：
```
  ➜  Local:   http://localhost:3000/
  ➜  press h + enter to show help
```

ブラウザが自動で開きます。開かない場合は、手動で http://localhost:3000 を開いてください。

---

## ✅ 動作確認

1. **ログイン画面が表示される**
   - メールアドレスとパスワードを入力するフォームが見えます

2. **アカウント登録をする**
   - テスト用メール: `test@example.com`
   - テスト用パスワード: `password123`
   - 「登録」をクリック

3. **メイン画面が表示される**
   - ダッシュボード（統計情報）
   - 「商品を追加」ボタン（右下の+）

4. **商品を追加してテストする**
   - 右下の「+」ボタンをクリック
   - 商品情報を入力
   - 「商品を追加」をクリック

5. **売却情報を入力する**
   - 追加した商品の「編集」ボタンをクリック
   - 売却価格を入力
   - 「売却情報を保存」をクリック

---

## 📱 スマートフォンで動作確認

1. **PCの開発サーバーを起動したまま**
   ```bash
   npm run dev
   ```

2. **スマートフォンでアクセス**
   - PCのIPアドレスを確認
   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```
   
   - スマートフォンのブラウザで以下にアクセス
   ```
   http://[あなたのPC-IPアドレス]:3000
   ```

3. **レスポンシブ動作確認**
   - スマートフォンでフォーム入力
   - ダッシュボード表示
   - CSV出力機能

---

## 🚀 本番環境へのデプロイ

### Vercelへのデプロイ（推奨・無料）

1. **Vercelアカウント作成**
   - https://vercel.com にアクセス
   - GitHubアカウントで登録

2. **プロジェクトをGitHubにプッシュ**
   ```bash
   git remote add origin https://github.com/[your-username]/sedori-app.git
   git branch -M main
   git push -u origin main
   ```

3. **Vercelでデプロイ**
   - https://vercel.com/new にアクセス
   - GitHubリポジトリをインポート
   - 環境変数を設定（`.env.local`の値をコピー）
   - 「Deploy」をクリック

### Netlifyへのデプロイ

1. **ビルド**
   ```bash
   npm run build
   ```

2. **デプロイ**
   - https://app.netlify.com にアクセス
   - `dist/`フォルダをドラッグ&ドロップ

---

## 🐛 トラブルシューティング

### 「Firebase API key が無効」エラー

**原因**: `.env.local`の値が間違っている

**解決方法**:
1. Firebase Consoleで値を再確認
2. `.env.local`を再編集して保存
3. 開発サーバーを再起動（Ctrl+C → `npm run dev`）

### 「Cannot find module 'firebase'」エラー

**原因**: npm installが完了していない

**解決方法**:
```bash
npm install
```

### ログイン後にエラーが出る

**原因**: Firestoreのセキュリティルール

**解決方法**:
Firebase Consoleで以下のルールを設定:
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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

### 開発サーバーが起動しない

**原因**: ポート3000が使用中

**解決方法**:
```bash
# 別のポート指定で起動
npm run dev -- --port 3001
```

---

## 📚 その他の参考リソース

- **Firebase公式ドキュメント**: https://firebase.google.com/docs/guides
- **React ドキュメント**: https://react.dev
- **TypeScript ドキュメント**: https://www.typescriptlang.org
- **Tailwind CSS**: https://tailwindcss.com

---

## 🆘 さらにサポートが必要な場合

GitHubのIssueを作成してください:
https://github.com/[your-username]/sedori-app/issues

---

**セットアップに成功しました！🎉**

次は以下を試してみてください:
- [ ] 商品を複数追加してみる
- [ ] 売却情報を入力してみる
- [ ] CSVをエクスポートしてみる
- [ ] スマートフォンでアクセスしてみる
- [ ] 複数ブラウザで同期を確認してみる

Happy Sedori! 📊
