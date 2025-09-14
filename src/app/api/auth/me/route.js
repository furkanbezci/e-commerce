import { cookies } from "next/headers";
import api from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session")?.value;

        if (!session) {
            return NextResponse.json({ user: null });
        }

        const { data: user } = await api.get(`/users/${session}`);
        
        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.log('Auth check error:', error);
        return NextResponse.json({ user: null });
    }
}
