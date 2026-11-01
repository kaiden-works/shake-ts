import { createHash } from "node:crypto";

// キーは仕様の参照の節が定める完全性ハッシュのアルゴリズム名、値は createHash に渡すハッシュ名
// 2 つの名前は別の規格が定めており、綴りの一致に頼らないため対応表で分ける
export const NODE_HASH_NAMES = {
  sha256: "sha256",
  sha384: "sha384",
  sha512: "sha512",
} as const;

export type HashAlgorithm = keyof typeof NODE_HASH_NAMES;

export type Integrity = {
  algorithm: HashAlgorithm;
  digest: string;
};

// in 演算子はプロトタイプの toString などにも true を返すため、自身のプロパティーだけを見る
export function isHashAlgorithm(value: string): value is HashAlgorithm {
  return Object.hasOwn(NODE_HASH_NAMES, value);
}

export function matchesIntegrity(
  bytes: Uint8Array,
  integrity: Integrity,
): boolean {
  const digest = createHash(NODE_HASH_NAMES[integrity.algorithm])
    .update(bytes)
    .digest("base64");
  return digest === integrity.digest;
}

if (import.meta.vitest) {
  const { describe, test, expect } = import.meta.vitest;

  // 期待値を実装と同じ createHash で作ると、アルゴリズム名の対応や符号化の誤りを検出できないため、外部の既知の値を固定で持つ
  // hex は NIST の例示値 https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines/example-values にある "abc" のもので、base64 に変換した
  const bytes = new TextEncoder().encode("abc");
  const DIGESTS_OF_ABC: Record<HashAlgorithm, string> = {
    sha256: "ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=",
    sha384: "ywB1P0WjXou1oD1pmsZQBycsMqsO3tFjGotgWkP/W+2AhgcroefMI1i67KE0yCWn",
    sha512:
      "3a81oZNherrMQXNJriBBMRLm+k6JqX6iCp7u5ktV05ohkpkqJ0/BqDa6PCOj/uu9RU1EI2Q86A4qmslPpUyknw==",
  };
  // RFC 9530 の付録 B.2 の図 14 が空の内容の Content-Digest として載せる値 https://www.rfc-editor.org/rfc/rfc9530.html#appendix-B.2
  const SHA256_OF_EMPTY = "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";

  describe("isHashAlgorithm", () => {
    test.each(Object.keys(NODE_HASH_NAMES))(
      "%s を渡すと true を返す",
      (algorithm) => {
        expect(isHashAlgorithm(algorithm)).toBe(true);
      },
    );

    test.each(["md5", "toString"])("%s を渡すと false を返す", (value) => {
      expect(isHashAlgorithm(value)).toBe(false);
    });
  });

  describe("matchesIntegrity", () => {
    test.each(Object.keys(NODE_HASH_NAMES) as HashAlgorithm[])(
      "%s で計算した一致する完全性ハッシュを渡すと true を返す",
      (algorithm) => {
        expect(
          matchesIntegrity(bytes, {
            algorithm,
            digest: DIGESTS_OF_ABC[algorithm],
          }),
        ).toBe(true);
      },
    );

    test("空のバイト列と一致する完全性ハッシュを渡すと true を返す", () => {
      expect(
        matchesIntegrity(new Uint8Array(), {
          algorithm: "sha256",
          digest: SHA256_OF_EMPTY,
        }),
      ).toBe(true);
    });

    test("別のバイト列の完全性ハッシュを渡すと false を返す", () => {
      const other = new TextEncoder().encode("other");
      expect(
        matchesIntegrity(other, {
          algorithm: "sha256",
          digest: DIGESTS_OF_ABC.sha256,
        }),
      ).toBe(false);
    });
  });
}
