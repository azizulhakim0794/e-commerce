import { Product } from "@/types/product";

export const products: Product[] = [
    { id: 1, name: "AeroFlex Headphones", description: "Immersive wireless audio with adaptive noise cancellation.", price: 129, originalPrice: 169, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", category: "Electronics", rating: 4.8, reviews: 238, stock: 18, badge: "Best seller", specs: ["40-hour battery", "Adaptive ANC", "Multipoint Bluetooth"] },
    { id: 2, name: "Everyday Carry Pack", description: "A weather-ready daypack designed for work and weekends.", price: 84, originalPrice: 110, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85", category: "Accessories", rating: 4.7, reviews: 114, stock: 24, badge: "New", specs: ["20L capacity", "Recycled nylon", "Padded laptop sleeve"] },
    { id: 3, name: "Linen Overshirt", description: "Relaxed, breathable layering in a soft washed linen blend.", price: 68, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80", category: "Clothing", rating: 4.6, reviews: 86, stock: 31, specs: ["55% linen blend", "Relaxed fit", "Machine washable"] },
    { id: 4, name: "Cloudstep Runner", description: "Lightweight everyday trainers with responsive cushioning.", price: 112, originalPrice: 140, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", category: "Shoes", rating: 4.9, reviews: 305, stock: 12, badge: "Limited", specs: ["Foam comfort midsole", "Breathable mesh", "Reflective details"] },
    { id: 5, name: "Ceramic Pour-Over Set", description: "A calm morning ritual, complete with dripper and carafe.", price: 46, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85", category: "Home & Living", rating: 4.5, reviews: 71, stock: 40, specs: ["Heat-safe ceramic", "600ml carafe", "Reusable filter"] },
    { id: 6, name: "Everyday SPF Serum", description: "Lightweight hydration and broad-spectrum protection in one step.", price: 32, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85", category: "Beauty", rating: 4.8, reviews: 192, stock: 27, badge: "Clean formula", specs: ["SPF 40", "Fragrance free", "50ml bottle"] },
    { id: 7, name: "Trail Bottle 750", description: "Insulated stainless steel bottle for long days outside.", price: 28, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85", category: "Sports", rating: 4.7, reviews: 64, stock: 52, specs: ["24-hour cold", "BPA free", "Leakproof lid"] },
    { id: 8, name: "Studio Desk Lamp", description: "Focused, warm light with a tactile dimmer for your desk.", price: 58, originalPrice: 75, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85", category: "Home & Living", rating: 4.4, reviews: 49, stock: 9, specs: ["Dimmable LED", "USB-C charging", "Warm to cool light"] },
    { id: 9, name: "Field Watch", description: "A crisp, durable timepiece with a quietly confident profile.", price: 146, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85", category: "Accessories", rating: 4.6, reviews: 38, stock: 14, specs: ["Quartz movement", "Water resistant", "Italian leather strap"] },
    { id: 10, name: "Merino Crew Knit", description: "A fine-gauge merino layer that works across the seasons.", price: 96, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85", category: "Clothing", rating: 4.7, reviews: 52, stock: 20, specs: ["100% merino wool", "Naturally breathable", "Regular fit"] },
    { id: 11, name: "Focus Mechanical Keys", description: "A compact mechanical keyboard for deep work and play.", price: 119, originalPrice: 149, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85", category: "Electronics", rating: 4.8, reviews: 177, stock: 16, badge: "Popular", specs: ["Hot-swappable", "Bluetooth + USB-C", "75% layout"] },
    { id: 12, name: "Form Yoga Mat", description: "A grippy, cushioned surface for movement at home or studio.", price: 42, image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=85", category: "Sports", rating: 4.5, reviews: 91, stock: 33, specs: ["6mm cushioning", "Natural rubber", "Carry strap"] },
];

export const categories = [
    { name: "Electronics", icon: "⌁", color: "bg-teal-100 text-teal-800" },
    { name: "Clothing", icon: "◒", color: "bg-amber-100 text-amber-900" },
    { name: "Shoes", icon: "⌁", color: "bg-rose-100 text-rose-800" },
    { name: "Accessories", icon: "◇", color: "bg-sky-100 text-sky-800" },
    { name: "Home & Living", icon: "⌂", color: "bg-lime-100 text-lime-900" },
    { name: "Beauty", icon: "✦", color: "bg-fuchsia-100 text-fuchsia-800" },
    { name: "Sports", icon: "＋", color: "bg-orange-100 text-orange-800" },
];

export function getProduct(id: number) {
    return products.find((product) => product.id === id);
}