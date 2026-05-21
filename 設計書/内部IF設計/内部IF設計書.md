# 内部IF設計書

## 概要

本書はロボットレターWEB注文システムにおける内部モジュール間のインターフェース仕様を定義する。  
フロントエンド（HTML/JS）とバックエンドAPI間の通信仕様を記述する。

---

## 共通仕様

### リクエスト形式
- プロトコル：HTTPS
- データ形式：JSON（`Content-Type: application/json`）
- 認証：Bearerトークン（JWTをAuthorizationヘッダーに付与）
- 文字コード：UTF-8

### レスポンス形式

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

エラー時：
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": { "field": "email", "reason": "invalid format" }
  }
}
```

### HTTPステータスコード

| コード | 意味 |
|---|---|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | バリデーションエラー |
| 401 | 認証エラー（未ログイン・トークン期限切れ） |
| 403 | 権限なし |
| 404 | リソースなし |
| 409 | 競合（重複等） |
| 500 | サーバーエラー |

---

## IF一覧

| IF-ID | 機能名 | メソッド | パス |
|---|---|---|---|
| II-01 | ログイン | POST | /api/auth/login |
| II-02 | ログアウト | POST | /api/auth/logout |
| II-03 | パスワード変更 | PUT | /api/auth/password |
| II-04 | 注文一覧取得 | GET | /api/orders |
| II-05 | 注文詳細取得 | GET | /api/orders/{id} |
| II-06 | 注文新規作成（下書き保存） | POST | /api/orders |
| II-07 | 注文更新 | PUT | /api/orders/{id} |
| II-08 | 注文確定 | POST | /api/orders/{id}/submit |
| II-09 | 差出人情報一覧取得 | GET | /api/sender-info |
| II-10 | 差出人情報登録 | POST | /api/sender-info |
| II-11 | 差出人情報更新 | PUT | /api/sender-info/{id} |
| II-12 | 差出人情報削除 | DELETE | /api/sender-info/{id} |
| II-13 | 文面パターン一覧取得 | GET | /api/templates |
| II-14 | 文面パターン登録 | POST | /api/templates |
| II-15 | 文面パターン更新 | PUT | /api/templates/{id} |
| II-16 | 文面パターン削除 | DELETE | /api/templates/{id} |
| II-17 | プロフィール取得 | GET | /api/users/me |
| II-18 | 受注一覧取得（社内） | GET | /api/admin/orders |
| II-19 | 受注ステータス更新（社内） | PUT | /api/admin/orders/{id}/status |
| II-20 | 差戻し登録（社内） | POST | /api/admin/orders/{id}/return |
| II-21 | ユーザー一覧取得（社内） | GET | /api/admin/users |
| II-22 | ユーザー登録（社内） | POST | /api/admin/users |
| II-23 | ユーザー更新（社内） | PUT | /api/admin/users/{id} |
| II-24 | ユーザー削除（社内） | DELETE | /api/admin/users/{id} |
| II-25 | 操作履歴取得（社内） | GET | /api/admin/logs |
| II-26 | 通知一覧取得 | GET | /api/notifications |
| II-27 | 通知既読更新 | PUT | /api/notifications/read |

---

## 詳細仕様

---

### II-01：ログイン

**POST /api/auth/login**

#### リクエスト
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### レスポンス（成功）
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "expires_at": "2026-05-21T00:00:00Z",
    "user": {
      "id": 1,
      "name": "山田太郎",
      "email": "user@example.com",
      "role": "customer_user",
      "company_name": "サンプル株式会社"
    }
  }
}
```

#### エラーケース
| コード | 条件 |
|---|---|
| 401 | メールアドレスまたはパスワード不一致 |
| 400 | 入力値不正 |

---

### II-04：注文一覧取得

**GET /api/orders**

#### クエリパラメータ
| パラメータ | 型 | 説明 |
|---|---|---|
| status | string | ステータス絞り込み（複数可：カンマ区切り） |
| date_from | date | 注文日From（YYYY-MM-DD） |
| date_to | date | 注文日To（YYYY-MM-DD） |
| keyword | string | フリーワード（受注ID・住所等） |
| page | int | ページ番号（デフォルト1） |
| per_page | int | 件数（デフォルト20） |

#### レスポンス（成功）
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 123,
        "status": "producing",
        "created_at": "2026-05-01T10:00:00Z",
        "recipient_count": 50,
        "envelope_type": "長形3号",
        "has_return": false
      }
    ],
    "total": 42,
    "page": 1,
    "per_page": 20
  }
}
```

---

### II-06：注文新規作成（下書き保存）

**POST /api/orders**

#### リクエスト
```json
{
  "status": "draft",
  "envelope_spec": {
    "size": "長形3号",
    "window_type": "窓なし",
    "print_method": "印刷なし"
  },
  "stationery_spec": {
    "font": "楷書体",
    "direction": "縦書き",
    "pages": 1
  },
  "body": {
    "text": "拝啓...",
    "has_recipient": true,
    "sender_info_id": 5
  },
  "mailing_list_id": null
}
```

#### レスポンス（成功）
```json
{
  "success": true,
  "data": {
    "order_id": 124,
    "status": "draft"
  }
}
```

---

### II-20：差戻し登録

**POST /api/admin/orders/{id}/return**

#### リクエスト
```json
{
  "reason": "送付リストの住所欄が空欄になっているレコードがあります。修正してください。"
}
```

#### レスポンス（成功）
```json
{
  "success": true,
  "data": {
    "order_id": 123,
    "status": "returned",
    "return_reason_id": 45
  }
}
```

---

### II-27：通知既読更新

**PUT /api/notifications/read**

#### リクエスト
```json
{
  "ids": [1, 2, 3]
}
```
`ids`省略時は全件既読に更新。

#### レスポンス（成功）
```json
{
  "success": true,
  "data": {
    "updated_count": 3
  }
}
```

---

## 認証・認可マトリクス

| エンドポイントグループ | customer_user | customer_admin | staff | admin |
|---|:---:|:---:|:---:|:---:|
| /api/auth/* | ○ | ○ | ○ | ○ |
| /api/orders | ○（自社分） | ○（自社全件） | - | ○ |
| /api/sender-info | ○（自社分） | ○（自社全件） | - | ○ |
| /api/templates | ○（自社分） | ○（自社全件） | - | ○ |
| /api/users/me | ○ | ○ | ○ | ○ |
| /api/notifications | ○ | ○ | - | ○ |
| /api/admin/* | × | × | ○ | ○ |
| /api/admin/users | × | × | × | ○ |
| /api/admin/logs | × | × | △（自分のみ） | ○ |
