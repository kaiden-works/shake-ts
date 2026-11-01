import type { CompareIntegrity } from "./compare-integrity.ts";

export async function fetchDocument(
  dependencies: FetchDocumentDependencies,
  url: string,
  integrity: string,
): Promise<Uint8Array> {
  const fetched = await dependencies.fetch(url);
  if (!fetched.ok) {
    throw new DocumentUnavailableError(url, fetched.reason);
  }
  dependencies.compareIntegrity(fetched.body, integrity);
  return fetched.body;
}

export type FetchDocumentDependencies = {
  fetch: FetchPort;
  compareIntegrity: CompareIntegrity;
};

export type FetchPort = (
  url: string,
) => Promise<FetchedDocument | FetchFailure>;

export type FetchedDocument = {
  ok: true;
  status: number;
  headers: Headers;
  body: Uint8Array;
};

export type FetchFailure = { ok: false; reason: string };

export class DocumentUnavailableError extends Error {
  override name = "DocumentUnavailableError";
  readonly url: string;
  readonly reason: string;

  constructor(url: string, reason: string) {
    super(`${url} を取得できない、${reason}`);
    this.url = url;
    this.reason = reason;
  }
}

if (import.meta.vitest) {
  const { describe, test, expect, vi } = import.meta.vitest;

  const url = "https://example.com/goals/a/1.0.0";
  const integrity = "sha256-AAAA";
  const body = new TextEncoder().encode('{"id":"https://example.com/1.0.0"}');
  const fetched: FetchedDocument = {
    ok: true,
    status: 200,
    headers: new Headers(),
    body,
  };

  describe("fetchDocument", () => {
    describe("取得に成功し、完全性ハッシュが一致する場合", () => {
      test("入力の URL で取得を呼ぶ", async () => {
        const fetch = vi.fn<FetchPort>().mockResolvedValue(fetched);
        const compareIntegrity = vi.fn<CompareIntegrity>();
        await fetchDocument({ fetch, compareIntegrity }, url, integrity);
        expect(fetch).toHaveBeenCalledExactlyOnceWith(url);
      });

      test("取得した本文と入力の完全性ハッシュで完全性ハッシュの比較を呼ぶ", async () => {
        const fetch = vi.fn<FetchPort>().mockResolvedValue(fetched);
        const compareIntegrity = vi.fn<CompareIntegrity>();
        await fetchDocument({ fetch, compareIntegrity }, url, integrity);
        expect(compareIntegrity).toHaveBeenCalledExactlyOnceWith(
          body,
          integrity,
        );
      });

      test("呼ぶと本文を返す", async () => {
        const fetch = vi.fn<FetchPort>().mockResolvedValue(fetched);
        const compareIntegrity = vi.fn<CompareIntegrity>();
        expect(
          await fetchDocument({ fetch, compareIntegrity }, url, integrity),
        ).toBe(body);
      });
    });

    describe("取得できない場合", () => {
      test("呼ぶと DocumentUnavailableError を投げる", async () => {
        const fetch = vi
          .fn<FetchPort>()
          .mockResolvedValue({ ok: false, reason: "HTTP 404" });
        const compareIntegrity = vi.fn<CompareIntegrity>();
        await expect(
          fetchDocument({ fetch, compareIntegrity }, url, integrity),
        ).rejects.toThrow(DocumentUnavailableError);
      });

      test("呼んでも完全性ハッシュの比較を呼ばない", async () => {
        const fetch = vi
          .fn<FetchPort>()
          .mockResolvedValue({ ok: false, reason: "HTTP 404" });
        const compareIntegrity = vi.fn<CompareIntegrity>();
        await fetchDocument({ fetch, compareIntegrity }, url, integrity).catch(
          () => undefined,
        );
        expect(compareIntegrity).not.toHaveBeenCalled();
      });
    });

    describe("完全性ハッシュの比較が例外を投げる場合", () => {
      test("呼ぶと同じ例外を投げる", async () => {
        const fetch = vi.fn<FetchPort>().mockResolvedValue(fetched);
        const error = new Error("mismatch");
        const compareIntegrity = vi.fn<CompareIntegrity>(() => {
          throw error;
        });
        await expect(
          fetchDocument({ fetch, compareIntegrity }, url, integrity),
        ).rejects.toBe(error);
      });
    });
  });
}
