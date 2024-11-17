import * as z from "zod";

type SomeBuffer = Buffer | ArrayBuffer | SharedArrayBuffer | ArrayBufferView;

export const isSomeBuffer = (v: unknown): v is SomeBuffer =>
  Buffer.isBuffer(v) ||
  v instanceof ArrayBuffer ||
  v instanceof SharedArrayBuffer ||
  ArrayBuffer.isView(v);

export const someBufferSchema = z.custom<SomeBuffer>(isSomeBuffer);

export const toNodeBuffer = (buf: SomeBuffer): Buffer => {
  if (Buffer.isBuffer(buf)) return buf;

  if (buf instanceof ArrayBuffer || buf instanceof SharedArrayBuffer)
    return Buffer.from(buf);

  return Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
};
