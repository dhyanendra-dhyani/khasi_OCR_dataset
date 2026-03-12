import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Public routes that don't require auth
    const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
    const isPublic = publicRoutes.some(route => path === route);

    // If not authenticated and trying to access protected route
    if (!user && !isPublic) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', path);
        return NextResponse.redirect(url);
    }

    // If authenticated and trying to access auth pages
    if (user && (path === '/login' || path === '/signup')) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
