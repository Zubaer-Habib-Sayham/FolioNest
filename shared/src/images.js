export const MAX_PHOTO_BYTES = 96_000;
export const MAX_BACKUP_BYTES = 2_000_000;
export function rasterDimensions(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    bytes.length >= 24 &&
    bytes
      .slice(0, 8)
      .every((b, i) => b === [137, 80, 78, 71, 13, 10, 26, 10][i]) &&
    view.getUint32(12) === 0x49484452
  )
    return {
      width: view.getUint32(16),
      height: view.getUint32(20),
      type: "image/png",
    };
  if (bytes.length >= 12 && bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset++] !== 255) break;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 217 || marker === 218) break;
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if (
        [
          192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
        ].includes(marker) &&
        length >= 8
      )
        return {
          width: view.getUint16(offset + 5),
          height: view.getUint16(offset + 3),
          type: "image/jpeg",
        };
      offset += length;
    }
  }
  const ascii = (start, length) =>
    String.fromCharCode(...bytes.slice(start, start + length));
  if (bytes.length >= 30 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    const u24 = (n) => bytes[n] | (bytes[n + 1] << 8) | (bytes[n + 2] << 16);
    if (ascii(12, 4) === "VP8X")
      return { width: u24(24) + 1, height: u24(27) + 1, type: "image/webp" };
    if (
      ascii(12, 4) === "VP8 " &&
      bytes[23] === 157 &&
      bytes[24] === 1 &&
      bytes[25] === 42
    )
      return {
        width: view.getUint16(26, true) & 16383,
        height: view.getUint16(28, true) & 16383,
        type: "image/webp",
      };
    if (ascii(12, 4) === "VP8L" && bytes[20] === 47)
      return {
        width: 1 + (bytes[21] | ((bytes[22] & 63) << 8)),
        height:
          1 + ((bytes[22] >> 6) | (bytes[23] << 2) | ((bytes[24] & 15) << 10)),
        type: "image/webp",
      };
  }
  throw new Error("Choose a valid JPEG, PNG or WebP photo.");
}
export function validPhoto(value) {
  if (!value) return true;
  if (
    !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) ||
    value.length > 171000
  )
    return false;
  try {
    const bytes = Uint8Array.from(
      atob(value.slice(value.indexOf(",") + 1)),
      (c) => c.charCodeAt(0),
    );
    const d = rasterDimensions(bytes);
    return (
      bytes.length <= MAX_PHOTO_BYTES &&
      ((d.type === "image/jpeg" &&
        value.startsWith("data:image/jpeg;") &&
        bytes.at(-2) === 255 &&
        bytes.at(-1) === 217) ||
        (d.type === "image/png" &&
          value.startsWith("data:image/png;") &&
          cleanPNG(bytes)) ||
        (d.type === "image/webp" &&
          value.startsWith("data:image/webp;") &&
          cleanWebP(bytes))) &&
      d.width > 0 &&
      d.height > 0 &&
      Math.max(d.width, d.height) <= 1200
    );
  } catch {
    return false;
  }
}
function cleanWebP(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 30 || view.getUint32(4, true) + 8 !== bytes.length)
    return false;
  let offset = 12,
    imageData = false;
  while (offset + 8 <= bytes.length) {
    const type = String.fromCharCode(...bytes.slice(offset, offset + 4));
    const length = view.getUint32(offset + 4, true);
    const end = offset + 8 + length + (length % 2);
    if (end > bytes.length || !["VP8X", "VP8 ", "VP8L", "ALPH"].includes(type))
      return false;
    if (type === "VP8X" && (length !== 10 || bytes[offset + 8] & 2))
      return false;
    if (type === "VP8 " || type === "VP8L") imageData = true;
    offset = end;
  }
  return imageData && offset === bytes.length;
}

// Accept bounded, single-frame PNGs without embedded text or original file metadata.
function cleanPNG(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;
  let imageData = false;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const end = offset + 12 + length;
    if (end > bytes.length) return false;
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    if (
      !["IHDR", "IDAT", "IEND", "sRGB", "pHYs", "PLTE", "tRNS"].includes(type)
    )
      return false;
    if (offset === 8 && (type !== "IHDR" || length !== 13)) return false;
    if (
      type === "IHDR" &&
      (offset !== 8 ||
        bytes[offset + 16] !== 8 ||
        ![0, 2, 3, 4, 6].includes(bytes[offset + 17]))
    )
      return false;
    let crc = 0xffffffff;
    for (let i = offset + 4; i < end - 4; i++) {
      crc ^= bytes[i];
      for (let bit = 0; bit < 8; bit++)
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    if ((crc ^ 0xffffffff) >>> 0 !== view.getUint32(end - 4)) return false;
    if (type === "IDAT") imageData = true;
    if (type === "IEND")
      return length === 0 && imageData && end === bytes.length;
    offset = end;
  }
  return false;
}
