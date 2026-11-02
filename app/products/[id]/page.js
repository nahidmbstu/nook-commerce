import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ShoppingBag, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { seedProducts } from "@/lib/catalog";

const formatPrice = (value) => `৳${Number(value).toLocaleString("en-BD")}`;

async function getProduct(id) {
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, description, price, image_url, is_available")
      .eq("id", id)
      .eq("is_available", true)
      .maybeSingle();
    if (error) console.error(`Product ${id} query failed:`, error.message || error);
    if (data) return data;
  }
  return seedProducts.find((product) => String(product.id) === String(id));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  return product
    ? { title: `${product.title} | Labonno Maya`, description: product.description, openGraph: { title: `${product.title} | Labonno Maya`, description: product.description, images: [product.image_url] } }
    : { title: "Product not found | Labonno Maya" };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return <main className="product-detail-page">
    <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">L</span><span>Labonno Maya</span></Link><Link className="cart-button" href="/#collection"><ShoppingBag size={18} /><span>Shop collection</span></Link></header>
    <section className="product-detail">
      <Link className="back-link" href="/#collection"><ArrowLeft size={16} /> Back to collection</Link>
      <div className="product-detail-grid">
        <div className="product-detail-image"><img src={product.image_url} alt={product.title} /></div>
        <div className="product-detail-copy"><p className="eyebrow">A considered choice</p><h1>{product.title}</h1><strong className="detail-price">{formatPrice(product.price)}</strong><p className="detail-description">{product.description}</p><div className="detail-perks"><div><Truck size={18} /><span>Nationwide home delivery</span></div><div><Check size={18} /><span>Cash on delivery available</span></div></div><div className="detail-actions"><Link className="add-button detail-button" href={`/?add=${product.id}#collection`}>Add to bag</Link><Link className="buy-button detail-button" href={`/?add=${product.id}&buy=1#collection`}>Buy now <ArrowRight size={17} /></Link></div><p className="detail-note">Delivery from ৳60 inside city and ৳120 outside city.</p></div>
      </div>
    </section>
  </main>;
}
