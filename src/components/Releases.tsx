"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useReleases } from "@/hooks/useReleases";

export function Releases() {
  const releases = useReleases();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpanded = (tag: string) => {
    setExpanded(expanded === tag ? null : tag);
  };

  return (
    <div>
      <h3 className="text-terminal-violet font-bold mb-4">
        Latest Releases
      </h3>
      <div className="space-y-4">
        {releases.map((release) => (
          <motion.div
            key={release.tag_name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-terminal-muted rounded p-4 cursor-pointer"
            onClick={() => toggleExpanded(release.tag_name)}
          >
            <div className="flex justify-between items-center">
              <h4 className="text-terminal-text font-semibold">
                {release.name} ({release.tag_name})
              </h4>
              <span className="text-terminal-muted text-sm">
                {new Date(release.published_at).toLocaleDateString()}
              </span>
            </div>
            {expanded === release.tag_name && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="mt-2 text-terminal-muted text-sm overflow-hidden"
              >
                {release.body}
                <div className="mt-4 space-x-2">
                  <a href={release.zipball_url} className="bg-terminal-violet text-white px-3 py-1 rounded text-xs" download>Download ZIP</a>
                  <a href={release.tarball_url} className="bg-terminal-violet text-white px-3 py-1 rounded text-xs" download>Download TAR</a>
                  {release.assets.map(asset => (
                    <a key={asset.name} href={asset.browser_download_url} className="bg-terminal-violet text-white px-3 py-1 rounded text-xs" download>{asset.name}</a>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}