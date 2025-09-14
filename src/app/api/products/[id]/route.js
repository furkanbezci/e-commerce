import api from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const { data: product } = await api.get(`/products/${params.id}`);
        return NextResponse.json(product);
    } catch (err) {
        console.log('Product GET error:', err);
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
}
