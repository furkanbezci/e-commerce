import api from "@/lib/api";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
    try {
        const session = req.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orderId = params.id;
        
        
        const { data: order } = await api.get(`/orders/${orderId}`);
        
        
        if (order.userId !== session) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        
        return NextResponse.json({ 
            success: true, 
            order: order 
        });
    } catch (err) {
        console.log('Order GET error:', err);
        if (err.response?.status === 404) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}


export async function DELETE(req, { params }) {
    try {
        const session = req.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orderId = params.id;
        
        
        const { data: order } = await api.get(`/orders/${orderId}`);
        
        
        if (order.userId !== session) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        
        if (order.status !== 'Hazırlanıyor' && order.status !== 'pending') {
            return NextResponse.json({ error: 'Bu sipariş iptal edilemez' }, { status: 400 });
        }
        
        
        const updatedOrder = { ...order, status: 'Iptal Edildi' };
        await api.put(`/orders/${orderId}`, updatedOrder);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Sipariş iptal edildi' 
        });
    } catch (err) {
        console.log('Order DELETE error:', err);
        if (err.response?.status === 404) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
