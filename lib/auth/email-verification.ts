import crypto from "crypto";
import { createClient } from "redis";
import { redis as redisConfig } from "@/config";

// Redis 클라이언트 생성
const redisClient = createClient({
  url: redisConfig.password
    ? `redis://${redisConfig.user}:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}`
    : `redis://${redisConfig.host}:${redisConfig.port}`,
});

// Redis 연결
redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.connect().catch(console.error);

// 토큰 만료 시간 (초 단위): 24시간 = 86400초
const TOKEN_EXPIRY = 24 * 60 * 60;

/**
 * 이메일 인증 토큰 생성
 * @param email 사용자 이메일
 * @returns 생성된 토큰
 */
export async function createVerificationToken(email: string): Promise<string> {
  // 랜덤 토큰 생성 (32바이트 = 64자 hex)
  const token = crypto.randomBytes(32).toString("hex");

  // Redis 키 형식: email_verify:{token}
  const key = `email_verify:${token}`;

  // Redis에 토큰 저장 (24시간 후 자동 만료)
  await redisClient.setEx(key, TOKEN_EXPIRY, email);

  return token;
}

/**
 * 이메일 인증 토큰 검증 및 사용
 * @param token 검증할 토큰
 * @returns 검증된 이메일 주소 또는 null
 */
export async function verifyToken(token: string): Promise<string | null> {
  const key = `email_verify:${token}`;

  // Redis에서 토큰 조회
  const email = await redisClient.get(key);

  if (!email) {
    return null; // 토큰이 없거나 만료됨
  }

  // 토큰 사용 후 삭제 (일회용)
  await redisClient.del(key);

  return email; // 이메일 반환
}

/**
 * Redis 연결 종료 (애플리케이션 종료 시 호출)
 */
export async function disconnectRedis() {
  await redisClient.quit();
}
