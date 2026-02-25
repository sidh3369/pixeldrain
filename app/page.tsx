"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderPlus, Link2, List, Grid2X2, Play, RefreshCcw, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";

type Folder = { id: string; name: string; _count?: { files: number } };
type FileItem = { id: string; name: string; size: string; pixeldrainId: string; folderId: string | null; mimeType: string };
type Job = { id: string; status: string; progress: number; magnetLink: string; createdAt: string };

export default function HomePage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [newFolderName, setNewFolderName] = useState("");
  const [magnet, setMagnet] = useState("");
  const [preview, setPreview] = useState<FileItem | null>(null);

  async function loadFolders() {
    const response = await fetch("/api/folders");
    setFolders(await response.json());
  }

  async function loadFiles(folderId?: string | null) {
    const q = folderId ? `?folderId=${folderId}` : "";
    const response = await fetch(`/api/files${q}`);
    setFiles(await response.json());
  }

  async function loadJobs() {
    const response = await fetch("/api/upload");
    setJobs(await response.json());
  }

  useEffect(() => {
    setView((localStorage.getItem("study-view") as "grid" | "list") || "grid");
    void loadFolders();
    void loadFiles(currentFolder);
    void loadJobs();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => void loadJobs(), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void loadFiles(currentFolder);
  }, [currentFolder]);

  const filteredFiles = useMemo(() => files.filter((file) => file.name.toLowerCase().includes(search.toLowerCase())), [files, search]);

  const totalSize = useMemo(() => files.reduce((acc, file) => acc + Number(file.size), 0), [files]);

  async function createFolder() {
    if (!newFolderName.trim()) return;
    await fetch("/api/folders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newFolderName }) });
    setNewFolderName("");
    await loadFolders();
  }

  async function submitMagnet() {
    if (!magnet.trim()) return;
    await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ magnetLink: magnet, folderId: currentFolder })
    });
    setMagnet("");
    await loadJobs();
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <header className="sticky top-0 z-10 mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/95 p-3 backdrop-blur">
        <h1 className="text-lg font-semibold">Study Material Stream</h1>
        <Input placeholder="Search videos..." value={search} onChange={(e) => setSearch(e.target.value)} className="ml-auto max-w-xs" />
        <Button variant="outline" asChild>
          <a href="/stremio/manifest.json" target="_blank"><Tv className="mr-2 h-4 w-4" />Install Stremio Addon</a>
        </Button>
        <Button variant="outline" size="icon" onClick={() => { void loadFolders(); void loadFiles(currentFolder); }}><RefreshCcw className="h-4 w-4" /></Button>
      </header>

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 text-sm text-muted-foreground">All Folders</div>
          <div className="space-y-1">
            <button onClick={() => setCurrentFolder(null)} className="block w-full rounded px-2 py-1 text-left hover:bg-muted">All Videos</button>
            {folders.map((folder) => (
              <button key={folder.id} onClick={() => setCurrentFolder(folder.id)} className="block w-full rounded px-2 py-1 text-left hover:bg-muted">
                {folder.name} <span className="text-xs text-muted-foreground">({folder._count?.files ?? 0})</span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">Uploads / Jobs</div>
          <div className="mt-2 space-y-2">
            {jobs.slice(0, 4).map((job) => (
              <Card key={job.id} className="p-2">
                <div className="mb-1 flex items-center justify-between text-xs"><span>{job.status}</span><span>{job.progress}%</span></div>
                <Progress value={job.progress} />
              </Card>
            ))}
          </div>
        </aside>

        <section className="space-y-3">
          <Breadcrumb items={["Home", currentFolder ? folders.find((f) => f.id === currentFolder)?.name || "Folder" : "All Videos"]} />
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
            <Input placeholder="New folder name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="max-w-xs" />
            <Button onClick={createFolder}><FolderPlus className="mr-2 h-4 w-4" />New Folder</Button>
            <Input placeholder="Paste magnet link" value={magnet} onChange={(e) => setMagnet(e.target.value)} className="max-w-md" />
            <Button onClick={submitMagnet} variant="outline"><Link2 className="mr-2 h-4 w-4" />Upload Magnet</Button>
            <div className="ml-auto flex gap-1">
              <Button size="icon" variant={view === "grid" ? "default" : "outline"} onClick={() => { setView("grid"); localStorage.setItem("study-view", "grid"); }}><Grid2X2 className="h-4 w-4" /></Button>
              <Button size="icon" variant={view === "list" ? "default" : "outline"} onClick={() => { setView("list"); localStorage.setItem("study-view", "list"); }}><List className="h-4 w-4" /></Button>
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30">
                    <button onClick={() => setPreview(file)}><Play className="h-8 w-8" /></button>
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <Badge>{formatBytes(Number(file.size))}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border">
              {filteredFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between border-b border-border p-3 last:border-none">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(Number(file.size))}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setPreview(file)}>Preview</Button>
                </div>
              ))}
            </div>
          )}

          <footer className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            {folders.length} folders • {files.length} videos • {formatBytes(totalSize)} total • {jobs.filter((j) => j.status === "completed").length} completed jobs
          </footer>
        </section>
      </div>

      {preview && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreview(null)}>
          <div className="w-full max-w-3xl rounded-lg border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-2 text-sm font-medium">{preview.name}</h2>
            <video controls className="max-h-[70vh] w-full" src={`https://pixeldrain.com/api/file/${preview.pixeldrainId}`} />
          </div>
        </div>
      )}
    </main>
  );
}
