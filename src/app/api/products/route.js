import api from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { data: products } = await api.get('/products');
        return NextResponse.json(products);
    } catch (err) {
        console.log('Products GET error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
