"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, ChevronUp, Leaf, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";

const fallbackProducts = [
  { id: 1, title: "Morning Ritual Set", description: "A calm three-piece reset for your everyday start.", price: 1290, image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85" },
  { id: 2, title: "Linen Carryall", description: "Roomy, structured and ready for the everyday commute.", price: 890, image_url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=85" },
  { id: 3, title: "Soft Form Candle", description: "Warm cedar, amber and a slow evening in one small vessel.", price: 690, image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85" },
  { id: 4, title: "Desk Reset Kit", description: "Small tools for a cleaner desk and a clearer head.", price: 1590, image_url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85" }
];

const formatPrice = (value) => `৳${Number(value).toLocaleString("en-BD")}`;
const DELIVERY_FEES = { city: 60, outside: 120 };

export default function Storefront({ products = fallbackProducts }) {
  const [catalog, setCatalog] = useState(products.length ? products : fallbackProducts);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState("city");
  const [order, setOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((liveProducts) => {
        if (Array.isArray(liveProducts) && liveProducts.length) setCatalog(liveProducts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("add");
    if (!productId) return;

    const product = catalog.find((item) => String(item.id) === productId);
    if (!product) return;

    updateCart(product, 1);
    setIsCartOpen(params.get("buy") === "1");
    window.history.replaceState({}, "", "/");
  }, [catalog]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length ? DELIVERY_FEES[deliveryZone] : 0;
  const total = subtotal + deliveryFee;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function updateCart(product, change) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (!existing && change > 0) return [...current, { ...product, quantity: 1 }];
      return current
        .map((item) => item.id === product.id ? { ...item, quantity: item.quantity + change } : item)
        .filter((item) => item.quantity > 0);
    });
  }

  function buyNow(product) {
    updateCart(product, 1);
    setIsCartOpen(true);
  }

  async function submitOrder(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      customerName: form.get("customerName"),
      phoneNumber: form.get("phoneNumber"),
      address: form.get("address"),
      cartItems: cart.map(({ id, title, price, quantity }) => ({ id, title, price, quantity })),
      totalPrice: total,
      paymentMethod: "Cash on Delivery"
    };

    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to place your order.");
      setOrder({ ...result.order, items: cart, total });
      setCart([]);
      setIsCartOpen(false);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function refreshProducts() {
    setNotice("Refreshing the collection...");
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const nextProducts = await response.json();
      setCatalog(nextProducts);
      setNotice("Collection updated.");
    } catch {
      setNotice("Showing the latest saved collection.");
    }
    setTimeout(() => setNotice(""), 2500);
  }

  if (order) {
    return <ThankYou order={order} onContinue={() => setOrder(null)} />;
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Nook home"><span className="brand-mark">N</span><span>nook<span className="brand-dot">.</span></span></a>
        <button className="cart-button" onClick={() => setIsCartOpen(true)} aria-label={`Open cart with ${itemCount} items`}><ShoppingBag size={18} /><span>Bag</span>{itemCount > 0 && <b>{itemCount}</b>}</button>
      </header>

      <section id="top" className="hero-section">
        <div className="hero-copy"><p className="eyebrow">A little better, every day</p><h1>Keep good things <em>close.</em></h1><p className="hero-text">Thoughtfully chosen objects for the rituals that make your day feel like yours.</p><a className="hero-link" href="#collection">Shop the collection <ArrowRight size={16} /></a></div>
        <div className="hero-art"><div className="hero-art-label"><Leaf size={15} /> made for slow moments</div></div>
      </section>

      <section className="trust-row"><div><Truck size={18} /><span>Nationwide delivery</span></div><div><Check size={18} /><span>Quality, always</span></div><div><ShoppingBag size={18} /><span>Cash on delivery</span></div></section>

      <section id="collection" className="collection-section">
        <div className="section-heading"><div><p className="eyebrow">The collection</p><h2>Things worth making room for.</h2></div><button className="refresh-link" onClick={refreshProducts}>Updated from store <ArrowRight size={14} /></button></div>
        {notice && <p className="notice" role="status">{notice}</p>}
        <div className="product-grid">{catalog.map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={() => updateCart(product, 1)} onBuy={() => buyNow(product)} />)}</div>
      </section>

      <footer className="site-footer"><div><a className="brand" href="#top"><span className="brand-mark">N</span><span>nook<span className="brand-dot">.</span></span></a><p>Small things, beautifully chosen.</p></div><span>© 2026 Nook Studio</span></footer>
      {isCartOpen && <CartDrawer cart={cart} subtotal={subtotal} deliveryFee={deliveryFee} total={total} deliveryZone={deliveryZone} setDeliveryZone={setDeliveryZone} onUpdate={updateCart} onClose={() => setIsCartOpen(false)} onSubmit={submitOrder} isSubmitting={isSubmitting} error={error} />}
    </main>
  );
}

function ProductCard({ product, index, onAdd, onBuy }) {
  return <article className={`product-card card-delay-${index}`}><Link className="product-detail-link" href={`/products/${product.id}`} aria-label={`View details for ${product.title}`}><div className="product-image"><img src={product.image_url} alt={product.title} loading={index > 1 ? "lazy" : "eager"} /><span className="product-number">0{index + 1}</span></div><div className="product-info"><div><h3>{product.title}</h3><p>{product.description}</p></div><strong>{formatPrice(product.price)}</strong></div></Link><div className="product-actions"><button className="add-button" onClick={onAdd}><Plus size={16} /> Add to bag</button><button className="buy-button" onClick={onBuy}>Buy now <ArrowRight size={15} /></button></div></article>;
}

function CartDrawer({ cart, subtotal, deliveryFee, total, deliveryZone, setDeliveryZone, onUpdate, onClose, onSubmit, isSubmitting, error }) {
  return <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="cart-drawer" aria-label="Shopping bag"><div className="drawer-header"><div><p className="eyebrow">Your selection</p><h2>Your bag <span>({cart.length})</span></h2></div><button className="icon-button" onClick={onClose} aria-label="Close shopping bag"><X size={20} /></button></div>{cart.length === 0 ? <div className="empty-bag"><ShoppingBag size={28} /><p>Your bag is waiting for something lovely.</p><button onClick={onClose}>Browse collection <ArrowRight size={15} /></button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image_url} alt="" /><div className="cart-item-main"><h3>{item.title}</h3><span>{formatPrice(item.price)}</span><div className="quantity-control"><button onClick={() => onUpdate(item, -1)} aria-label={`Remove one ${item.title}`}><Minus size={13} /></button><b>{item.quantity}</b><button onClick={() => onUpdate(item, 1)} aria-label={`Add one ${item.title}`}><Plus size={13} /></button></div></div></div>)}</div><form className="checkout-form" onSubmit={onSubmit}><div className="form-heading"><p className="eyebrow">Almost yours</p><h3>Where should we send it?</h3></div><label>Full name<input name="customerName" type="text" placeholder="Your name" required /></label><label>Mobile number<input name="phoneNumber" type="tel" placeholder="01XXXXXXXXX" required /></label><label>Full delivery address<textarea name="address" placeholder="House, road, area, city" rows="3" required /></label><fieldset><legend>Delivery zone</legend><div className="zone-options"><label className={deliveryZone === "city" ? "selected" : ""}><input type="radio" name="zone" value="city" checked={deliveryZone === "city"} onChange={() => setDeliveryZone("city")} /><span>Inside city <small>{formatPrice(DELIVERY_FEES.city)}</small></span></label><label className={deliveryZone === "outside" ? "selected" : ""}><input type="radio" name="zone" value="outside" checked={deliveryZone === "outside"} onChange={() => setDeliveryZone("outside")} /><span>Outside city <small>{formatPrice(DELIVERY_FEES.outside)}</small></span></label></div></fieldset><div className="payment-choice"><span>Payment method</span><strong>Cash on Delivery <Check size={15} /></strong></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="order-totals"><div><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div><div><span>Delivery</span><b>{formatPrice(deliveryFee)}</b></div><div className="grand-total"><span>Total</span><b>{formatPrice(total)}</b></div></div><button className="place-order" type="submit" disabled={isSubmitting}>{isSubmitting ? "Placing your order..." : "Place COD order"} <ArrowRight size={17} /></button><p className="secure-note">No payment needed now. Pay when your order arrives.</p></form></>}</aside></div>;
}

function ThankYou({ order, onContinue }) {
  return <main className="thank-you"><div className="thank-card"><div className="success-mark"><Check size={28} /></div><p className="eyebrow">Order confirmed</p><h1>Thank you for choosing <em>nook.</em></h1><p className="thank-copy">Your order is on its way to becoming part of your everyday. We&apos;ll call shortly to confirm delivery.</p><div className="confirmation"><span>Confirmation ID</span><strong>#{String(order.id).slice(0, 8).toUpperCase()}</strong></div><div className="thank-summary">{order.items.map((item) => <div key={item.id}><span>{item.quantity} × {item.title}</span><b>{formatPrice(item.price * item.quantity)}</b></div>)}<div className="summary-total"><span>Total paid on delivery</span><strong>{formatPrice(order.total)}</strong></div></div><button className="place-order" onClick={onContinue}>Continue browsing <ArrowRight size={17} /></button></div></main>;
}
