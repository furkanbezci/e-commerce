import api from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = req.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: wishlists } = await api.get(`/wishlists?userId=${session}`);
        const userWishlist = wishlists.find(wishlist => wishlist.userId === session);
        
        return NextResponse.json({ 
            success: true, 
            wishlist: userWishlist ? userWishlist.items : [] 
        });
    } catch (err) {
        console.log('Wishlist GET error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = req.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { product } = await req.json();
        if (!product) {
            return NextResponse.json({ error: 'Product is required' }, { status: 400 });
        }


        const { data: wishlists } = await api.get(`/wishlists?userId=${session}`);
        let userWishlist = wishlists.find(wishlist => wishlist.userId === session);

        if (!userWishlist) {

            const newWishlist = {
                userId: session,
                items: [product]
            };
            const { data: createdWishlist } = await api.post('/wishlists', newWishlist);
            return NextResponse.json({ success: true, wishlist: createdWishlist.items });
        }


        const existingItem = userWishlist.items.find(item => item.id === product.id);
        if (existingItem) {
            return NextResponse.json({ success: true, wishlist: userWishlist.items });
        }


        userWishlist.items.push(product);


        const { data: updatedWishlist } = await api.put(`/wishlists/${userWishlist.id}`, userWishlist);
        return NextResponse.json({ success: true, wishlist: updatedWishlist.items });

    } catch (err) {
        console.log('Wishlist POST error:', err);
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

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }


        const { data: wishlists } = await api.get(`/wishlists?userId=${session}`);
        const userWishlist = wishlists.find(wishlist => wishlist.userId === session);

        if (!userWishlist) {
            return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
        }


        userWishlist.items = userWishlist.items.filter(item => item.id !== productId);


        const { data: updatedWishlist } = await api.put(`/wishlists/${userWishlist.id}`, userWishlist);
        return NextResponse.json({ success: true, wishlist: updatedWishlist.items });

    } catch (err) {
        console.log('Wishlist DELETE error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
