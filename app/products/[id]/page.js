import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ShoppingBag, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

const fallbackProducts = [
  { id: 1, title: "Morning Ritual Set", description: "A calm three-piece reset for your everyday start.", price: 1290, image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=88" },
  { id: 2, title: "Linen Carryall", description: "Roomy, structured and ready for the everyday commute.", price: 890, image_url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=88" },
  { id: 3, title: "Soft Form Candle", description: "Warm cedar, amber and a slow evening in one small vessel.", price: 690, image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=88" },
  { id: 4, title: "Desk Reset Kit", description: "Small tools for a cleaner desk and a clearer head.", price: 1590, image_url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=88" }
];

const formatPrice = (value) => `৳${Number(value).toLocaleString("en-BD")}`;

async function getProduct(id) {
  if (supabase) {
    const { data } = await supabase
      .from("products")
      .select("id, title, description, price, image_url, is_available")
      .eq("id", id)
      .eq("is_available", true)
      .maybeSingle();
    if (data) return data;
  }
  return fallbackProducts.find((product) => String(product.id) === String(id));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  return product
    ? { title: `${product.title} | Nook`, description: product.description, openGraph: { title: `${product.title} | Nook`, description: product.description, images: [product.image_url] } }
    : { title: "Product not found | Nook" };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return <main className="product-detail-page">
    <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">N</span><span>nook<span className="brand-dot">.</span></span></Link><Link className="cart-button" href="/#collection"><ShoppingBag size={18} /><span>Shop collection</span></Link></header>
    <section className="product-detail">
      <Link className="back-link" href="/#collection"><ArrowLeft size={16} /> Back to collection</Link>
      <div className="product-detail-grid">
        <div className="product-detail-image"><img src={product.image_url} alt={product.title} /></div>
        <div className="product-detail-copy"><p className="eyebrow">A considered choice</p><h1>{product.title}</h1><strong className="detail-price">{formatPrice(product.price)}</strong><p className="detail-description">{product.description}</p><div className="detail-perks"><div><Truck size={18} /><span>Nationwide home delivery</span></div><div><Check size={18} /><span>Cash on delivery available</span></div></div><Link className="place-order detail-cta" href={`/?product=${product.id}#collection`}>Order this piece <ArrowRight size={17} /></Link><p className="detail-note">Delivery from ৳60 inside city and ৳120 outside city.</p></div>
      </div>
    </section>
  </main>;
}
