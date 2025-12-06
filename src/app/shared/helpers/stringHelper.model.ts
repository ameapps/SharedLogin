export function generateUUIDv4(): string {
  // genera 16 byte random con Math.random
  const bytes = new Array<number>(16).fill(0).map(() => Math.floor(Math.random() * 256));

  // imposta i bit versione e variante (UUID v4)
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // versione 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC 4122

  const hex = bytes.map(b => b.toString(16).padStart(2, "0")).join("");

  return (
    hex.substring(0, 8) + "-" +
    hex.substring(8, 12) + "-" +
    hex.substring(12, 16) + "-" +
    hex.substring(16, 20) + "-" +
    hex.substring(20)
  );
}
