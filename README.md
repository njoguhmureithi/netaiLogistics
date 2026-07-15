# Netai Logistics - E-commerce Web Application



# Set Up 
1. Make sure you have these installed:

- **Node.js v18 or later** → nodejs.org
- **Yarn package manager** → run npm install -g yarn after installing Node
- **Git (optional, for version control)**

2. Set Up Environment Variables
Create a .env file in the project root with these variables:
-**DATABASE_URL**='your_postgresql_connection_string'
Important: Install PostgreSQL locally and update the connection string accordingly.

3. Install Dependencies 
-**yarn install**- this must be on the root folder

4. Generate Prisma Client & Push Schema
-**Generate the Prisma client**- yarn prisma generate
-**If using a fresh local database, push the schema:** - yarn prisma db push

5. Seed the Database
- yarn tsx scripts/seed.ts

6. Run the dev server
- **yarn dev** - The app should now be running at http://localhost:3000.


## Overview
Beauty & cosmetics e-commerce store with customer storefront and admin panel.
- **Business**: Netai Logistics
- **Tagline**: "Where beauty meets reach."
- **Industry**: Beauty & Cosmetics

## Phase 1 (Complete)
- Customer storefront: homepage, product catalog, cart, checkout, account/orders
- Admin panel: dashboard, product CRUD, category CRUD, order management, customer management
- Auth: email/password with NextAuth.js v4, JWT strategy
- Cloud storage: S3 for product image uploads
- Database: PostgreSQL with Prisma ORM

## Phase 2A (Complete) - Customer Engagement
- Wishlist system (DB model: WishlistItem, API: /api/wishlist, Page: /wishlist)
- Recently Viewed products (Zustand store, client-side tracking, displayed in store layout)
- Heart icon in store header and product detail pages

## Phase 2B (Complete) - Revenue Optimization
- Discount/Coupon system (DB model: Coupon, Admin: /admin/coupons, Validation: /api/coupons/validate)
  - Supports percentage and fixed amount discounts
  - Min order, max uses, expiry date
  - Applied at checkout with live validation
- MOQ Settings (DB model: StoreSettings, Admin: /admin/settings)
  - Admin-configurable minimum order value
  - Enforced at both client and server side during checkout

## Phase 2C (Complete) - Admin Intelligence
- Analytics Dashboard (/admin/analytics)
  - Revenue by month (bar chart), top selling products, order status breakdown
  - Summary cards: revenue, orders, customers, avg order value, products, total discounts
- Inventory Alerts
  - Low-stock warnings on admin dashboard and analytics page
  - Per-product lowStockThreshold field (default 5)
  - Configurable default threshold in Store Settings

## Phase 3 (Complete) - Product Discovery & PDF Downloads
- Product Card Badges: "Sale" badge (red, shows % OFF) when compareAtPrice set, "New Arrival" badge (green "NEW") for products < 14 days old
- Smart Search: Debounced auto-complete in store header, shows product thumbnails/prices and category suggestions (API: /api/products/suggestions)
- Order Invoice PDF: Download button on customer order detail and admin order detail pages (API: /api/orders/[id]/invoice, uses Abacus HTML2PDF service)
- Admin Catalogue PDF: Download button on admin products page, generates full product catalogue grouped by category with stock levels and summary stats (API: /api/admin/catalogue)

## Phase 4A (Complete) - User & Role Management
- Three roles: admin, manager, customer
  - Admin: Full access (all admin features + user management + settings)
  - Manager: Can manage products, orders, categories, coupons, analytics (no user mgmt / settings)
  - Customer: Regular storefront user
- Admin Users page (/admin/users): list, search, filter by role, change roles, toggle active/inactive, create new users
- API: /api/admin/users (GET, POST), /api/admin/users/[id] (GET, PUT) — admin-only
- User isActive field: deactivated users cannot log in
- Self-protection: admins cannot demote or deactivate themselves
- Admin sidebar dynamically hides admin-only links (User Management, Settings) from managers
- Admin guard (lib/admin-guard.ts): requireAdmin() allows admin+manager, requireSuperAdmin() requires admin only

## Phase 4B (Complete) - Supplier Management & Bulk Actions
- Supplier Management: Full CRUD with nested items/pricing (/admin/suppliers)
  - Supplier model: name, contact, email, phone, address, notes, isActive
  - SupplierItem model: name, sku, price, currency, moq, leadTime, notes (cascade delete)
  - Admin-only delete for suppliers (requireSuperAdmin), admin+manager for items
- Bulk Product Actions: Multi-select with activate/deactivate/publish/unpublish/delete
  - Product `published` field (Boolean, default true): controls storefront & catalogue visibility
  - Storefront queries filter `active: true, published: true`
  - Hard delete requires admin role; products with orders are soft-deleted instead
  - API: /api/admin/products/bulk (POST)

## Blog (Complete) — DB-backed with Admin Management
- BlogPost model in Prisma: title, slug, excerpt, content, category, imageUrl, author, readTime, featured, published, publishedAt
- Storefront: /blog reads from DB (published posts only), server-rendered
- Admin: /admin/blog — full CRUD, publish/unpublish, feature/unfeature, search, category filter
- API: /api/admin/blog (GET, POST), /api/admin/blog/[id] (GET, PUT, DELETE)
  - GET/POST/PUT: requireAdmin (admin+manager), DELETE: requireSuperAdmin (admin only)
- Admin sidebar: Blog link with BookOpen icon (accessible to admin+manager)
- Store header: Blog link in desktop nav + mobile menu
- Categories: Skincare, Makeup, Haircare, Sun Care, Tips & Tricks, Education, General
- 6 seed posts with content, images in /public/images/blog-*.jpg
- Individual post page: /blog/[slug] — server-rendered, shows full content, related posts from same category
- Simple markdown rendering for content (bold, lists, paragraphs)
- Files: app/(store)/blog/page.tsx, app/(store)/blog/_components/blog-client.tsx, app/(store)/blog/[slug]/page.tsx, app/(store)/blog/[slug]/_components/blog-post-client.tsx, app/admin/blog/page.tsx, app/api/admin/blog/route.ts, app/api/admin/blog/[id]/route.ts

## Content Management (Complete)
- **Hero Banners**: DB-backed hero slides with carousel rotation
  - HeroSlide model: title, subtitle, badge, buttonText, buttonLink, imageUrl, overlayColor, isActive, sortOrder
  - Admin: /admin/content (Hero Banners tab) — full CRUD, toggle active, image upload, sort order
  - API: /api/admin/hero (GET, POST), /api/admin/hero/[id] (PUT, DELETE)
  - Storefront: Dynamic hero carousel with auto-rotate (6s), dot indicators, fallback to default banner
  - Default hero slide seeded in DB
- **Promotional Pop-ups**: DB-backed promo popups with scheduling
  - PromoPopup model: title, description, imageUrl, buttonText, buttonLink, couponCode, isActive, showDelay, displayFrequency, startDate, endDate
  - Admin: /admin/content (Promo Pop-ups tab) — full CRUD, toggle active, image upload, coupon code, scheduling
  - API: /api/admin/promo-popups (GET, POST), /api/admin/promo-popups/[id] (PUT, DELETE)
  - Public API: /api/storefront/promo-popup (returns active popup within date range)
  - Storefront: Modal popup with configurable delay, frequency control (once per session/day/always), coupon code copy, CTA button
  - Component: components/store/promo-popup.tsx (rendered in store layout)
- Admin sidebar: "Content" link with LayoutTemplate icon (accessible to admin+manager)

## Review Moderation (Complete)
- Review model has `approved` Boolean field (default false) with index
- New reviews require admin approval before appearing on storefront
- Admin page: /admin/reviews — filter tabs (pending/approved/all), search, approve/reject/delete actions
- API: /api/admin/reviews (GET with ?status=pending|approved|all), /api/admin/reviews/[id] (PATCH, DELETE)
- Storefront: product pages only show reviews where `approved: true`
- Toast message after review submission informs users reviews need approval
- Admin sidebar: Reviews link with MessageSquare icon (accessible to admin+manager)

## Email Notifications (Complete)
- Order Status Update email: sent to customer when admin changes order status
  - API: Abacus sendNotificationEmail (NOTIF_ID_ORDER_STATUS_UPDATE env var)
  - Triggered in PUT /api/admin/orders/[id] — fire-and-forget (non-blocking)
  - HTML email with status badge, order items table, total, and "View Your Orders" CTA
  - Sender: noreply@{hostname}, alias "Netai Logistics"

## Delivery Method / Pickup Points (Complete)
- Order model fields: `deliveryMethod` (String, default "delivery"), `pickupPoint` (String, optional)
- Checkout page: Delivery method selector — "Deliver to My Address" or "Pick Up at a Location"
  - Delivery: Shows standard shipping address form
  - Pickup: Shows list of 5 pickup points (CBD Nairobi, Westlands, South B, Kisumu, Mombasa)
  - For pickup orders, shippingAddress is populated with "Pickup: {name} – {address}" prefix
- PICKUP_POINTS constant defined in app/(store)/checkout/page.tsx (client-side array)
- Order creation API accepts deliveryMethod + pickupPoint, defaults to "delivery" if not provided
- Displayed across: admin order detail (badge + pickup name), customer order detail, tracking page, status email
- Backward compatible: existing orders default to "delivery" display

## Order Tracking (Complete)
- Public page: /track — no login required
- Customer enters order number, sees visual timeline (Received → Processing → Dispatched → Delivered)
- Cancelled orders show dedicated cancelled state
- Displays: order summary, shipping info, estimated delivery, itemised list with totals
- API: /api/track (GET with ?orderNumber=...) — public, returns order details without sensitive user data
- Links: store header (desktop + mobile), footer

## Phase 5 (Future)
- Bulk product import/export (CSV)

## Technical Stack
- Next.js 14, React 18, TypeScript
- Prisma ORM with PostgreSQL
- NextAuth.js v4 (JWT strategy)
- AWS S3 for file uploads
- Zustand for cart state management
- Tailwind CSS 3 with custom rose-pink theme

## Color Theme
- Primary: HSL 340 82% 52% (Rose Pink)
- Beauty/cosmetics focused warm palette
- Light mode default

## Key Design Decisions
- Route groups: `(store)` for customer-facing pages, `/admin` for admin panel
- Cart state: Zustand store (client-side, no persistence)
- Order status flow: Received → Dispatched (with estimated delivery time)
- Product images: CDN URLs or S3 uploads (public)
- Currency: KES (Kenyan Shillings)

## Admin Accounts
- Business admin: admin@coreglow.com / CoreGlow2026!

## Subcategory System (Complete)
- SubCategory model: id, name, slug, description, categoryId (FK to Category), unique [categoryId, slug]
- Product.subCategoryId (optional, onDelete: SetNull)
- Admin: Categories page has expandable rows showing subcategories inline with CRUD dialogs
- Admin: Products page has 2-column category + subcategory dropdowns (subcategory filters by selected category)
- API: /api/admin/categories/[id]/subcategories (GET, POST), /api/admin/categories/[id]/subcategories/[subId] (PUT, DELETE)
- All product APIs (admin + public) include subCategory in responses
- Storefront homepage FilterPanel: clicking a category expands subcategories indented with border-left; subcategory filtering is client-side
- Storefront /products page: subcategory query param support, subcategory filter buttons appear below category buttons
- Public /api/products: supports ?subcategory=slug param

## Database Models
- User (customers + admins via role field)
- Category, SubCategory, Product
- Order, OrderItem
- Account, Session (NextAuth)

## Product Categories
- Skincare (4 products)
- Makeup (4 products)
- Haircare (4 products)
Total: 12 seed products
