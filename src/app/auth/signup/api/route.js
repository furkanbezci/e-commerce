import api from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { email, password, firstName, lastName } = await req.json();

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const { data: existingUsers } = await api.get(`/users?email=${email}`);
        if (existingUsers.length > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const newUser = {
            email,
            password,
            name: {
                firstName,
                lastName
            },
            phone: '',
            address: {
                geolocation: {
                    lat: "0",
                    long: "0"
                },
                city: "",
                street: "",
                number: 0,
                zipcode: ""
            }
        };

        const { data: createdUser } = await api.post('/users', newUser);

        const sessionId = createdUser.id;
        
        const response = NextResponse.json({ success: true, user: createdUser });
        response.cookies.set('session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 gün
        });

        return response;
    } catch (err) {
        console.log('Signup error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
