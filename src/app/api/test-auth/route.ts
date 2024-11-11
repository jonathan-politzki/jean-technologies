import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Testing auth configuration`);

    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Test database connection
        const { data: dbTest, error: dbError } = await supabase
            .from('social_profiles')
            .select('count')
            .limit(0);
            
        // Get auth settings
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Check environment variables
        const config = {
            base_url: process.env.NEXT_PUBLIC_BASE_URL,
            supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
            providers: {
                linkedin: {
                    client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ? 'configured' : 'missing',
                    client_secret: process.env.LINKEDIN_CLIENT_SECRET ? 'configured' : 'missing',
                    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
                },
                google: {
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'configured' : 'missing',
                    client_secret: process.env.GOOGLE_CLIENT_SECRET ? 'configured' : 'missing'
                }
            }
        };

        console.log(`[${timestamp}] Auth test results:`, {
            dbConnection: dbError ? 'failed' : 'success',
            sessionCheck: sessionError ? 'failed' : 'success',
            config
        });

        return NextResponse.json({
            timestamp,
            status: 'success',
            config,
            database: {
                connected: !dbError,
                error: dbError ? dbError.message : null
            },
            session: {
                exists: !!session,
                error: sessionError ? sessionError.message : null
            }
        });
    } catch (error) {
        console.error(`[${timestamp}] Auth test error:`, error);
        return NextResponse.json({ 
            timestamp,
            status: 'error',
            error: String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { 
            status: 500 
        });
    }
}
