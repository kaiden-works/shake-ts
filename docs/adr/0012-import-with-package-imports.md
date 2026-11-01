# 0012: モジュール間の import は package.json の imports で書く

## ステータス

有効

## 背景

[Node.js で TypeScript を直接実行する](./0001-run-typescript-directly-on-node.md)ため、import のパスは Node.js が解決できる形で書く必要がある。tsconfig の `paths` は tsc の型検査だけが解決し、Node.js は解決しない。[レイヤーと feature でディレクトリーを分ける](./0003-shared-entities-and-per-feature-usecases.md)ため、import はレイヤーと feature をまたぐ。モジュール間の import のパスの書き方を決める必要がある。

## 選択肢

### 選択肢 A: すべて相対パスで書く

`../../entities/integrity.ts` のように、import 元からの相対パスで書く。

利点は、設定がいらないことである。

欠点は、レイヤーをまたぐ import が `../` の連なりになり、依存先のレイヤーと feature を import 文から読み取りにくいことである。

### 選択肢 B: レイヤーや feature をまたぐ import は package.json の imports で書く

[package.json の `imports`](https://nodejs.org/api/packages.html#subpath-imports) に `#*` を `./src/*` に対応づけ、レイヤーや feature をまたぐ import は `#entities/integrity.ts` のように書く。同じディレクトリーの import は `./compare-integrity.ts` のように書く。`../` は使わない。

利点は次のとおり。

- import 文に依存先のレイヤーと feature がそのまま現れる
- パスの形で、依存がレイヤーや feature をまたぐかがわかる

欠点は、package.json に設定がいることである。

## 決定

選択肢 B を採用する。

参照実装は読まれるためにあり、import 文から依存先のレイヤーが読み取れることを優先する。

### 選定に影響しなかった点

特になし。

## トレードオフ

package.json に `imports` の設定がいる。
