import api from "@/lib/api";
import { NextResponse } from "next/server";


export async function GET(req) {
    try {
        const session = req.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: orders } = await api.get(`/orders?userId=${session}`);
        
        return NextResponse.json({ 
            success: true, 
            orders: orders || [] 
        });
    } catch (err) {
        console.log('Orders GET error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}


export async function POST(req) {
    try {
        const session = req.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orderData = await req.json();
        
        
        const newOrder = {
            userId: session,
            date: new Date().toISOString(),
            items: orderData.items || [],
            total: orderData.total || 0,
            status: orderData.status || 'Hazırlanıyor',
            shippingAddress: orderData.shippingAddress || {},
            paymentMethod: orderData.paymentMethod || 'credit'
        };

        
        const { data: createdOrder } = await api.post('/orders', newOrder);
        
        return NextResponse.json({ 
            success: true, 
            orderId: createdOrder.id,
            order: createdOrder 
        });

    } catch (err) {
        console.log('Orders POST error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
