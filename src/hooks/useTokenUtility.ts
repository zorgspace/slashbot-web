"use client";

import { useState, useEffect } from "react";

let cachedTokenDoc: string | null = null;

export function useTokenUtility() {
  const [tokenDoc, setTokenDoc] = useState(cachedTokenDoc || "");

  useEffect(() => {
    if (cachedTokenDoc) {
      setTokenDoc(cachedTokenDoc);
      return;
    }

    fetch("/api/token-utility")
      .then((res) => res.json())
      .then((data) => {
        cachedTokenDoc = data.content;
        setTokenDoc(data.content);
      })
      .catch(() => {});
  }, []);

  return tokenDoc;
}