# 0009: 外部入力の形式を Interface Adapters の controller でバリデーションする

## ステータス

有効

## 背景

CLI は引数と、SD-JWT などの文字列を外部入力として受け取る。これらは形式が整っているかを確かめる必要がある。形式は仕様が定めない規則で、CLI の入力方法に依存する。

[Clean Architecture を採用する](./0002-clean-architecture-layers.md)と決めた。バリデーションには外部入力の形式と、仕様が定める値の規則の 2 種類がある。[仕様が定める値の規則は Use Cases でバリデーションする](./0008-validate-spec-rules-in-use-cases.md)と決めた。外部入力の形式をどのレイヤーでバリデーションするかを決める必要がある。

## 選択肢

### 選択肢 A: Interface Adapters の controller でバリデーションする

controller が usecase を呼ぶ前に、外部入力の形式を確かめる。

利点は次のとおり。

- usecase が CLI の入力形式に依存せず、形式の整った値だけを扱える
- 形式の誤りを CLI の使い方の誤りとして、usecase の結果と区別できる

欠点は特にない。

### 選択肢 B: Use Cases でバリデーションする

usecase が外部入力を受け取り、形式を確かめる。

利点は特にない。

欠点は次のとおり。

- usecase が CLI の引数の形式に依存する
- 形式の誤りと検証の失敗を usecase の結果で区別する必要がある

## 決定

選択肢 A を採用する。

選択肢 B は usecase が CLI の入力形式に依存するためである。

### 選定に影響しなかった点

特になし。

## トレードオフ

特になし。
