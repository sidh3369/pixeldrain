export type BrowserTorrentFile = {
  name: string;
  size: number;
  type: string;
  arrayBuffer: ArrayBuffer;
};

export type BrowserTorrentProgress = {
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  status: "pending" | "processing" | "completed" | "failed";
};

export function createWebTorrentClientSnippet() {
  return `
import WebTorrent from "webtorrent";

export function startBrowserTorrent({ magnetLink, onProgress, onFile }) {
  const client = new WebTorrent();
  client.add(magnetLink, (torrent) => {
    torrent.on("download", () => {
      const progress = Math.floor(torrent.progress * 100);
      onProgress?.({ progress, downloadedBytes: torrent.downloaded, totalBytes: torrent.length, status: "processing" });
    });

    torrent.on("done", () => {
      onProgress?.({ progress: 100, downloadedBytes: torrent.downloaded, totalBytes: torrent.length, status: "completed" });
    });

    torrent.files.forEach((file) => {
      file.getBuffer((error, buffer) => {
        if (error) return;
        onFile?.({ name: file.name, size: file.length, type: file.name.endsWith(".mkv") ? "video/x-matroska" : "video/mp4", arrayBuffer: buffer.buffer });
      });
    });
  });

  return () => client.destroy();
}
`;
}
