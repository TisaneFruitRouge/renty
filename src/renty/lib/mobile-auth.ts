import { prisma } from "@/prisma/db";
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function generateTokens(tenantId: string) {
    const accessToken = jwt.sign({ tenantId }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ tenantId }, JWT_SECRET, { expiresIn: '7d' });
    
    await prisma.tenantAuth.update({
      where: { tenantId },
      data: {
        refreshToken,
        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  
    return { accessToken, refreshToken };
}

// Middleware to protect API routes
export function withAuth(handler: (req: NextRequest, tenantId: string) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
      try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
  
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { tenantId: string };
        
        return handler(req, decoded.tenantId);
      } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    };
}
  
