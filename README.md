# Nook Commerce

A lightweight, mobile-first Next.js storefront for Facebook traffic, COD checkout, and nationwide delivery.

## Setup

1. Install Node.js 20+ and npm.
2. Copy `.env.local.example` to `.env.local`.
3. Add your Supabase URL and anon key.
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Install packages with `npm install`.
6. Start the app with `npm run dev`.

The storefront reads available products from Supabase. If credentials are not configured, it shows the included local catalog so the UI can still be previewed. Orders are inserted by `POST /api/checkout` and default to `pending` with Cash on Delivery.

## Supabase tables

The SQL script creates `products` and `orders`, enables row-level security, permits public reads of available products, and permits order creation for the checkout endpoint. Review the policies before adding authentication or an admin dashboard.

## Delivery fees

Inside City is ৳60 and Outside City is ৳120. Both the checkout total and the order payload include the selected delivery fee.
