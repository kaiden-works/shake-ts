import type { FetchPort } from "#verify/usecases/fetch-document.ts";

export const fetchOverHttp: FetchPort = async (url) => {
  try {
    // 仕様の文書の取得はリダイレクトに従うため、fetch の既定のまま呼ぶ
    const response = await fetch(url);
    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status}` };
    }
    // 仕様は Content-Encoding を復号した後の本文から完全性ハッシュを計算する
    // fetch は復号済みの本文を返すため、そのままバイト列で受け取る
    const body = await response.bytes();
    return {
      ok: true,
      status: response.status,
      headers: response.headers,
      body,
    };
  } catch (e) {
    // fetch はネットワークの失敗と不正な URL を TypeError で投げる
    // それ以外は port 実装の不具合のため、検証の失敗にせず伝播させる
    if (e instanceof TypeError) {
      return { ok: false, reason: String(e) };
    }
    throw e;
  }
};

if (import.meta.vitest) {
  const { describe, test, expect, vi } = import.meta.vitest;

  const url = "https://example.com/goals/a/1.0.0";
  const body = new TextEncoder().encode('{"id":"https://example.com/1.0.0"}');

  describe("fetchOverHttp", () => {
    test("入力の URL で fetch を呼ぶ", async () => {
      const fetchFn = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(body));
      vi.stubGlobal("fetch", fetchFn);
      await fetchOverHttp(url);
      expect(fetchFn).toHaveBeenCalledExactlyOnceWith(url);
    });

    test("2xx の応答を受けると本文、ステータス、ヘッダーを返す", async () => {
      const headers = new Headers({ "Cache-Control": "max-age=60" });
      vi.stubGlobal(
        "fetch",
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(new Response(body, { status: 200, headers })),
      );
      const result = await fetchOverHttp(url);
      expect(result).toEqual({
        ok: true,
        status: 200,
        headers: expect.any(Headers),
        body,
      });
      expect(result.ok && result.headers.get("Cache-Control")).toBe(
        "max-age=60",
      );
    });

    test.each([404, 500])(
      "%d の応答を受けると取得失敗を返す",
      async (status) => {
        vi.stubGlobal(
          "fetch",
          vi
            .fn<typeof fetch>()
            .mockResolvedValue(new Response(null, { status })),
        );
        expect(await fetchOverHttp(url)).toEqual({
          ok: false,
          reason: `HTTP ${status}`,
        });
      },
    );

    test("fetch が例外を投げると取得失敗を返す", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn<typeof fetch>().mockRejectedValue(new TypeError("fetch failed")),
      );
      expect(await fetchOverHttp(url)).toEqual({
        ok: false,
        reason: "TypeError: fetch failed",
      });
    });

    test("fetch が TypeError 以外の例外を投げると同じ例外を投げる", async () => {
      const error = new RangeError("unexpected");
      vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(error));
      await expect(fetchOverHttp(url)).rejects.toBe(error);
    });
  });
}
