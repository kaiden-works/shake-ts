# 0003: entity を共通にし、usecase と adapter を feature ごとに置く

## ステータス

有効

## 背景

[clean architecture のレイヤーで組む](./0002-clean-architecture-layers.md)と決めた。ディレクトリーをレイヤーで切るか、feature で切るかを決める必要がある。

feature は verify、precheck、issue、present の 4 つで、[PRD のスコープ](../PRD.md#スコープ)に対応する。4 つは仕様の用語表 1 つで定まる同じモデルを扱い、違いは検証者、評価者、保証者、保持者という役割だけである。bounded context は 1 つである。

## 選択肢

### 選択肢 A: レイヤーだけで切る

`entities`、`usecases`、`adapters` のディレクトリーに、4 つの feature のモジュールを混ぜて置く。

利点は、ディレクトリーが少ないことである。

欠点は、ディレクトリー名からリポジトリーが何をするものか読めず、feature ごとのモジュールの範囲もわからないことである。

### 選択肢 B: feature だけで切る

`verify`、`precheck`、`issue`、`present` のディレクトリーに、entity を含む全層を置く。

利点は、ディレクトリー名で目的が読めることである。

欠点は、bounded context が 1 つで entity を 4 つの feature が共有するため、entity の置き場が決まらず、重複か feature 間の import が生じることである。

### 選択肢 C: entity を共通にし、usecase と adapter を feature ごとに置く

`entities` を共通に置き、`verify`、`precheck`、`issue`、`present` の下に `usecases` と `adapters` を置く。precheck は verify の usecase を使い、逆方向の依存は作らない。

利点は次のとおり。

- ディレクトリー名で目的が読める
- 共有する entity の置き場が 1 つに決まる

欠点は、precheck が verify の usecase を使うため、feature 間に一方向の依存が生じることである。

## 決定

選択肢 C を採用する。

bounded context が 1 つのため entity は共有が自然で、feature ごとの置き場は目的を読めるようにする。precheck から verify への依存は検証手順の一部を発行前に行う関係そのもので、構造に表す方がよい。

### 選定に影響しなかった点

特になし。

## トレードオフ

precheck から verify への一方向の依存を持つ。
