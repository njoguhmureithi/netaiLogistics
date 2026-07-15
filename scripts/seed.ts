import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed admin user
  const adminPasswordHash = await bcrypt.hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "admin@netailogistics.com" },
    update: { role: "admin" },
    create: {
      email: "john@doe.com",
      name: "Admin",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });
  console.log("Admin user seeded");

  // Seed admin user for the business owner
  const ownerHash = await bcrypt.hash("CoreGlow2026!", 12);
  await prisma.user.upsert({
    where: { email: "admin@coreglow.com" },
    update: { role: "admin" },
    create: {
      email: "admin@coreglow.com",
      name: "Netai Admin",
      passwordHash: ownerHash,
      role: "admin",
    },
  });
  console.log("Business admin seeded");

  // Seed categories
  const skincare = await prisma.category.upsert({
    where: { slug: "skincare" },
    update: {},
    create: { name: "Skincare", slug: "skincare", description: "Premium skincare products for radiant, healthy skin" },
  });
  const makeup = await prisma.category.upsert({
    where: { slug: "makeup" },
    update: {},
    create: { name: "Makeup", slug: "makeup", description: "Professional makeup for every occasion" },
  });
  const haircare = await prisma.category.upsert({
    where: { slug: "haircare" },
    update: {},
    create: { name: "Haircare", slug: "haircare", description: "Nourishing haircare for beautiful, healthy hair" },
  });
  console.log("Categories seeded");

  // Seed products
  const products = [
    {
      name: "Luxury Hydrating Moisturizer",
      slug: "luxury-hydrating-moisturizer",
      description: "A rich, deeply hydrating facial cream that locks in moisture for 24 hours. Formulated with hyaluronic acid and vitamin E for plump, dewy skin.",
      price: 3500,
      compareAtPrice: 4200,
      categoryId: skincare.id,
      imageUrl: "https://www.shutterstock.com/shutterstock/photos/2719331295/display_1500/stock-photo-a-luxury-face-cream-in-a-clear-glass-jar-placed-on-a-pure-white-background-the-jar-has-a-2719331295.jpg",
      stockQuantity: 45,
      featured: true,
    },
    {
      name: "Vitamin C Brightening Serum",
      slug: "vitamin-c-brightening-serum",
      description: "Powerful 20% Vitamin C serum that brightens dark spots, evens skin tone, and boosts collagen production. Lightweight, fast-absorbing formula.",
      price: 2800,
      compareAtPrice: null,
      categoryId: skincare.id,
      imageUrl: "https://www.privatelabeldynamics.com/wp-content/uploads/2021/11/S-SC30V_Vitamin_C_Front_1-1-assemble_2025-01-28_06-10_00000.jpg",
      stockQuantity: 60,
      featured: true,
    },
    {
      name: "Gentle Foaming Cleanser",
      slug: "gentle-foaming-cleanser",
      description: "A gentle yet effective facial cleanser that removes impurities without stripping skin's natural oils. Suitable for all skin types.",
      price: 1800,
      compareAtPrice: 2200,
      categoryId: skincare.id,
      imageUrl: "https://m.media-amazon.com/images/I/51Zt5-6-W5L.jpg",
      stockQuantity: 80,
      featured: false,
    },
    {
      name: "Daily Defense SPF 50 Sunscreen",
      slug: "daily-defense-spf50-sunscreen",
      description: "Broad spectrum SPF 50 sunscreen with lightweight, non-greasy finish. Water-resistant for up to 80 minutes. Protects against UVA and UVB rays.",
      price: 2200,
      compareAtPrice: null,
      categoryId: skincare.id,
      imageUrl: "https://acure.com/cdn/shop/files/RRSPF30tubesquare_1500x1500.jpg?v=1762457736",
      stockQuantity: 55,
      featured: true,
    },
    {
      name: "Velvet Matte Lipstick",
      slug: "velvet-matte-lipstick",
      description: "Long-wearing matte lipstick with rich color payoff. Comfortable formula that doesn't dry out lips. Available in bold, statement-making shades.",
      price: 1500,
      compareAtPrice: 1900,
      categoryId: makeup.id,
      imageUrl: "https://www.msmakeupoem.com/cdn/shop/products/10_71c2a1d2-637c-4134-b7eb-2a766f8cbabd.jpg?v=1692247434",
      stockQuantity: 100,
      featured: true,
    },
    {
      name: "Flawless Finish Foundation",
      slug: "flawless-finish-foundation",
      description: "Medium-to-full coverage foundation with a natural, skin-like finish. Buildable formula that lasts up to 16 hours. Infused with skincare benefits.",
      price: 3200,
      compareAtPrice: null,
      categoryId: makeup.id,
      imageUrl: "https://www.msmakeupoem.com/cdn/shop/files/1_bebccb7e-fe2b-40df-905e-a4f19f018742.jpg?v=1706973176",
      stockQuantity: 40,
      featured: true,
    },
    {
      name: "Earth Tones Eyeshadow Palette",
      slug: "earth-tones-eyeshadow-palette",
      description: "A versatile 10-shade eyeshadow palette featuring warm earth tones. Mix of matte, shimmer, and satin finishes for endless eye looks.",
      price: 2500,
      compareAtPrice: 3000,
      categoryId: makeup.id,
      imageUrl: "https://thumbs.dreamstime.com/b/eyeshadow-palette-ten-earth-tone-shades-white-background-makeup-beauty-square-pans-toned-colors-arranged-399301179.jpg",
      stockQuantity: 35,
      featured: false,
    },
    {
      name: "Volume Boost Mascara",
      slug: "volume-boost-mascara",
      description: "Dramatic volumizing mascara that lifts and separates lashes. Smudge-proof, clump-free formula for bold, beautiful lashes all day.",
      price: 1200,
      compareAtPrice: null,
      categoryId: makeup.id,
      imageUrl: "https://ajantabottle.com/public/storage/media/3kUPfB2DSJ3eiesGh8t6zLZekEOgDp2pIXaOlF85.jpg",
      stockQuantity: 90,
      featured: false,
    },
    {
      name: "Nourishing Argan Shampoo",
      slug: "nourishing-argan-shampoo",
      description: "Sulfate-free shampoo enriched with argan oil for deep nourishment. Gently cleanses while adding shine and softness to all hair types.",
      price: 1600,
      compareAtPrice: 2000,
      categoryId: haircare.id,
      imageUrl: "https://img.freepik.com/free-psd/transparent-soap-dispenser-bottle-mockup_191095-77650.jpg?semt=ais_incoming&w=740&q=80",
      stockQuantity: 70,
      featured: true,
    },
    {
      name: "Deep Repair Conditioner",
      slug: "deep-repair-conditioner",
      description: "Intensive repair conditioner that restores damaged hair. Keratin-infused formula strengthens and smooths for silky, manageable hair.",
      price: 1800,
      compareAtPrice: null,
      categoryId: haircare.id,
      imageUrl: "https://bluatlas.com/cdn/shop/files/102224_BluAtlasProduct_Dawson3088_low_SQUARE.png?v=1730763807&width=3840",
      stockQuantity: 50,
      featured: false,
    },
    {
      name: "Revitalizing Hair Oil Serum",
      slug: "revitalizing-hair-oil-serum",
      description: "Lightweight hair oil serum that tames frizz, adds shine, and protects from heat damage. Blend of natural oils for healthy, lustrous hair.",
      price: 2400,
      compareAtPrice: 2800,
      categoryId: haircare.id,
      imageUrl: "https://images.unsplash.com/photo-1710410815589-dd83514104d0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2VydW0lMjBib3R0bGV8ZW58MHx8MHx8fDA%3D",
      stockQuantity: 65,
      featured: true,
    },
    {
      name: "Intensive Hair Mask Treatment",
      slug: "intensive-hair-mask-treatment",
      description: "Deep conditioning hair mask for intense hydration and repair. Use weekly for visibly healthier, stronger, and shinier hair.",
      price: 2000,
      compareAtPrice: null,
      categoryId: haircare.id,
      imageUrl: "https://smallboxcompany.com/wp-content/uploads/2025/08/Luxury-Cosmetic-Jars-1.webp",
      stockQuantity: 40,
      featured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
        featured: product.featured,
      },
      create: product,
    });
  }
  console.log("Products seeded");

  // Seed Blog Posts
  const blogPosts = [
    {
      slug: "ultimate-skincare-routine",
      title: "The Ultimate Skincare Routine for Glowing Skin",
      excerpt: "Discover the step-by-step skincare routine that dermatologists recommend for achieving and maintaining radiant, healthy-looking skin all year round.",
      content: "A great skincare routine starts with understanding your skin type. Whether you have oily, dry, combination, or sensitive skin, the basics remain the same: cleanse, tone, treat, moisturize, and protect.\n\n1. **Cleansing** – Use a gentle cleanser morning and night to remove dirt and impurities.\n2. **Toning** – A good toner balances your skin's pH and preps it for treatments.\n3. **Serums & Treatments** – Target specific concerns like dark spots, fine lines, or acne with active ingredients.\n4. **Moisturizing** – Lock in hydration with a moisturizer suited to your skin type.\n5. **Sunscreen** – The most important step! Apply SPF 30+ every morning.\n\nConsistency is key. Give products at least 4-6 weeks to show results.",
      category: "Skincare",
      imageUrl: "/images/blog-skincare.jpg",
      author: "Dr. Amina Osei",
      readTime: "5 min read",
      featured: true,
      published: true,
      publishedAt: new Date("2026-04-20"),
    },
    {
      slug: "makeup-trends-2026",
      title: "Top 10 Makeup Trends Defining 2026",
      excerpt: "From dewy glass skin to bold lip combinations, these are the makeup trends everyone is talking about this season.",
      content: "2026 is all about embracing natural beauty with strategic enhancements. Here are the trends dominating this year:\n\n1. **Glass Skin** – Ultra-dewy, luminous finishes\n2. **Bold Lip Combos** – Two-toned lips and ombré effects\n3. **Floating Eyeliner** – Creative liner above the crease\n4. **Skin Tints over Foundation** – Light coverage is in\n5. **Monochromatic Looks** – One color family for eyes, cheeks, and lips\n6. **Graphic Eyes** – Bold shapes and colors\n7. **Natural Brows** – Fluffy, brushed-up brows\n8. **Blush Everywhere** – Nose, eyelids, chin\n9. **Sustainable Beauty** – Refillable packaging\n10. **AI-Matched Shades** – Technology meets beauty",
      category: "Makeup",
      imageUrl: "/images/blog-makeup.jpg",
      author: "Lina Mwangi",
      readTime: "4 min read",
      featured: true,
      published: true,
      publishedAt: new Date("2026-04-15"),
    },
    {
      slug: "natural-hair-care-tips",
      title: "Essential Tips for Healthy Natural Hair",
      excerpt: "Learn the best practices for washing, conditioning, and styling natural hair to keep it strong, moisturized, and beautiful.",
      content: "Natural hair requires patience and the right products. Here are essential tips:\n\n- **Deep condition weekly** – Moisture is your best friend\n- **Detangle gently** – Use a wide-tooth comb on wet, conditioned hair\n- **Protective styles** – Give your hair a break with braids or twists\n- **Avoid heat** – Minimize flat iron and blow dryer use\n- **Sleep on satin** – Satin pillowcases reduce friction and breakage\n- **Trim regularly** – Every 8-12 weeks to prevent split ends\n- **Know your porosity** – This determines which products work best for you",
      category: "Haircare",
      imageUrl: "/images/blog-haircare.jpg",
      author: "Joy Akinyi",
      readTime: "6 min read",
      featured: false,
      published: true,
      publishedAt: new Date("2026-04-10"),
    },
    {
      slug: "sunscreen-myths-debunked",
      title: "5 Sunscreen Myths You Need to Stop Believing",
      excerpt: "SPF is essential for all skin tones. We break down the most common sunscreen misconceptions and share the facts.",
      content: "Sunscreen is non-negotiable. Let's debunk common myths:\n\n**Myth 1: Dark skin doesn't need sunscreen.** FACT: All skin tones can suffer UV damage.\n\n**Myth 2: SPF 100 is twice as protective as SPF 50.** FACT: SPF 50 blocks 98% of UVB rays; SPF 100 blocks 99%.\n\n**Myth 3: You don't need sunscreen on cloudy days.** FACT: Up to 80% of UV rays penetrate clouds.\n\n**Myth 4: Sunscreen causes breakouts.** FACT: Modern formulas are lightweight and non-comedogenic.\n\n**Myth 5: One application lasts all day.** FACT: Reapply every 2 hours, especially after sweating or swimming.",
      category: "Skincare",
      imageUrl: "/images/blog-sunscreen.jpg",
      author: "Dr. Amina Osei",
      readTime: "3 min read",
      featured: false,
      published: true,
      publishedAt: new Date("2026-04-05"),
    },
    {
      slug: "beauty-on-a-budget",
      title: "Look Fabulous Without Breaking the Bank",
      excerpt: "Affordable beauty products and smart shopping tips that prove great skincare and makeup don't have to cost a fortune.",
      content: "Great beauty doesn't require a big budget. Here's how to save:\n\n- **Multi-use products** – Tinted moisturizers, lip and cheek stains\n- **Drugstore gems** – Many affordable brands rival luxury ones\n- **DIY masks** – Honey, oats, and yogurt make great face masks\n- **Buy travel sizes first** – Test before committing to full size\n- **Watch for sales** – Stock up during seasonal promotions\n- **Invest in basics** – A good moisturizer and sunscreen go a long way\n- **Minimal routine** – You don't need 10 products to look great",
      category: "Tips & Tricks",
      imageUrl: "/images/blog-budget.jpg",
      author: "Lina Mwangi",
      readTime: "4 min read",
      featured: false,
      published: true,
      publishedAt: new Date("2026-03-28"),
    },
    {
      slug: "ingredients-to-avoid",
      title: "Harmful Ingredients to Avoid in Your Beauty Products",
      excerpt: "Not all beauty products are created equal. Learn which ingredients to watch out for and why clean beauty matters.",
      content: "Being ingredient-conscious is important. Watch out for:\n\n- **Parabens** – Preservatives that may disrupt hormones\n- **Sulfates (SLS/SLES)** – Harsh cleansing agents that strip natural oils\n- **Phthalates** – Found in fragrances, linked to health concerns\n- **Formaldehyde** – A known carcinogen in some hair treatments\n- **Synthetic fragrances** – Can cause irritation and allergies\n- **Mineral oil** – Clogs pores in some formulations\n\n**What to look for instead:** Natural oils, hyaluronic acid, niacinamide, vitamin C, and plant-based extracts.",
      category: "Education",
      imageUrl: "/images/blog-ingredients.jpg",
      author: "Joy Akinyi",
      readTime: "5 min read",
      featured: false,
      published: true,
      publishedAt: new Date("2026-03-20"),
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        imageUrl: post.imageUrl,
        author: post.author,
        readTime: post.readTime,
        featured: post.featured,
        published: post.published,
      },
      create: post,
    });
  }
  console.log("Blog posts seeded");

  // Seed default hero slide
  await prisma.heroSlide.upsert({
    where: { id: "default-hero-1" },
    update: {},
    create: {
      id: "default-hero-1",
      title: "Where Beauty Meets Reach.",
      subtitle: "Discover curated skincare, makeup, and haircare products that bring out your natural glow.",
      badge: "Premium Beauty",
      buttonText: "Shop Now",
      buttonLink: "/products",
      imageUrl: "/images/hero-banner.jpg",
      isActive: true,
      sortOrder: 0,
    },
  });
  console.log("Hero slides seeded");

  // Seed default pickup locations
  const pickupLocations = [
    { name: "Netai CBD Hub", address: "Moi Avenue, Nairobi CBD", city: "Nairobi", phone: "+254 700 000001", hours: "Mon-Sat 8AM-6PM", sortOrder: 0 },
    { name: "Netai Westlands", address: "Westlands Commercial Centre, Westlands", city: "Nairobi", phone: "+254 700 000002", hours: "Mon-Sat 9AM-7PM", sortOrder: 1 },
    { name: "Netai South B", address: "Mombasa Road, South B", city: "Nairobi", phone: "+254 700 000003", hours: "Mon-Fri 8AM-5PM", sortOrder: 2 },
    { name: "Netai Kisumu", address: "Oginga Odinga Street, Kisumu CBD", city: "Kisumu", phone: "+254 700 000004", hours: "Mon-Sat 8AM-6PM", sortOrder: 3 },
    { name: "Netai Mombasa", address: "Nyali Centre, Links Road", city: "Mombasa", phone: "+254 700 000005", hours: "Mon-Sat 9AM-7PM", sortOrder: 4 },
  ];
  for (const loc of pickupLocations) {
    const existing = await prisma.pickupLocation.findFirst({ where: { name: loc.name } });
    if (!existing) {
      await prisma.pickupLocation.create({ data: loc });
    }
  }
  console.log("Pickup locations seeded");

  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
