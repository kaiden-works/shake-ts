# 例

仕様の例を、発行主体が URL で公開する文書と、VC にわけて置く。

| 区分 | ディレクトリー | 置くもの |
|---|---|---|
| URL で公開する文書 | `published/<ホスト名>/<URL のパス>` | Issuer 文書、Goal、Rubric、EndorsementList、JWT VC Issuer Metadata |
| VC | `credentials/<ユースケース>/` | VC ペイロードと署名済みの SD-JWT |

URL で公開する文書は、URL のホスト名とパスのとおりに置き、拡張子を付けない。`https://school.example.shake.kaiden.works/issuer/1.0.0` の文書は `published/school.example.shake.kaiden.works/issuer/1.0.0` にある。JWT VC Issuer Metadata は、仕様が定める URL に従い `.well-known/jwt-vc-issuer/issuer/1.0.0` に置く。

VC は原則として VC ペイロードで示す。署名の例示として、卒業研究の到達 VC のみ署名済みの SD-JWT も `.sd-jwt` として置く。

`integrity`、`vct#integrity`、`schemaUri#integrity` は、参照先文書から計算した実際の値を入れてある。

ユースケースは次の 2 つである。

| ユースケース | 内容 |
|---|---|
| [漢字課程](#漢字課程) | 学校が課程と試験を到達目標として定義し、第三者が課程の定義を保証する |
| [卒業研究](#卒業研究) | 研究室が裁量による判定で到達を認定し、共同研究先が到達を保証する |

VC 型の型メタデータ文書と JSON Schema 文書は仕様の一部であり、仕様とともに公開する。ユースケースによらず共通のため、ここには置かない。

## 漢字課程

小学 3 年生の漢字を扱う課程と試験を、それぞれ到達目標として定義する例である。学習者は 16 歳未満を想定し、`cnf` には法定代理人の鍵が入る。

### Issuer

学校の Issuer 文書は [published/school.example.shake.kaiden.works/issuer/1.0.0](published/school.example.shake.kaiden.works/issuer/1.0.0)、JWT VC Issuer Metadata は [published/school.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0](published/school.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0) である。

保証する業界団体も発行主体である。Issuer 文書は [published/kanji-kyokai.example.shake.kaiden.works/issuer/1.0.0](published/kanji-kyokai.example.shake.kaiden.works/issuer/1.0.0)、JWT VC Issuer Metadata は [published/kanji-kyokai.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0](published/kanji-kyokai.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0) である。EndorsementList [published/kanji-kyokai.example.shake.kaiden.works/endorsements](published/kanji-kyokai.example.shake.kaiden.works/endorsements) の `endorsements` は空の配列である。

### Rubric

[published/school.example.shake.kaiden.works/rubrics/kanji-3rd/1.0.0](published/school.example.shake.kaiden.works/rubrics/kanji-3rd/1.0.0) は課程と試験の両方から参照される。

### Goal

課程の到達目標は [published/school.example.shake.kaiden.works/goals/kanji-3rd/2.0.0](published/school.example.shake.kaiden.works/goals/kanji-3rd/2.0.0) である。判定の機会が過程の観察であることは description に書く。

試験の到達目標は [published/school.example.shake.kaiden.works/goals/kanji-kentei-8/1.0.0](published/school.example.shake.kaiden.works/goals/kanji-kentei-8/1.0.0) である。課程と同じ評価尺度を参照し、書きの minLevel を 10 割に上げて水準の違いを表す。

### 到達 VC

課程の到達 VC は [credentials/kanji/course-attainment-credential.json](credentials/kanji/course-attainment-credential.json)、試験の到達 VC は [credentials/kanji/exam-attainment-credential.json](credentials/kanji/exam-attainment-credential.json) である。JWT ヘッダーは次のとおり。

```json
{
  "alg": "Ed25519",
  "typ": "dc+sd-jwt",
  "kid": "key-2026-q3"
}
```

### 定義への保証 VC

[credentials/kanji/definition-endorsement-credential.json](credentials/kanji/definition-endorsement-credential.json) は、第三者の業界団体が課程の定義を保証する例である。業界団体はこの VC を署名済みの SD-JWT として `https://kanji-kyokai.example.shake.kaiden.works/credentials/school.example.shake.kaiden.works/goals/kanji-3rd/2.0.0` で公開する。

学校は保証 VC の URL を [published/school.example.shake.kaiden.works/endorsements](published/school.example.shake.kaiden.works/endorsements) に載せる。[published/school.example.shake.kaiden.works/issuer/1.0.0](published/school.example.shake.kaiden.works/issuer/1.0.0) の `endorsements` がこの EndorsementList を指し、検証者が保証を見つけられるようにする。

## 卒業研究

裁量による判定を明文化した評価尺度の例である。学習者は 16 歳以上のため、保持者は本人とし `cnf` には本人の鍵が入る。

### Issuer

研究室の Issuer 文書は [published/lab.example.shake.kaiden.works/issuer/1.0.0](published/lab.example.shake.kaiden.works/issuer/1.0.0)、JWT VC Issuer Metadata は [published/lab.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0](published/lab.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0) である。

研究室はまだ定義への保証を受けていない。[published/lab.example.shake.kaiden.works/endorsements](published/lab.example.shake.kaiden.works/endorsements) は `endorsements` が空の配列の EndorsementList である。保証を受ける前から EndorsementList を用意し、後から Issuer 文書の新しいバージョンを公開せずに済ませる例である。

保証する共同研究先企業も発行主体である。Issuer 文書は [published/partner.example.shake.kaiden.works/issuer/1.0.0](published/partner.example.shake.kaiden.works/issuer/1.0.0)、JWT VC Issuer Metadata は [published/partner.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0](published/partner.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0) である。EndorsementList [published/partner.example.shake.kaiden.works/endorsements](published/partner.example.shake.kaiden.works/endorsements) の `endorsements` も空の配列である。

### Rubric

[published/lab.example.shake.kaiden.works/rubrics/graduation-research/1.0.0](published/lab.example.shake.kaiden.works/rubrics/graduation-research/1.0.0) は観点 1 つと水準 2 段階で、判定が指導教員の裁量であることを明文化する。

### Goal

[published/lab.example.shake.kaiden.works/goals/graduation-research/1.0.0](published/lab.example.shake.kaiden.works/goals/graduation-research/1.0.0) は thresholds の minLevel を `#approved` とする。達すべき水準で表せない条件は thresholdNote に記す。

### 到達 VC

到達 VC は [credentials/graduation-research/attainment-credential.json](credentials/graduation-research/attainment-credential.json) である。

これに署名した結果が [credentials/graduation-research/attainment-credential.sd-jwt](credentials/graduation-research/attainment-credential.sd-jwt) である。全クレームを常に開示するため Disclosure はなく、末尾はチルダで終わる。

署名鍵は例示用の固定シードから導いた Ed25519 鍵である。公開鍵は JWT VC Issuer Metadata [published/lab.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0](published/lab.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0) に入れてある。

### 到達への保証 VC

[credentials/graduation-research/attainment-endorsement-credential.json](credentials/graduation-research/attainment-endorsement-credential.json) は、共同研究先企業のメンターが学習者の到達 VC を保証する例である。`sub` は、仕様が定める到達 VC の到達 ID である。
