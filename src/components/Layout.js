import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";

export default function Layout({ children, showHeader = true, showFooter = true }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {showHeader && <Header />}
      <main>
      <Suspense fallback={<div>Yükleniyor...</div>}>
          {children}
        </Suspense>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
