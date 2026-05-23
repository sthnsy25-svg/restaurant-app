# セットアップ手順

## 1. Homebrewのインストール

ターミナルを開いて実行：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

完了後、ターミナルに表示される「Next steps」の指示に従って
PATHを設定してください（通常は以下2行を実行）：

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

## 2. Node.jsのインストール

```bash
brew install node
```

確認：
```bash
node --version   # v20以上が表示されればOK
```

## 3. アプリのセットアップ

```bash
cd ~/Desktop/restaurant-app
npm install
npx prisma db push
```

## 4. Resend（メール送信）の設定

1. https://resend.com にアクセス
2. 無料アカウントを作成
3. 「API Keys」からAPIキーを作成
4. `.env.local` を開いて設定を変更：

```
RESEND_API_KEY=re_xxxxxxxxxx     ← Resendのキーを貼り付け
FROM_EMAIL=onboarding@resend.dev ← 最初はこのままでOK
ADMIN_PASSWORD=あなたのパスワード  ← 好きなパスワードに変更
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. 起動

```bash
npm run dev
```

ブラウザで開く：
- お客さん向け登録ページ: http://localhost:3000
- 管理画面: http://localhost:3000/admin/login

---

## 使い方

### 登録者の集め方
`http://localhost:3000` のURLをQRコードにしてお店に貼るか、
SNSでシェアするとお客さんが登録できます。

### クーポン配布の流れ
1. 管理画面 → クーポン管理 → クーポン作成
2. 作成したクーポンの「配布する」ボタンを押す
3. 全登録者にメールが届く
4. お客さんがメール内のボタンを押してクーポン画面を表示
5. 来店時にスマホを提示
6. 管理画面でコードを入力 → 使用済みにする

### 一斉メール送信
管理画面 → 一斉送信 → 件名・本文を入力 → 送信

---

## 本番環境（外部公開）したい場合

Railwayを使えば無料でインターネット公開できます。
必要になったら教えてください。
