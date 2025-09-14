import api from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = req.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: carts } = await api.get(`/carts?userId=${session}`);
        const userCart = carts.find(cart => cart.userId === session);
        
        return NextResponse.json({ 
            success: true, 
            cart: userCart ? userCart.items : [] 
        });
    } catch (err) {
        console.log('Cart GET error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = req.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { product, quantity = 1 } = await req.json();
        if (!product) {
            return NextResponse.json({ error: 'Product is required' }, { status: 400 });
        }

        const { data: carts } = await api.get(`/carts?userId=${session}`);
        let userCart = carts.find(cart => cart.userId === session);

        if (!userCart) {
            const newCart = {
                userId: session,
                items: [{ ...product, quantity }]
            };
            const { data: createdCart } = await api.post('/carts', newCart);
            return NextResponse.json({ success: true, cart: createdCart.items });
        }

        const existingItemIndex = userCart.items.findIndex(item => item.id === product.id);
        
        if (existingItemIndex >= 0) {
            userCart.items[existingItemIndex].quantity += quantity;
        } else {
            userCart.items.push({ ...product, quantity });
        }

        const { data: updatedCart } = await api.put(`/carts/${userCart.id}`, userCart);
        return NextResponse.json({ success: true, cart: updatedCart.items });

    } catch (err) {
        console.log('Cart POST error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = req.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, quantity } = await req.json();
        if (!productId || quantity < 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const { data: carts } = await api.get(`/carts?userId=${session}`);
        const userCart = carts.find(cart => cart.userId === session);

        if (!userCart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        if (quantity === 0) {
            userCart.items = userCart.items.filter(item => item.id !== productId);
        } else {
            const itemIndex = userCart.items.findIndex(item => item.id === productId);
            if (itemIndex >= 0) {
                userCart.items[itemIndex].quantity = quantity;
            }
        }

        const { data: updatedCart } = await api.put(`/carts/${userCart.id}`, userCart);
        return NextResponse.json({ success: true, cart: updatedCart.items });

    } catch (err) {
        console.log('Cart PUT error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = req.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        const { data: carts } = await api.get(`/carts?userId=${session}`);
        const userCart = carts.find(cart => cart.userId === session);

        if (!userCart) {
            return NextResponse.json({ success: true, cart: [] });
        }

        if (productId) {
            userCart.items = userCart.items.filter(item => item.id !== productId);
        } else {
            userCart.items = [];
        }

        const { data: updatedCart } = await api.put(`/carts/${userCart.id}`, userCart);
        return NextResponse.json({ success: true, cart: updatedCart.items });

    } catch (err) {
        console.log('Cart DELETE error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
