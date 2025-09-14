import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "./_components/ProfileClient";
import jsonServerApi, { nextApi } from "@/lib/api";

async function getData(userId) {
  const userRes = await jsonServerApi.get(`/users/${userId}`);
  
  const ordersRes = await nextApi.get('/api/orders', {
    headers: {
      'Cookie': `session=${userId}`
    }
  });

  if (userRes.status !== 200) throw new Error("Kullanıcı bilgileri alınamadı");
  if (ordersRes.status !== 200) throw new Error("Sipariş bilgileri alınamadı");

  const user = userRes.data;
  const ordersData = ordersRes.data;
  return { user, orders: ordersData.orders || [] };
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/auth/login?redirect=/profile");
  }

  const userId = session;

  try {
    const { user, orders } = await getData(userId);
    if (!user) {
      redirect("/auth/login?redirect=/profile");
    }
    return <ProfileClient user={user} orders={orders || []} />;
  } catch (e) {
    console.log('Profile error:', e);
    redirect("/auth/login?redirect=/profile");
  }
}
