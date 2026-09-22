import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    return NextResponse.json({ success: true, order: { id: orderId } }, { status: 201 });
  } catch (error) {
    console.error("Checkout request failed:", error);
    return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
  }
}
