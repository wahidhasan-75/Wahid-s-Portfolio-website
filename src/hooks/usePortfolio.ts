import { useEffect, useState } from "react";
import { fallbackPortfolio, mergePortfolioJson, PortfolioData, PortfolioJson } from "@/data/projects";

/**
 * Loads /public/content/portfolio.json at runtime.
 * If missing or invalid, the scene renders with safe cinematic placeholders.
 */
export function usePortfolio(): PortfolioData {
  const [data, setData] = useState<PortfolioData>(fallbackPortfolio);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/content/portfolio.json", { cache: "no-cache" });
        if (!res.ok) return;
        const json = (await res.json()) as PortfolioJson;
        const merged = mergePortfolioJson(json);
        if (alive) setData(merged);
      } catch {
        // ignore - fallbackPortfolio stays
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
