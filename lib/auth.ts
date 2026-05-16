/**
 * JWT 认证工具
 * 使用 jose 库，兼容 Edge Runtime
 * 
 * JWT Token 结构:
 * - sub: 用户ID (Supabase users表中的id)
 * - phone: 用户手机号
 * - nickname: 用户昵称
 * - free_count: 免费次数
 * - exp: 过期时间 (7天)
 */

import { SignJWT, jwtVerify, JWTPayload } from 'jose';

// JWT密钥，从环境变量获取
const getSecretKey = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // 默认密钥（仅用于开发，生产环境必须设置）
    console.warn('JWT_SECRET not set, using default secret (development only)');
    return new TextEncoder().encode('itsmebook-default-secret-key-2024');
  }
  return new TextEncoder().encode(secret);
};

// Token过期时间（7天）
const TOKEN_EXPIRY = '7d';

// Token有效载荷接口
export interface TokenPayload extends JWTPayload {
  sub: string;      // 用户ID
  phone: string;    // 手机号
  nickname?: string; // 昵称
  freeCount: number; // 免费次数
}

/**
 * 签发JWT Token
 */
export async function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = getSecretKey();
  
  const token = await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);
  
  return token;
}

/**
 * 验证JWT Token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * 从请求头中提取Token
 */
export function extractTokenFromHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * 获取当前用户信息（从Token中）
 */
export async function getCurrentUser(request: Request): Promise<TokenPayload | null> {
  const token = extractTokenFromHeader(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

/**
 * 生成安全的随机字符串
 */
export function generateSecureRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}
