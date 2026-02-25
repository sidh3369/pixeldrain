const API_BASE = "https://pixeldrain.com/api";

function getAuthHeader() {
  const apiKey = process.env.PIXELDRAIN_API_KEY;
  if (!apiKey) {
    throw new Error("PIXELDRAIN_API_KEY is not configured");
  }
  return `Bearer ${apiKey}`;
}

export async function uploadFile(buffer: Buffer, filename: string): Promise<{ id: string; size: number }> {
  const response = await fetch(`${API_BASE}/file/${encodeURIComponent(filename)}`, {
    method: "PUT",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/octet-stream"
    },
    body: buffer
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pixeldrain upload failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { id: string; size: number };
  return { id: data.id, size: data.size };
}

export function getDirectUrl(fileId: string): string {
  const token = process.env.PIXELDRAIN_API_KEY;
  const authQuery = token ? `?auth=${encodeURIComponent(token)}` : "";
  return `${API_BASE}/file/${fileId}${authQuery}`;
}

export async function deleteFile(fileId: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/file/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: getAuthHeader()
    }
  });

  return response.ok;
}
