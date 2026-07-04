import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /swagger:
 *   get:
 *     summary: Get Swagger API specification
 *     description: Returns the OpenAPI 3.0 specification in JSON format
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Swagger specification
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}
