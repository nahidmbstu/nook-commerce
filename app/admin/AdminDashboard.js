"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, LogOut, RefreshCw, ShoppingBag } from "lucide-react";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const formatPrice = (value) => `৳${Number(value).toLocaleString("en-BD")}`;
const formatDate = (value) => new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function AdminDashboard({ email }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function loadOrders() {
    setIsLoading(true);
    const response = await fetch("/api/admin/orders", { cache: "no-store" });
    if (response.ok) setOrders(await response.json());
    else setNotice("Your session may have expired. Please sign in again.");
    setIsLoading(false);
  }

  useEffect(() => { loadOrders(); }, []);

  async function updateStatus(id, status) {
    const response = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (response.ok) {
      setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
      setNotice("Order status updated.");
      setTimeout(() => setNotice(""), 2500);
    } else setNotice("Could not update this order.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return <main className="admin-page"><header className="admin-header"><Link className="brand" href="/"><span className="brand-mark">N</span><span>nook<span className="brand-dot">.</span></span></Link><div className="admin-header-actions"><span>{email}</span><button onClick={loadOrders} aria-label="Refresh orders" title="Refresh orders"><RefreshCw size={16} /></button><button onClick={logout} aria-label="Log out" title="Log out"><LogOut size={16} /></button></div></header><section className="admin-content"><div className="admin-title-row"><div><p className="eyebrow">Operations</p><h1>Orders <span>{orders.length}</span></h1><p className="admin-muted">Review deliveries and keep customers moving.</p></div><Link href="/" className="admin-store-link">View storefront <ArrowUpRight size={15} /></Link></div>{notice && <p className="admin-notice">{notice}</p>}{isLoading ? <div className="admin-empty">Loading orders...</div> : orders.length === 0 ? <div className="admin-empty"><ShoppingBag size={28} /><p>No orders yet.</p></div> : <div className="orders-table-wrap"><table className="orders-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Created</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>#{order.id.slice(0, 8).toUpperCase()}</strong><small>{order.payment_method}</small></td><td><strong>{order.customer_name}</strong><small>{order.phone_number}</small><small>{order.address}</small></td><td><div className="order-items">{(order.cart_items || []).map((item) => <span key={`${order.id}-${item.id}`}>{item.quantity} × {item.title}</span>)}</div></td><td><strong>{formatPrice(order.total_price)}</strong></td><td><select className={`status-select status-${order.status}`} value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td><small>{formatDate(order.created_at)}</small></td></tr>)}</tbody></table></div>}</section></main>;
}
