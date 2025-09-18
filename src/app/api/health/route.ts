import { NextRequest, NextResponse } from 'next/server'
import { getSystemHealth } from '@/lib/health'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const health = await getSystemHealth()
    
    logger.info({
      health: health.status,
      checks: health.checks.length,
    }, 'Health check requested')
    
    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
    })
  } catch (error) {
    logger.error({ error }, 'Health check failed')
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
