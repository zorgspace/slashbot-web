"use client";

import { useState, useEffect } from "react";

let cachedRoadmap: string | null = null;

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState<string>("");
  useEffect(() => {
    if (cachedRoadmap !== null) {
      setRoadmap(cachedRoadmap);
      return;
    }
    fetch("/api/roadmap")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        cachedRoadmap = data.content;
        setRoadmap(data.content);
      })
      .catch(() => setRoadmap("# Roadmap\\n\\nLoading roadmap..."));
  }, []);
  return roadmap;
}