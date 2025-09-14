import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">softMarket</h3>
            <p className="text-gray-400">
              Kaliteli ürünler ve güvenli alışveriş deneyimi için buradayız.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-gray-400 hover:text-white">Ürünler</Link></li>
              <li><Link href="/cart" className="text-gray-400 hover:text-white">Sepet</Link></li>
              <li><Link href="/wishlist" className="text-gray-400 hover:text-white">Favoriler</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Hesap</h4>
            <ul className="space-y-2">
              <li><Link href="/auth/login" className="text-gray-400 hover:text-white">Giriş Yap</Link></li>
              <li><Link href="/auth/signup" className="text-gray-400 hover:text-white">Kayıt Ol</Link></li>
              <li><Link href="/profile" className="text-gray-400 hover:text-white">Profil</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <p className="text-gray-400">Sorularınız için bizimle iletişime geçin.</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 softMarket. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
