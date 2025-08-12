---
title: Use Custom tRPC v11 Implementation for Type-Safe Extension Messaging
status: Accepted
updated: 2025-08-11
---

## Context

WXTブラウザ拡張機能では、異なる実行コンテキスト（background script、content scripts、popup、options page）間で型安全なメッセージングが必要です。ネイティブのChrome messaging API（`chrome.runtime.sendMessage`、`chrome.tabs.sendMessage`）は型安全性が欠如しており、ランタイムエラーや開発体験の低下につながっています。

@docs/architecture/rfc/2025-08-11-type-safe-messaging-patterns.md での調査により、以下の選択肢を比較検討しました：

1. @webext-core/messaging - 軽量で優れたTypeScriptサポート
2. trpc-chrome - tRPC v10のみサポート、メンテナンスが停滞
3. trpc-browser - tRPC v10のみサポート、比較的アクティブなメンテナンス
4. カスタムtRPC v11実装 - 最新機能と最小バンドルサイズの両立

現在利用可能なtRPCベースのソリューション（trpc-chrome、trpc-browser）はいずれもtRPC v10のみをサポートしており、v11への移行パスが不明確です。また、これらのライブラリはバンドルサイズが30-40KBと比較的大きくなっています。

## Decision

**カスタムtRPC v11実装を採用します。** webext-core/messagingの軽量なアーキテクチャパターンを参考にしながら、tRPC v11の最新機能とZodによる完全な型安全性を実現する独自実装を開発します。

実装アプローチ：

1. **コアメッセージングレイヤー**
   - webext-coreのパターンを参考にした最小限の汎用メッセージング基盤
   - メッセージIDの生成とルーティング
   - エラーのシリアライズ/デシリアライズ
   - リスナー設計は実装に依存（単一・複数いずれも可）

2. **tRPC v11統合レイヤー**
   - tRPC v11のサーバー/クライアント設定
   - カスタムリンク実装
   - 型推論の保持
   - Zod等バリデータの統合（バンドル寄与は使用APIとツリーシェイクに依存）

3. **拡張機能固有の機能**
   - タブメッセージングサポート
   - コンテキスト保持
   - サブスクリプション処理
   - 開発時のHMR下での動作に配慮（保証ではない）

実装は `lib/messaging/` ディレクトリに配置し、将来的なライブラリ化を見据えた疎結合な設計とします。

### アーキテクチャと責務分担

各ライブラリとモジュールの責務を明確に分離：

**外部依存関係の責務：**

- **@trpc/server**: サーバー側（バックグラウンドスクリプト）のRPC処理、ルーター定義、プロシージャー実行
- **@trpc/client**: クライアント側（ポップアップ、コンテンツスクリプト）のRPC呼び出し、プロキシクライアント作成
- **zod**: 入出力のスキーマ定義、実行時の型検証、TypeScript型の自動推論

**lib/messagingの責務：**

- **core.ts**: 汎用メッセージングシステム、メッセージのルーティング実装（内部設計は実装に依存）
- **trpc.ts**: tRPCとブラウザメッセージングの統合、カスタムリンク実装、Observable パターンによる非同期処理
- **adapters/**: フレームワーク固有のブラウザAPI実装（WXT、Chrome、webextension-polyfill対応）

この設計により、各モジュールが単一責任原則に従い、テスト可能性と保守性が向上します。

## Consequences

### ポジティブな影響

- **最新技術スタック**: tRPC v11の最新機能と最適化を活用可能
- **バンドルサイズ管理**: 実測（例: Vite/webpackのBundle Analyzer等）で継続監視。既存ライブラリより小さくできる可能性はあるが、具体的な数値は計測後に記載する。
- **完全な型安全性**: TypeScriptの型推論とZodによるランタイム検証
- **Tree-shakeable**: モジュラーアーキテクチャによる最適化
- **完全なコントロール**: 実装の詳細を完全に制御可能
- **将来的な拡張性**: ライブラリ化や他プロジェクトへの展開が容易
- **tRPC v11+への追従**: 外部ライブラリの更新を待つ必要なし

### ネガティブな影響

- **初期開発工数**: 2-3日の開発期間が必要
- **メンテナンス責任**: 独自実装のメンテナンスとテストが必要
- **コミュニティサポートの欠如**: 既存ライブラリと比較してコミュニティサポートが得られない
- **潜在的なバグリスク**: カスタム実装における未知のバグの可能性

## Alternatives

### Option 1: @webext-core/messaging

- **メリット**: 軽量とされ、WXTエコシステムとのネイティブ統合
- **却下理由**: tRPCの高度な機能（ミドルウェア、バッチング、サブスクリプション）が利用できない。プロジェクトの将来的な要件を考慮すると、より柔軟性の高いソリューションが必要

### Option 2: trpc-browser

- **メリット**: 既存のtRPCパターンとの親和性、アクティブなメンテナンス
- **却下理由**: tRPC v10のみサポート、バンドルサイズが大きい（30-40KB）、v11への移行パスが不明確。2025年8月12日時点でピア依存関係はv10にロックされており、v11に関する公開ロードマップやイシューは存在しない

### Option 3: trpc-chrome

- **メリット**: 成熟した実装、安定性
- **却下理由**: v10のみ（v11サポートは保留中—jlalmes/trpc-chrome#17を参照）、イシューが解決されるまでメンテナンスリスクが残る

## References

- Related RFC: @docs/architecture/rfc/2025-08-11-type-safe-messaging-patterns.md
- webext-core messaging implementation: https://github.com/aklinker1/webext-core
- trpc-browser GitHub: https://github.com/janek26/trpc-browser
- tRPC v11 documentation: https://trpc.io/docs/v11
- Chrome Extension Messaging API: https://developer.chrome.com/docs/extensions/develop/concepts/messaging
- tRPC Subscriptions (v11 SSE): https://trpc.io/docs/server/subscriptions
- WXT Messaging Guide: https://wxt.dev/guide/essentials/messaging

🔄 Revisit this ADR once tRPC v11 support is released in either adapter (on resolution of jlalmes/trpc-chrome#17 or when trpc-browser publishes v11 compatibility).
