# 0007: 例の定義への保証 VC の URL を対象の URL から導く

## ステータス

有効

## 背景

例の保証者は定義への保証 VC を URL で公開する。仕様はこの URL のオリジンを `iss` と揃えることだけを定め、パスは保証者が決める。例のパスの決め方を決める必要がある。

パスの決め方には 2 つの制約がある。

- [URL で公開する文書は URL のホスト名とパスのとおりに置く](./0005-examples-layout-by-host-and-path.md)ため、あるパスをファイルにすると、その下のパスにファイルを置けない
- 定義への保証 VC は `sub` と `integrity` で対象の定義の 1 つのバージョンを固定するため、同じ定義の異なるバージョンへの保証 VC は別の URL に置く

## 選択肢

### 選択肢 A: EndorsementList の URL の下に名前を付けて置く

`https://kanji-kyokai.example.shake.kaiden.works/endorsements/kanji-3rd-course` のように、保証者の EndorsementList の URL の下に置く。

利点は、保証者が公開する EndorsementList と定義への保証 VC の URL が `/endorsements` 配下に揃うことである。

欠点は次のとおり。

- EndorsementList の URL がファイルになるため、その下にファイルを置けない
- 名前を保証者が付けるため、対象のバージョンを名前に含め忘れると URL が衝突する

### 選択肢 B: `/credentials/` の下に名前を付けて置く

`https://kanji-kyokai.example.shake.kaiden.works/credentials/kanji-3rd-course` のように置く。

利点は、EndorsementList の URL と衝突しないことである。

欠点は、選択肢 A と同じく、名前に対象のバージョンを含め忘れると URL が衝突することである。

### 選択肢 C: `/credentials/` の下に対象の URL から導いたパスで置く

対象の URL からスキームを除いた文字列を、`/credentials/` の下のパスにする。対象の URL が `https://school.example.shake.kaiden.works/goals/kanji-3rd/2.0.0` であれば、URL は `https://kanji-kyokai.example.shake.kaiden.works/credentials/school.example.shake.kaiden.works/goals/kanji-3rd/2.0.0` となる。

利点は次のとおり。

- 対象と URL が 1 対 1 に対応し、名前を付けずに済む
- 対象の発行主体、定義、バージョンが URL から読める
- 異なる発行主体の同じ名前の定義とも衝突しない

欠点は、URL が長くなることである。

## 決定

選択肢 C を採用する。

URL を対象から機械的に導くと、名前の付け方によらず、対象のバージョンごとに別の URL になる。

### 選定に影響しなかった点

特になし。

## トレードオフ

URL が長くなる。定義への保証 VC の URL は EndorsementList に載り、検証者のプログラムが読む。人が入力しないため、長さを受け入れる。
