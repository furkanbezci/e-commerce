import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const response = NextResponse.json({ 
            success: true, 
            message: 'Çıkış yapıldı' 
        });
        
        response.cookies.set('session', '', {
            httpOnly: true,
            path: '/',
            maxAge: 0 
        });
        
        return response;
    } catch (err) {
        console.log('Logout error:', err);
        return NextResponse.json({ 
            error: 'Çıkış yapılamadı' 
        }, { status: 500 });
    }
}
