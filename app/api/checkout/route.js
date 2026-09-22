import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character]));

async function notifyAdmin({ orderId, customerName, phoneNumber, address, cartItems, totalPrice, paymentMethod }) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromEmail = process.env.FROM_EMAIL;

  if (!apiKey || !adminEmail || !fromEmail) {
    console.warn("Order email skipped: RESEND_API_KEY, ADMIN_EMAIL, or FROM_EMAIL is missing.");
    return;
  }

  const itemsHtml = cartItems.map((item) => `<li>${escapeHtml(item.quantity)} x ${escapeHtml(item.title)} - ৳${Number(item.price * item.quantity).toLocaleString("en-BD")}</li>`).join("");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: [adminEmail],
      subject: `New COD order #${orderId.slice(0, 8).toUpperCase()} - ৳${Number(totalPrice).toLocaleString("en-BD")}`,
      html: `<h2>New Nook order</h2><p><strong>Order:</strong> #${orderId.slice(0, 8).toUpperCase()}</p><p><strong>Customer:</strong> ${escapeHtml(customerName)}<br><strong>Phone:</strong> ${escapeHtml(phoneNumber)}<br><strong>Address:</strong> ${escapeHtml(address)}<br><strong>Payment:</strong> ${escapeHtml(paymentMethod || "Cash on Delivery")}</p><h3>Items</h3><ul>${itemsHtml}</ul><p><strong>Total:</strong> ৳${Number(totalPrice).toLocaleString("en-BD")}</p>`
    })
  });

  if (!response.ok) throw new Error(`Resend returned ${response.status}`);
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { customerName, phoneNumber, address, cartItems, totalPrice, paymentMethod } = payload;

    if (!customerName || !phoneNumber || !address || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Please complete your delivery details and add at least one item." }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured. Add your project keys and try again." }, { status: 503 });
    }

    const orderId = crypto.randomUUID();
    const { error } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        customer_name: customerName.trim(),
        phone_number: phoneNumber.trim(),
        address: address.trim(),
        cart_items: cartItems,
        total_price: Number(totalPrice),
        payment_method: paymentMethod || "Cash on Delivery",
        status: "pending"
      });

    if (error) {
      console.error("Checkout insert failed:", error);
      return NextResponse.json({ error: "We could not place your order. Please try again." }, { status: 500 });
    }

    try {
      await notifyAdmin({ orderId, customerName, phoneNumber, address, cartItems, totalPrice, paymentMethod });
    } catch (emailError) {
      console.error("Order email failed:", emailError);
    }

    return NextResponse.json({ success: true, order: { id: orderId } }, { status: 201 });
  } catch (error) {
    console.error("Checkout request failed:", error);
    return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
  }
}
