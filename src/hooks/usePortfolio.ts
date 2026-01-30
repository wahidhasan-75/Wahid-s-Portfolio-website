import { useEffect, useState } from "react";
import {
  fallbackPortfolio,
  mergePortfolioJson,
  PortfolioData,
  PortfolioJson,
} from "@/data/projects";

/**
 * Loads public/content/portfolio.json at runtime.
 * ✅ Uses Vite BASE_URL so it works on GitHub Pages sub-paths like:
 *   https://wahidhasan-75.github.io/Wahid-s-Portfolio-website/
 */
export function usePortfolio(): PortfolioData {
  const [data, setData] = useState<PortfolioData>(fallbackPortfolio);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // ✅ Works in dev ("/") and in GitHub Pages ("/Wahid-s-Portfolio-website/")
        const url = `${import.meta.env.BASE_URL}content/portfolio.json`;

        const res = await fetch(url, { cache: "no-cache" });
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

