import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_SECONDS = 8 * 60 * 60;

function secret() {
  if (!process.env.AUTH_SECRET) {
    throw new Error("Falta la variable de entorno AUTH_SECRET");
  }
  return process.env.AUTH_SECRET;
}

function sign(data) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function crearToken(usuario) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: usuario.id,
      exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verificarToken(token) {
  const [payload, firma] = String(token).split(".");
  if (!payload || !firma) return null;
  const esperada = Buffer.from(sign(payload));
  const recibida = Buffer.from(firma);
  if (
    esperada.length !== recibida.length ||
    !timingSafeEqual(esperada, recibida)
  ) {
    return null;
  }
  const datos = JSON.parse(Buffer.from(payload, "base64url").toString());
  return datos.exp > Date.now() / 1000 ? datos : null;
}
