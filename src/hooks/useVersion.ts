"use client";

import { useState, useEffect } from "react";

let cachedVersion: string | null = null;

export function useVersion() {
  const [version, setVersion] = useState(cachedVersion || "");

  useEffect(() => {
    if (cachedVersion) {
      setVersion(cachedVersion);
      return;
    }

    fetch("https://api.github.com/repos/zorgspace/slashbot/releases/latest")
      .then((res) => res.json())
      .then((data) => {
        if (data.tag_name) {
          cachedVersion = data.tag_name;
          setVersion(data.tag_name);
        }
      })
      .catch(() => {});
  }, []);

  return version;
}
