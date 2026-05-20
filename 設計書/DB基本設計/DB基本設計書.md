# DB基本設計書

## テーブル一覧

| # | テーブル名 | 論理名 |
|---|---|---|
| 1 | users | 顧客利用者 |
| 2 | companies | 顧客企業 |
| 3 | plans | 契約プラン |
| 4 | orders | 注文 |
| 5 | order_envelope_specs | 封筒仕様 |
| 6 | order_stationery_specs | 便箋仕様 |
| 7 | order_bodies | 文面内容 |
| 8 | order_enclosures | 同梱物 |
| 9 | mailing_lists | 送付リスト |
| 10 | return_reasons | 差戻し理由 |
| 11 | sender_info | 差出人情報 |
| 12 | templates | 文面パターン |
| 13 | staff | 社内担当者 |
| 14 | roles | ロール |
| 15 | operation_logs | 操作履歴 |
| 16 | notifications | 通知 |

---

## テーブル定義

### 1. users（顧客利用者）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ユーザーID |
| company_id | BIGINT | | companies.id | NOT NULL | 所属企業ID |
| email | VARCHAR(254) | | | NOT NULL | メールアドレス（ログインID） |
| password_hash | VARCHAR(255) | | | NOT NULL | パスワードハッシュ |
| name | VARCHAR(100) | | | NOT NULL | 担当者名 |
| phone | VARCHAR(20) | | | NULL | 電話番号 |
| is_initial_password | BOOLEAN | | | NOT NULL | 初回パスワードフラグ |
| last_login_at | TIMESTAMP | | | NULL | 最終ログイン日時 |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | | | NOT NULL | 更新日時 |

---

### 2. companies（顧客企業）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | 企業ID |
| customer_code | VARCHAR(20) | | | NOT NULL | 得意先ID（例：C-00001） |
| name | VARCHAR(200) | | | NOT NULL | 会社名 |
| plan_id | BIGINT | | plans.id | NULL | 契約プランID |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | | | NOT NULL | 更新日時 |

---

### 3. plans（契約プラン）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | プランID |
| company_id | BIGINT | | companies.id | NOT NULL | 企業ID |
| name | VARCHAR(100) | | | NOT NULL | プラン名（例：プレミアムプラン） |
| total_count | INT | | | NOT NULL | 契約通数 |
| remaining_count | INT | | | NOT NULL | 残り通数 |
| starts_at | DATE | | | NOT NULL | 開始日 |
| expires_at | DATE | | | NOT NULL | 有効期限 |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | | | NOT NULL | 更新日時 |

---

### 4. orders（注文）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | 注文ID |
| order_no | VARCHAR(20) | | | NOT NULL | 注文番号（例：36000-00333） |
| company_id | BIGINT | | companies.id | NOT NULL | 企業ID |
| user_id | BIGINT | | users.id | NOT NULL | 注文者ID |
| status | ENUM | | | NOT NULL | ステータス（draft / new / confirmed / producing / returned / shipped） |
| product_type | VARCHAR(100) | | | NULL | 商品種別（例：封筒＋便箋） |
| quantity | INT | | | NULL | 通数 |
| order_date | DATE | | | NULL | 注文日 |
| estimated_ship_date | DATE | | | NULL | 発送予定日 |
| shipped_date | DATE | | | NULL | 発送日 |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | | | NOT NULL | 更新日時 |

**ステータス遷移：**
```
draft（下書き）→ new（未確認）→ confirmed（確認待ち）→ producing（生産中）→ shipped（発送済み）
                                                     ↗
                               returned（差し戻し）
```

---

### 5. order_envelope_specs（封筒仕様）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ID |
| order_id | BIGINT | | orders.id | NOT NULL | 注文ID |
| envelope_size | VARCHAR(50) | | | NULL | 封筒サイズ（例：角2封筒） |
| envelope_color | VARCHAR(50) | | | NULL | 封筒色（例：みかん） |
| send_method | VARCHAR(50) | | | NULL | 送付方法 |
| has_seal | BOOLEAN | | | NOT NULL | 糊付けの有無 |
| has_cut_mark | BOOLEAN | | | NOT NULL | 裁断印の有無 |
| has_important_mark | BOOLEAN | | | NOT NULL | 重要印の有無 |
| back_text | VARCHAR(20) | | | NULL | 封筒裏面文言（20文字以内） |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | | | NOT NULL | 更新日時 |

---

### 6. order_stationery_specs（便箋仕様）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ID |
| order_id | BIGINT | | orders.id | NOT NULL | 注文ID |
| writing_direction | ENUM | | | NOT NULL | 書き方（vertical / horizontal） |
| font | VARCHAR(100) | | | NULL | フォント（例：美文字1） |
| has_qr_sticker | BOOLEAN | | | NOT NULL | QRコードシール貼付の有無 |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | | | NOT NULL | 更新日時 |

---

### 7. order_bodies（文面内容）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ID |
| order_id | BIGINT | | orders.id | NOT NULL | 注文ID |
| has_recipient | BOOLEAN | | | NOT NULL | 宛名追加の有無 |
| body_text | TEXT | | | NULL | 本文テキスト |
| page_count | INT | | | NULL | 便箋枚数 |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | | | NOT NULL | 更新日時 |

---

### 8. order_enclosures（同梱物）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ID |
| order_id | BIGINT | | orders.id | NOT NULL | 注文ID |
| name | VARCHAR(200) | | | NOT NULL | 同梱物名 |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |

---

### 9. mailing_lists（送付リスト）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ID |
| order_id | BIGINT | | orders.id | NOT NULL | 注文ID |
| file_name | VARCHAR(255) | | | NOT NULL | ファイル名 |
| file_path | VARCHAR(500) | | | NOT NULL | ファイルパス（ストレージ） |
| row_count | INT | | | NULL | 件数 |
| uploaded_at | TIMESTAMP | | | NOT NULL | アップロード日時 |
| uploaded_by | BIGINT | | users.id | NOT NULL | アップロードユーザーID |

---

### 10. return_reasons（差戻し理由）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ID |
| order_id | BIGINT | | orders.id | NOT NULL | 注文ID |
| reason | TEXT | | | NOT NULL | 差戻し理由 |
| staff_id | BIGINT | | staff.id | NOT NULL | 差し戻した担当者ID |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |

---

### 11. sender_info（差出人情報）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ID |
| company_id | BIGINT | | companies.id | NOT NULL | 企業ID |
| sender_company | VARCHAR(200) | | | NULL | 会社名 |
| department | VARCHAR(100) | | | NULL | 部署名 |
| position | VARCHAR(100) | | | NULL | 役職（肩書） |
| name | VARCHAR(100) | | | NOT NULL | 差出人名 |
| postal_code | VARCHAR(8) | | | NOT NULL | 郵便番号 |
| prefecture | VARCHAR(10) | | | NOT NULL | 都道府県 |
| address1 | VARCHAR(200) | | | NOT NULL | 市町村・番地 |
| address2 | VARCHAR(200) | | | NULL | 建物名など |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | | | NOT NULL | 更新日時 |

---

### 12. templates（文面パターン）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ID |
| company_id | BIGINT | | companies.id | NOT NULL | 企業ID |
| name | VARCHAR(200) | | | NOT NULL | パターン名 |
| has_recipient | BOOLEAN | | | NOT NULL | 宛名追加の有無 |
| body_text | TEXT | | | NOT NULL | 本文テキスト |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | | | NOT NULL | 更新日時 |

---

### 13. staff（社内担当者）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | 担当者ID |
| role_id | BIGINT | | roles.id | NOT NULL | ロールID |
| email | VARCHAR(254) | | | NOT NULL | メールアドレス |
| password_hash | VARCHAR(255) | | | NOT NULL | パスワードハッシュ |
| name | VARCHAR(100) | | | NOT NULL | 担当者名 |
| is_active | BOOLEAN | | | NOT NULL | 有効フラグ |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | | | NOT NULL | 更新日時 |

---

### 14. roles（ロール）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ロールID |
| name | VARCHAR(100) | | | NOT NULL | ロール名 |
| permissions | JSON | | | NOT NULL | 権限定義 |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |

---

### 15. operation_logs（操作履歴）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ID |
| actor_type | ENUM | | | NOT NULL | 操作者種別（user / staff） |
| actor_id | BIGINT | | | NOT NULL | 操作者ID |
| action | VARCHAR(100) | | | NOT NULL | 操作内容（例：order.create） |
| target_type | VARCHAR(100) | | | NULL | 対象リソース種別 |
| target_id | BIGINT | | | NULL | 対象リソースID |
| detail | JSON | | | NULL | 詳細情報 |
| created_at | TIMESTAMP | | | NOT NULL | 操作日時 |

---

### 16. notifications（通知）

| カラム名 | 型 | PK | FK | NULL | 説明 |
|---|---|---|---|---|---|
| id | BIGINT | ○ | | NOT NULL | ID |
| user_id | BIGINT | | users.id | NOT NULL | 通知先ユーザーID |
| type | VARCHAR(100) | | | NOT NULL | 通知種別（例：order.returned） |
| order_id | BIGINT | | orders.id | NULL | 関連注文ID |
| is_read | BOOLEAN | | | NOT NULL | 既読フラグ |
| sent_at | TIMESTAMP | | | NULL | メール送信日時 |
| created_at | TIMESTAMP | | | NOT NULL | 作成日時 |

---

## テーブル関連図（概要）

```
companies ──< users
companies ──< plans
companies ──< orders
companies ──< sender_info
companies ──< templates

orders ──< order_envelope_specs
orders ──< order_stationery_specs
orders ──< order_bodies
orders ──< order_enclosures
orders ──< mailing_lists
orders ──< return_reasons
orders ──< notifications

staff >── roles
return_reasons >── staff

users ──< notifications
users ──< operation_logs
```

---

## 備考

- 論理削除は `deleted_at` カラムで管理（必要テーブルに追加）
- パスワードはbcryptでハッシュ化
- タイムスタンプはUTC管理
