import type en from './en.js';

// Japanese messages, typed against the English shape so missing keys are caught.
const ja: typeof en = {
  app: {
    title: 'MailGuard DLP',
    tagline: 'メール情報漏洩対策',
  },
  nav: {
    policies: 'ポリシー',
    compose: '作成',
    audit: '監査ログ',
  },
  common: {
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    add: 'ポリシーを追加',
    enabled: '有効',
    disabled: '無効',
    loading: '読み込み中…',
    empty: 'まだ何もありません。',
    retry: '再試行',
  },
  actions: {
    block: 'ブロック',
    warn: '警告',
    log: '記録',
  },
  severity: {
    high: '高',
    medium: '中',
    low: '低',
  },
  policy: {
    name: 'ポリシー名',
    description: '説明',
    action: 'アクション',
    type: 'ルール種別',
    types: {
      keyword: 'キーワード',
      regex: '正規表現',
      pii: '個人情報 (PII)',
      recipientDomain: '宛先ドメイン',
      attachment: '添付ファイル',
    },
    fields: {
      term: 'キーワードまたはフレーズ',
      caseSensitive: '大文字と小文字を区別',
      pattern: 'パターン',
      flags: 'フラグ',
      detector: '検出器',
      mode: 'モード',
      domains: 'ドメイン（カンマ区切り）',
      blockedExtensions: '禁止する拡張子（カンマ区切り）',
      maxSizeBytes: '最大サイズ（バイト）',
    },
    detectors: {
      credit_card: 'クレジットカード番号',
      email: 'メールアドレス',
      phone: '電話番号',
      national_id: 'マイナンバー',
    },
    modes: {
      allowlist: '許可リスト',
      blocklist: '拒否リスト',
    },
    newTitle: '新規ポリシー',
    editTitle: 'ポリシーを編集',
    deleteConfirm: 'このポリシーを削除しますか？',
  },
  compose: {
    to: '宛先',
    toHint: 'カンマ区切りのメールアドレス',
    subject: '件名',
    body: '本文',
    attachments: '添付ファイル',
    addAttachment: '添付ファイルを追加',
    filename: 'ファイル名',
    size: 'サイズ（バイト）',
    send: '送信',
    sending: 'スキャン中…',
    clean: 'ポリシー違反は検出されませんでした。',
    blocked: 'DLP ポリシーにより送信がブロックされました。',
    warned: '警告付きで送信しました。',
    sent: '送信しました — 違反なし。',
    liveHeading: 'リアルタイムポリシーチェック',
  },
  audit: {
    title: '監査ログ',
    subject: '件名',
    recipients: '宛先',
    outcome: '結果',
    violations: '違反',
    when: '日時',
    blocked: 'ブロック',
    allowed: '許可',
  },
  theme: {
    toggle: 'テーマを切り替え',
  },
  locale: {
    label: '言語',
  },
};

export default ja;
