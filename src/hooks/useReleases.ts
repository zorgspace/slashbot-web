"use client";

import { useState, useEffect } from "react";

interface Release {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
}

let cachedReleases: Release[] | null = null;

export function useReleases() {
  const [releases, setReleases] = useState<Release[]>(cachedReleases || []);

  useEffect(() => {
    if (cachedReleases) {
      setReleases(cachedReleases);
      return;
    }

    fetch("https://api.github.com/repos/zorgspace/slashbot/releases?per_page=3")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          cachedReleases = data;
          setReleases(data);
        }
      })
      .catch(() => {});
  }, []);

  return releases;
}