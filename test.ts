import { jwtDecrypt } from "jose";
import { TextEncoder } from "util";

export async function decryptNextAuthToken(token: string) {
  const base64Secret = "85W78vH6+6LmTrbDBscXsfVaiRxJTQQka45x0PsItIg=";

  // ✅ decode base64 → 32 bytes
  const key = Buffer.from(base64Secret, "base64");

  const { payload, protectedHeader } = await jwtDecrypt(token, key);

  return {
    header: protectedHeader,
    payload,
  };
}
await decryptNextAuthToken(
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..N1TxT5PbusXnVF4v._ABypFHmJF68FQFHqL6gZU5OG2IqGX3d0kjFkqC1sporaBWJJ3wKtNkV8ai7ZTYRtmh41hgUC6uYV5ao-Tg1wBI5KiiCO8a-F7Yv00ygmbB2648g_GlsQw41lO003-pUP79WTe5tgFpBadSWxbj1JAlUXLriuJNJ10vgjX9KfervaT49cvsPypeXLOjZLO0poZK06hS2g7Io89txH9Db4C12WUgFy8v0W-GFsqxctCeLD9oFkfd_SDyBf6ej0DDGP6bwuDvidDXG9It1x0-w0Iy3I6uGmcsbtTJSETfmR_how6m_2srfI9SzPC42XnsEHtF0qIMcGikDJzYoV-JztYLzmqDy3aJthyghtEKTok2Y8w9ajntCNS2ImZ6sDxI_CuswlUYa22HiU9FIMuU8UoyHzfvqj-REvhbsr0Cq-2R6oAjuAmbGKG8alw4dEOIv2n9XLCxTfx9FBfMvnUUJyRUbePHhznYaVingmBQV7NJzKiT_rPsU0-QJBQ8zCLx63vTcWWmqS71LQmQ86a-jm2ru0mCDNeTHuL2nArusQsBvJPvpIbi8VCbg-5bEkBJmJTYcsNJyVWDAh8ANNvoTGPuhdnsnxzsAXuonAWeu8HouAayH6yGDkDurTMiHGpuZPuxCVwzSXUmz6kzftZFSBZNeKHyMCZJIjIxX1nNXX0fHXiKN8Soru5yayAwPa8dRcwadTE5_z8dDDfv4JiNoVLP7h6E8D7Dk-V1rXrfgi890B2FRedcNi8PHcSEEqm0twhdPyQXhxHahEJSCs9s3bG7-1ch_f0cGtF-7Z3ngLvi0lv9BoI9yn5XHb50QleoT2VNiXT7ZvG3YpMAC7CP9k98.tWDtfAWZoeuvJfMeUyM3iw"
);
