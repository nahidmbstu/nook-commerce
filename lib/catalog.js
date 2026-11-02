// Local seed catalog, kept in sync with supabase/schema.sql.
// Used as a fallback when the database is unavailable so the storefront stays browsable.
export const seedProducts = [
  { id: 1, title: "Morning Ritual Set", description: "A calm three-piece reset for your everyday start.", price: 1290, image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=88" },
  { id: 2, title: "Linen Carryall", description: "Roomy, structured and ready for the everyday commute.", price: 890, image_url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=88" },
  { id: 3, title: "Soft Form Candle", description: "Warm cedar, amber and a slow evening in one small vessel.", price: 690, image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=88" },
  { id: 4, title: "Desk Reset Kit", description: "Small tools for a cleaner desk and a clearer head.", price: 1590, image_url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=88" }
];
