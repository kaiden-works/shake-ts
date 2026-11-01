import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { FetchPort } from "#verify/usecases/fetch-document.ts";

// ファイルを読めたことを、取得に成功した応答として扱う
const HTTP_OK = 200;

// docs/adr/0005-examples-layout-by-host-and-path.md
export function resolveExamplePath(root: string, url: string): string {
  const { hostname, pathname } = new URL(url);
  return join(root, hostname, pathname);
}

// パス上に文書がないことを表す errno で、HTTP 404 にあたる
// EACCES などは文書の有無と無関係なため含めない
const NOT_FOUND_CODES = new Set(["ENOENT", "ENOTDIR"]);

function isNotFound(e: unknown): boolean {
  return (
    e instanceof Error &&
    "code" in e &&
    typeof e.code === "string" &&
    NOT_FOUND_CODES.has(e.code)
  );
}

export function createExampleFetch(root: string): FetchPort {
  return async (url) => {
    try {
      const body = await readFile(resolveExamplePath(root, url));
      return { ok: true, status: HTTP_OK, headers: new Headers(), body };
    } catch (e) {
      // 文書がない以外の例外は port 実装の不具合のため、検証の失敗にせず伝播させる
      if (isNotFound(e)) {
        return { ok: false, reason: String(e) };
      }
      throw e;
    }
  };
}

if (import.meta.vitest) {
  const { describe, test, expect, vi } = import.meta.vitest;

  vi.mock("node:fs/promises", async (importOriginal) => ({
    ...(await importOriginal<typeof import("node:fs/promises")>()),
    readFile: vi.fn(),
  }));

  describe("resolveExamplePath", () => {
    test("URL のホスト名とパスをルートの下のパスにする", () => {
      expect(
        resolveExamplePath(
          "examples/published",
          "https://school.example.shake.kaiden.works/goals/kanji-3rd/2.0.0",
        ),
      ).toBe(
        "examples/published/school.example.shake.kaiden.works/goals/kanji-3rd/2.0.0",
      );
    });

    test(".well-known 配下の URL を同じパスにする", () => {
      expect(
        resolveExamplePath(
          "examples/published",
          "https://lab.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0",
        ),
      ).toBe(
        "examples/published/lab.example.shake.kaiden.works/.well-known/jwt-vc-issuer/issuer/1.0.0",
      );
    });

    test("URL のフラグメントとクエリーをパスに含めない", () => {
      expect(
        resolveExamplePath(
          "examples/published",
          "https://school.example.shake.kaiden.works/rubrics/kanji-3rd/1.0.0?a=1#reading",
        ),
      ).toBe(
        "examples/published/school.example.shake.kaiden.works/rubrics/kanji-3rd/1.0.0",
      );
    });
  });

  describe("createExampleFetch", () => {
    const root = "examples/published";
    const url = "https://school.example.shake.kaiden.works/issuer/1.0.0";
    // readFile が返す Buffer をそのまま本文にするため、期待値も Buffer で持つ
    const body = Buffer.from('{"id":"https://example.com/1.0.0"}');

    test("URL から求めたパスで readFile を呼ぶ", async () => {
      vi.mocked(readFile).mockResolvedValue(body);
      await createExampleFetch(root)(url);
      expect(readFile).toHaveBeenCalledExactlyOnceWith(
        resolveExamplePath(root, url),
      );
    });

    test("ファイルを読めると本文とステータス 200 を返す", async () => {
      vi.mocked(readFile).mockResolvedValue(body);
      expect(await createExampleFetch(root)(url)).toEqual({
        ok: true,
        status: HTTP_OK,
        headers: expect.any(Headers),
        body,
      });
    });

    test.each(["ENOENT", "ENOTDIR"])(
      "readFile が %s を投げると取得失敗を返す",
      async (code) => {
        vi.mocked(readFile).mockRejectedValue(
          Object.assign(new Error(code), { code }),
        );
        expect(await createExampleFetch(root)(url)).toEqual({
          ok: false,
          reason: `Error: ${code}`,
        });
      },
    );

    test("readFile が文書がない以外の例外を投げると同じ例外を投げる", async () => {
      const error = Object.assign(new Error("EACCES"), { code: "EACCES" });
      vi.mocked(readFile).mockRejectedValue(error);
      await expect(createExampleFetch(root)(url)).rejects.toBe(error);
    });
  });
}
