import api from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }


        const { data: users } = await api.get(`/users?email=${email}`);
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }


        const sessionId = user.id;
        
        const response = NextResponse.json({ success: true });
        response.cookies.set('session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        });

        return response;
    } catch (err) {
        console.log('Login error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
