import {
  type Integrity,
  isHashAlgorithm,
  matchesIntegrity,
} from "#entities/integrity.ts";

export const compareIntegrity: CompareIntegrity = (bytes, integrity) => {
  if (!matchesIntegrity(bytes, parseIntegrity(integrity))) {
    throw new IntegrityMismatchError(integrity);
  }
};

export type CompareIntegrity = (bytes: Uint8Array, integrity: string) => void;

export function parseIntegrity(value: string): Integrity {
  const separator = value.indexOf("-");
  const algorithm = separator === -1 ? "" : value.slice(0, separator);
  if (!isHashAlgorithm(algorithm)) {
    throw new UnsupportedHashAlgorithmError(value);
  }
  return { algorithm, digest: value.slice(separator + 1) };
}

export class UnsupportedHashAlgorithmError extends Error {
  override name = "UnsupportedHashAlgorithmError";
  readonly integrity: string;

  constructor(integrity: string) {
    super(`完全性ハッシュ ${integrity} のアルゴリズムに対応していない`);
    this.integrity = integrity;
  }
}

export class IntegrityMismatchError extends Error {
  override name = "IntegrityMismatchError";
  readonly integrity: string;

  constructor(integrity: string) {
    super(`完全性ハッシュ ${integrity} が文書のバイト列と一致しない`);
    this.integrity = integrity;
  }
}

if (import.meta.vitest) {
  const { describe, test, expect } = import.meta.vitest;

  // 期待値を createHash で作ると entity の誤りを見逃すため、外部の既知の値を固定で持つ
  // hex は NIST の例示値 https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines/example-values にある "abc" の SHA-256 のもので、base64 に変換した
  const bytes = new TextEncoder().encode("abc");
  const digest = "ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=";

  describe("parseIntegrity", () => {
    test("対応するアルゴリズムの値を渡すとアルゴリズムと base64 値に分ける", () => {
      expect(parseIntegrity(`sha384-${digest}`)).toEqual({
        algorithm: "sha384",
        digest,
      });
    });

    test("仕様が定めないアルゴリズムの値を渡すと UnsupportedHashAlgorithmError を投げる", () => {
      expect(() => parseIntegrity(`sha1-${digest}`)).toThrow(
        UnsupportedHashAlgorithmError,
      );
    });

    test("オブジェクトのプロトタイプのプロパティー名をアルゴリズムにした値を渡すと UnsupportedHashAlgorithmError を投げる", () => {
      expect(() => parseIntegrity(`toString-${digest}`)).toThrow(
        UnsupportedHashAlgorithmError,
      );
    });

    test("ハイフンを含まない値を渡すと UnsupportedHashAlgorithmError を投げる", () => {
      expect(() => parseIntegrity("sha256")).toThrow(
        UnsupportedHashAlgorithmError,
      );
    });
  });

  describe("compareIntegrity", () => {
    test("一致する完全性ハッシュを渡すと例外を投げない", () => {
      expect(() => compareIntegrity(bytes, `sha256-${digest}`)).not.toThrow();
    });

    test("一致しない完全性ハッシュを渡すと IntegrityMismatchError を投げる", () => {
      const other = new TextEncoder().encode("other");
      expect(() => compareIntegrity(other, `sha256-${digest}`)).toThrow(
        IntegrityMismatchError,
      );
    });
  });
}
