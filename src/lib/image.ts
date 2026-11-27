/** Shrinks a screenshot in the browser to a JPEG data URL small enough to store. */
export async function compressImage(file: File, maxLength = 700_000) {
  const bitmap = await createImageBitmap(file);
  try {
    for (const [side, quality] of [[1600, 0.8], [1280, 0.7], [1000, 0.6], [800, 0.5]]) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) break;
      context.fillStyle = "#fff"; // transparent areas would otherwise turn black
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL("image/jpeg", quality);
      if (url.length <= maxLength) return url;
    }
    throw new Error("The picture is too large.");
  } finally {
    bitmap.close();
  }
}
