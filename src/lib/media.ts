"use client";

// Uploaded files are stored in IndexedDB (prototype only).
import { useEffect, useState } from "react";

export const LIMITS = {
  image: { types: ["image/jpeg", "image/png", "image/webp"], maxMb: 5 },
  video: { types: ["video/mp4", "video/webm"], maxMb: 50 },
};

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    const open = indexedDB.open("avenpro-media", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("files");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction("files", mode);
      const request = action(tx.objectStore("files"));
      tx.oncomplete = () => {
        db.close();
        resolve(request.result);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
}

export const saveFile = (id: string, file: Blob) => run("readwrite", (s) => s.put(file, id));
export const deleteFile = (id: string) => run("readwrite", (s) => s.delete(id));

export function useMediaUrl(id: string) {
  const [loaded, setLoaded] = useState<{ id: string; url: string }>();
  useEffect(() => {
    if (!id) return;
    let url = "";
    let active = true;
    run<Blob | undefined>("readonly", (s) => s.get(id))
      .then((blob) => {
        if (!active || !blob) return;
        url = URL.createObjectURL(blob);
        setLoaded({ id, url });
      })
      .catch(() => {});
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  return loaded && loaded.id === id ? loaded.url : "";
}
