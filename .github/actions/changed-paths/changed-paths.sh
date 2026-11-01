#!/bin/sh
# BASE_SHA と HEAD の差分に PATHS のパターンに一致するファイルがあるかを判定し、relevant を GITHUB_OUTPUT に書く
# 比較元のコミットだけを取り、履歴の量に依らず tree 同士を比べる
# 差分を取れないときは検査する側に倒す
set -u

output() {
    if [ -n "${GITHUB_OUTPUT:-}" ]; then
        echo "relevant=$1" >>"$GITHUB_OUTPUT"
    else
        echo "relevant=$1"
    fi
    exit 0
}

# ブランチ作成時の push では before が全部 0 になる
case "${BASE_SHA:-}" in
*[!0]*) ;;
*) output true ;;
esac

if ! git cat-file -e "$BASE_SHA^{commit}" 2>/dev/null; then
    git fetch --quiet --no-tags --depth=1 origin "$BASE_SHA" || output true
fi

files=$(git diff --name-only "$BASE_SHA" HEAD) || output true

set -f
IFS='
'
for f in $files; do
    for p in ${PATHS:-}; do
        # shellcheck disable=SC2254
        case "$f" in
        $p) output true ;;
        esac
    done
done
output false
