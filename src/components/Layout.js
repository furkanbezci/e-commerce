import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export default function Layout({ children, showHeader = true, showFooter = true }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {showHeader && <Header />}
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
