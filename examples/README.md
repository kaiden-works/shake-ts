# 例

仕様の例の JSON をユースケースごとのディレクトリーに置く。VC は原則として SD-JWT のペイロードとして示す。署名の例示として、卒業研究の到達 VC のみ署名済みの SD-JWT も `.sd-jwt` として置く。

`integrity`、`vct#integrity`、`schemaUri#integrity` は、参照先文書から計算した実際の値を入れてある。

| ユースケース | ディレクトリー | 内容 |
|---|---|---|
| 漢字課程 | [kanji/](kanji/) | 学校が課程と試験を到達目標として定義し、第三者が課程の定義を保証する |
| 卒業研究 | [graduation-research/](graduation-research/) | 研究室が裁量による判定で到達を認定し、共同研究先が到達を保証する |

VC 型の型メタデータ文書は仕様の一部であり、仕様とともに公開する。ユースケースによらず共通である。

## 漢字課程

小学 3 年生の漢字を扱う課程と試験を、それぞれ到達目標として定義する例である。学習者は 16 歳未満を想定し、`cnf` には法定代理人の鍵が入る。

### Issuer

学校の Issuer 文書は [kanji/issuer.json](kanji/issuer.json)、検証鍵は [kanji/jwt-vc-issuer-metadata.json](kanji/jwt-vc-issuer-metadata.json) である。

保証する業界団体も発行主体である。Issuer 文書は [kanji/accreditation-issuer.json](kanji/accreditation-issuer.json)、検証鍵は [kanji/accreditation-jwt-vc-issuer-metadata.json](kanji/accreditation-jwt-vc-issuer-metadata.json) である。EndorsementList [kanji/accreditation-endorsements.json](kanji/accreditation-endorsements.json) の `endorsements` は空の配列である。

### Rubric

[kanji/rubric.json](kanji/rubric.json) は課程と試験の両方から参照される。

### Goal

課程の到達目標は [kanji/course-goal.json](kanji/course-goal.json) である。判定の機会が過程の観察であることは description に書く。

試験の到達目標は [kanji/exam-goal.json](kanji/exam-goal.json) である。課程と同じ評価尺度を参照し、書きの minLevel を 10 割に上げて水準の違いを表す。

### 到達 VC

課程の到達 VC は [kanji/course-attainment-credential.json](kanji/course-attainment-credential.json)、試験の到達 VC は [kanji/exam-attainment-credential.json](kanji/exam-attainment-credential.json) を参照する。JWT ヘッダーは次のとおり。

```json
{
  "alg": "Ed25519",
  "typ": "dc+sd-jwt",
  "kid": "key-2026-q3"
}
```

### 定義への保証 VC

[kanji/definition-endorsement-credential.json](kanji/definition-endorsement-credential.json) は、第三者の業界団体が課程の定義を保証する例である。認定基準は VC に載せない。

評価者は保証 VC の URL を [kanji/endorsements.json](kanji/endorsements.json) に載せる。[kanji/issuer.json](kanji/issuer.json) の `endorsements` がこの EndorsementList を指し、検証者が保証を見つけられるようにする。

## 卒業研究

裁量による判定を明文化した評価尺度の例である。学習者は 16 歳以上のため、保持者は本人とし `cnf` には本人の鍵が入る。

### Issuer

研究室の Issuer 文書は [graduation-research/issuer.json](graduation-research/issuer.json)、検証鍵は [graduation-research/jwt-vc-issuer-metadata.json](graduation-research/jwt-vc-issuer-metadata.json) である。

研究室はまだ定義への保証を受けていない。[graduation-research/endorsements.json](graduation-research/endorsements.json) は `endorsements` が空の配列の EndorsementList である。保証を受ける前から EndorsementList を用意し、後から Issuer 文書の新しいバージョンを公開せずに済ませる例である。

保証する共同研究先企業も発行主体である。Issuer 文書は [graduation-research/partner-issuer.json](graduation-research/partner-issuer.json)、検証鍵は [graduation-research/partner-jwt-vc-issuer-metadata.json](graduation-research/partner-jwt-vc-issuer-metadata.json) である。EndorsementList [graduation-research/partner-endorsements.json](graduation-research/partner-endorsements.json) の `endorsements` も空の配列である。

### Rubric

[graduation-research/rubric.json](graduation-research/rubric.json) は観点 1 つと水準 2 段階で、判定が指導教員の裁量であることを明文化する。

### Goal

[graduation-research/goal.json](graduation-research/goal.json) は thresholds の minLevel を `#approved` とする。達すべき水準で表せない条件は thresholdNote に記す。

### 到達 VC

[graduation-research/attainment-credential.json](graduation-research/attainment-credential.json) を参照する。

これを署名した結果が [graduation-research/attainment-credential.sd-jwt](graduation-research/attainment-credential.sd-jwt) である。全クレームを常に開示するため Disclosure はなく、末尾はチルダで終わる。

署名鍵は例示用の固定シードから導いた Ed25519 鍵である。公開鍵は [graduation-research/jwt-vc-issuer-metadata.json](graduation-research/jwt-vc-issuer-metadata.json) に入れてある。秘密鍵はリポジトリーに置かない。

### 到達への保証 VC

[graduation-research/attainment-endorsement-credential.json](graduation-research/attainment-endorsement-credential.json) は、共同研究先企業のメンターが学習者の到達 VC を保証する例である。`sub` は、仕様が定める到達 VC の到達 ID である。
