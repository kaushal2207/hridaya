import type { FormType, Item, Service, ServiceCategory, Slide, Industry, PortfolioCategory } from "@/lib/types";

/**
 * Built-in content. Used as fallback when the database is empty or not configured,
 * and as defaults for service-page sections the admin hasn't filled in yet.
 * Everything here describes services; none of it claims results, clients or numbers.
 */

export const CATEGORY_PROCESS: Record<string, Item[]> = {
  "web-development": [
    { title: "Discovery call", description: "We learn what the site must achieve, who it serves and what you already have: domain, hosting, content, brand assets." },
    { title: "Sitemap and wireframes", description: "You approve the page list and the layout of key pages before any visual design starts." },
    { title: "Design and build", description: "Pages are designed, developed and connected to forms, analytics and any integrations you need." },
    { title: "Testing", description: "We check every page on phones, tablets and desktops, test forms and fix speed and SEO basics." },
    { title: "Launch and handover", description: "We go live, submit the sitemap to Google and show you how to update content yourself." },
  ],
  "graphic-design-branding": [
    { title: "Creative brief", description: "We capture your audience, tone, competitors and where the designs will be used." },
    { title: "Concepts", description: "You receive initial directions to react to, not a single take-it-or-leave-it option." },
    { title: "Refinement", description: "We revise the chosen direction based on your feedback within the agreed rounds." },
    { title: "Final files", description: "You get print and web-ready files in the formats and sizes each platform needs." },
  ],
  "digital-marketing": [
    { title: "Audit and goals", description: "We review your website, past campaigns and tracking, and agree on the goal that matters: leads, sales or visibility." },
    { title: "Strategy", description: "Channels, audiences, budget split and the content or keywords each part of the plan needs." },
    { title: "Setup and tracking", description: "Conversion tracking, pixels and analytics are set up first, so every rupee spent can be measured." },
    { title: "Launch and optimise", description: "Campaigns go live and are adjusted based on real data, not guesswork." },
    { title: "Reporting", description: "Regular reports in plain language: what was spent, what it produced and what we will change next." },
  ],
  "ecommerce-management": [
    { title: "Account review", description: "We review your seller account health, catalogue, pricing and advertising, or plan the setup if you are new." },
    { title: "Catalogue fixes", description: "Listings, attributes, images and variations are corrected to marketplace guidelines." },
    { title: "Growth plan", description: "Keyword research, A+ content, deals and ad campaigns are planned around your margins." },
    { title: "Daily operations", description: "We monitor orders, inventory sync, returns, reviews and account notifications." },
    { title: "Monthly review", description: "A clear report on sales, ad spend and next steps for each marketplace." },
  ],
};

type ServiceSeed = {
  slug: string; name: string; category: string; form: FormType; icon: string;
  tagline: string; short: string; intro: string; offerings: Item[]; benefits: Item[];
  faqs: { question: string; answer: string }[];
};

const S: ServiceSeed[] = [
  {
    slug: "website-development", name: "Website Development", category: "web-development", form: "website", icon: "Globe",
    tagline: "Websites that load fast, read clearly and turn visitors into enquiries.",
    short: "Custom business websites designed, built and maintained for performance and leads.",
    intro: "Your website is often the first conversation a customer has with your business. We plan, design and build websites around what your visitors need to see before they contact you, then make sure the site is fast, secure, mobile-friendly and easy for you to update.",
    offerings: [
      { title: "Business websites", description: "Multi-page company websites with service pages, enquiry forms and Google Maps integration." },
      { title: "Landing pages", description: "Focused single pages for ad campaigns, product launches or lead generation." },
      { title: "Custom web applications", description: "Booking systems, portals and dashboards built with modern frameworks like Next.js." },
      { title: "E-commerce websites", description: "Online stores with payment gateways, shipping rules and inventory management." },
      { title: "Website redesigns", description: "Modernising outdated sites while preserving the search rankings you already have." },
      { title: "Maintenance and support", description: "Updates, backups, security monitoring and content changes on a monthly plan." },
    ],
    benefits: [
      { title: "Built for search from day one", description: "Clean code, proper headings, structured data and fast loading help Google understand and rank your pages." },
      { title: "Easy to update", description: "You can change text, images and blog posts yourself without calling a developer." },
      { title: "Designed to convert", description: "Clear calls to action and short enquiry forms placed where visitors are ready to act." },
    ],
    faqs: [
      { question: "How much does a business website cost?", answer: "It depends on the number of pages, features and integrations. Share your requirements through the form and we will send a fixed, itemised quote." },
      { question: "How long does a website take?", answer: "A typical business website takes a few weeks from approved content to launch. Larger custom builds are planned in phases with dates agreed up front." },
      { question: "Will I own the website?", answer: "Yes. The domain, hosting account and website files are yours. We can work with your existing hosting or help you choose one." },
    ],
  },
  {
    slug: "wordpress-development", name: "WordPress Development", category: "web-development", form: "website", icon: "LayoutTemplate",
    tagline: "WordPress websites you can manage yourself, built without plugin clutter.",
    short: "Flexible WordPress sites you can update yourself, built on clean, secure foundations.",
    intro: "WordPress powers a large share of the web because it is flexible and easy to edit. The difference between a good and a bad WordPress site is how it is built. We use lightweight themes, a small set of trusted plugins and sensible security settings so your site stays fast and stable.",
    offerings: [
      { title: "Custom theme development", description: "Themes built for your brand rather than heavy multipurpose templates." },
      { title: "WooCommerce stores", description: "Product catalogues, payment gateways, GST-ready invoices and shipping setup." },
      { title: "Speed optimisation", description: "Caching, image compression and plugin cleanup for slow WordPress sites." },
      { title: "Security hardening", description: "Login protection, updates, backups and malware cleanup." },
      { title: "Migration", description: "Moving sites between hosts or from other platforms to WordPress without losing content." },
    ],
    benefits: [
      { title: "Editor-friendly", description: "Content blocks are set up so that adding pages and posts is straightforward." },
      { title: "Fewer plugins, fewer problems", description: "Every plugin we add has a reason, which keeps updates safe and the site fast." },
      { title: "Room to grow", description: "Add a blog, store, booking system or new language later without rebuilding." },
    ],
    faqs: [
      { question: "Can you fix my existing WordPress site?", answer: "Yes. We start with an audit of speed, security and plugins, then fix issues in priority order." },
      { question: "Do you use page builders?", answer: "We prefer the native block editor or a lightweight builder, chosen based on who will edit the site and how often." },
      { question: "Will you train my team?", answer: "Yes. Every WordPress handover includes a walkthrough on updating pages, posts and media." },
    ],
  },
  {
    slug: "shopify-development", name: "Shopify Development", category: "web-development", form: "website", icon: "Store",
    tagline: "Shopify stores set up to sell from the first day.",
    short: "Shopify stores set up, themed and configured for smooth selling.",
    intro: "Shopify takes care of hosting, payments and security, which lets you focus on selling. We handle the setup properly: theme customisation, collections, product data, Indian payment gateways, shipping and tax rules, and the apps you actually need.",
    offerings: [
      { title: "Store setup", description: "Complete store configuration, from domain and payments to shipping zones and policies." },
      { title: "Theme customisation", description: "Brand-aligned design changes to Shopify themes, including custom sections." },
      { title: "Product and collection setup", description: "Bulk product uploads, variants, metafields and smart collections." },
      { title: "App integration", description: "Reviews, WhatsApp, COD verification, shipping aggregators and marketing apps." },
      { title: "Migration to Shopify", description: "Moving products, customers and orders from WooCommerce or other platforms." },
    ],
    benefits: [
      { title: "Launch faster", description: "A properly configured store avoids weeks of trial and error with settings and apps." },
      { title: "Mobile shoppers first", description: "Product pages and checkout are checked carefully on phones, where most orders happen." },
      { title: "Ready for marketplaces", description: "Product data is structured so it can also feed Google Shopping and other channels." },
    ],
    faqs: [
      { question: "Do I need a Shopify plan already?", answer: "No. We can recommend a plan based on your product count and expected order volume and set it up with you." },
      { question: "Can Shopify handle COD and Indian payment gateways?", answer: "Yes. We configure COD rules and gateways such as Razorpay or others that suit your business." },
      { question: "Do you manage the store after launch?", answer: "Yes, through our Shopify store management and e-commerce management services." },
    ],
  },
  {
    slug: "graphic-design", name: "Graphic Design", category: "graphic-design-branding", form: "design", icon: "PenTool",
    tagline: "Designs that look consistent everywhere your customers see you.",
    short: "Social creatives, banners and marketing designs aligned with your brand.",
    intro: "Customers judge quality quickly, often from a single post or banner. We design creatives for social media, ads, print and marketplaces that follow your brand colours and fonts, and are sized correctly for each platform.",
    offerings: [
      { title: "Social media creatives", description: "Posts, carousels, stories and reel covers designed as a consistent series." },
      { title: "Ad creatives", description: "Static and carousel designs for Google and Meta campaigns, in all required sizes." },
      { title: "Marketing banners", description: "Website banners, offer graphics and email headers." },
      { title: "Print design", description: "Brochures, flyers, visiting cards, standees and packaging inserts." },
      { title: "Presentation design", description: "Company profiles and pitch decks that are easy to read." },
    ],
    benefits: [
      { title: "Platform-ready sizes", description: "Every file is exported for the platform it is going to, with no awkward cropping." },
      { title: "Editable source files", description: "You receive source files so future updates do not start from scratch." },
      { title: "Consistent look", description: "Templates and styles are reused so your feed and ads look like one brand." },
    ],
    faqs: [
      { question: "How many revisions are included?", answer: "Revision rounds are agreed in your quote before work begins, so there are no surprises." },
      { question: "Can you design in my existing brand style?", answer: "Yes. Upload your logo and brand guidelines in the enquiry form and we will follow them." },
      { question: "Do you offer monthly design packages?", answer: "Yes. Monthly packages suit businesses that need a steady flow of social and ad creatives." },
    ],
  },
  {
    slug: "branding-logo-design", name: "Branding & Logo Design", category: "graphic-design-branding", form: "design", icon: "Sparkles",
    tagline: "A logo and identity system your business can grow into.",
    short: "Logos and brand identity systems that give your business a consistent look.",
    intro: "A brand is more than a logo. It is the colours, typography, tone and visual rules that make you recognisable across your website, packaging, marketplaces and social media. We create identities that work in small sizes, on dark and light backgrounds, and in print.",
    offerings: [
      { title: "Logo design", description: "Original logo concepts with variations for horizontal, stacked and icon-only use." },
      { title: "Brand identity", description: "Colour palette, typography, iconography and imagery guidelines." },
      { title: "Brand guidelines document", description: "A clear reference your team and vendors can follow." },
      { title: "Stationery", description: "Visiting cards, letterheads, email signatures and invoices." },
      { title: "Packaging and labels", description: "Product packaging and label designs that meet print requirements." },
    ],
    benefits: [
      { title: "Recognisable everywhere", description: "Your brand looks the same on a marketplace thumbnail and a shop signboard." },
      { title: "Original work", description: "Logos are designed for you, not adapted from stock templates." },
      { title: "Full ownership", description: "Final vector files and usage rights are handed over to you." },
    ],
    faqs: [
      { question: "What files will I receive?", answer: "Vector files (AI, SVG, PDF) and ready-to-use PNG and JPG versions in colour, black and white." },
      { question: "Can you refresh my existing logo?", answer: "Yes. A refresh keeps the recognition you have built while modernising the design." },
      { question: "How long does branding take?", answer: "Logo projects usually take one to three weeks depending on feedback rounds; full identities take longer." },
    ],
  },
  {
    slug: "digital-marketing", name: "Digital Marketing", category: "digital-marketing", form: "marketing", icon: "Megaphone",
    tagline: "One plan across search, social and ads, measured by enquiries and sales.",
    short: "Integrated online marketing planned around your goals and audience.",
    intro: "Running ads, posting on social media and doing SEO separately rarely adds up. We plan your digital marketing as one system: who you want to reach, what will make them act and which channels deliver that at a cost that makes sense for your business.",
    offerings: [
      { title: "Marketing strategy", description: "Channel selection, audience planning and budget allocation." },
      { title: "Performance marketing", description: "Paid campaigns on Google and Meta optimised for leads or sales." },
      { title: "Lead generation", description: "Landing pages, lead forms and follow-up flows that capture and qualify enquiries." },
      { title: "Content marketing", description: "Blogs, guides and social content that answer your customers' questions." },
      { title: "Analytics and tracking", description: "GA4, Tag Manager and conversion tracking set up correctly." },
    ],
    benefits: [
      { title: "Clear goals", description: "Every campaign has a defined objective and a way to measure it." },
      { title: "Spend where it works", description: "Budget shifts towards the channels that produce results for you." },
      { title: "Transparent reporting", description: "You see spend and results in plain language." },
    ],
    faqs: [
      { question: "What budget do I need?", answer: "Our management fee and your ad budget are separate. We will suggest a starting ad budget based on your goals and market." },
      { question: "How soon will I see results?", answer: "Paid campaigns can produce enquiries quickly; SEO and content build over months. We will set realistic expectations for each channel." },
      { question: "Do you guarantee results?", answer: "No honest agency can guarantee rankings or sales. We commit to a clear plan, transparent reporting and continuous improvement." },
    ],
  },
  {
    slug: "seo-services", name: "SEO Services", category: "digital-marketing", form: "seo", icon: "Search",
    tagline: "Be found when customers search for what you offer.",
    short: "Technical, on-page and local SEO to improve organic visibility.",
    intro: "Search engine optimisation helps the right people find your website without paying for every click. We fix the technical issues that hold your site back, improve your pages for the searches that matter and build local visibility for businesses that serve specific cities.",
    offerings: [
      { title: "Technical SEO", description: "Crawlability, indexing, site speed, Core Web Vitals and structured data." },
      { title: "On-page SEO", description: "Titles, meta descriptions, headings, internal links and content improvements." },
      { title: "Local SEO", description: "Google Business Profile optimisation and local citations." },
      { title: "Keyword research", description: "Finding the terms your customers actually use, grouped by intent." },
      { title: "Content planning", description: "Topic plans and briefs for pages and blog posts that can rank." },
      { title: "E-commerce SEO", description: "Category and product page optimisation for online stores." },
    ],
    benefits: [
      { title: "Compounding traffic", description: "Well-ranked pages keep bringing visitors without ongoing ad spend." },
      { title: "Better quality visitors", description: "Targeting the right keywords brings people who are ready to buy or enquire." },
      { title: "A healthier website", description: "Technical fixes improve the experience for every visitor, not just search engines." },
    ],
    faqs: [
      { question: "How long does SEO take?", answer: "Most sites see meaningful movement in three to six months, depending on competition and the site's starting point." },
      { question: "Can I check my site first?", answer: "Yes. Try our free Website SEO Audit tool for an instant report on your homepage." },
      { question: "Do you build backlinks?", answer: "We focus on earning links through useful content and genuine listings, and avoid spammy link schemes that risk penalties." },
    ],
  },
  {
    slug: "google-ads-management", name: "Google Ads Management", category: "digital-marketing", form: "marketing", icon: "MousePointerClick",
    tagline: "Show up at the moment people search, and pay only for clicks that matter.",
    short: "Search, display and shopping campaigns set up and managed for efficient spend.",
    intro: "Google Ads can bring customers the same day you launch, or burn your budget on irrelevant clicks. We structure accounts tightly, write ads that match search intent, add negative keywords continuously and track conversions so decisions are based on real enquiries and sales.",
    offerings: [
      { title: "Search campaigns", description: "Keyword-targeted text ads for people actively searching for your services." },
      { title: "Performance Max and Shopping", description: "Product feeds and campaigns for e-commerce stores." },
      { title: "Display and YouTube", description: "Awareness and remarketing campaigns across Google's network." },
      { title: "Conversion tracking", description: "Calls, forms, WhatsApp clicks and purchases tracked accurately." },
      { title: "Account audits", description: "Finding wasted spend and quick wins in existing accounts." },
    ],
    benefits: [
      { title: "Less wasted spend", description: "Regular search term reviews and negatives keep budgets on relevant traffic." },
      { title: "Local targeting", description: "Campaigns can focus on Noida, Delhi NCR or any city or radius you serve." },
      { title: "You own the account", description: "Campaigns run in your Google Ads account with full access for you." },
    ],
    faqs: [
      { question: "Is the ad budget included in your fee?", answer: "No. Ad spend is paid directly to Google from your account; our management fee is separate." },
      { question: "Can you take over my current account?", answer: "Yes. We begin with an audit and keep what works before restructuring." },
      { question: "How often do you optimise?", answer: "Campaigns are reviewed several times a week in the early stages and at least weekly after that." },
    ],
  },
  {
    slug: "meta-ads-management", name: "Meta Ads Management", category: "digital-marketing", form: "marketing", icon: "Target",
    tagline: "Reach the right people on Facebook and Instagram, then bring them back.",
    short: "Facebook and Instagram ad campaigns built around targeting and creative testing.",
    intro: "On Facebook and Instagram, people are not searching for you, so the creative and the offer do most of the work. We combine audience strategy, creative testing and proper pixel and Conversions API tracking to find what makes your audience stop scrolling and act.",
    offerings: [
      { title: "Lead generation campaigns", description: "Instant forms and landing-page campaigns with lead quality checks." },
      { title: "Sales campaigns", description: "Catalogue and Advantage+ shopping campaigns for e-commerce." },
      { title: "Creative testing", description: "Structured tests of hooks, formats and offers." },
      { title: "Retargeting", description: "Re-engaging website visitors, video viewers and past customers." },
      { title: "Pixel and Conversions API", description: "Reliable tracking setup, including events for leads and purchases." },
    ],
    benefits: [
      { title: "Creative and media together", description: "Our designers and ad managers work on the same campaigns." },
      { title: "Quality over volume", description: "We optimise for leads that convert, not just the cheapest form fills." },
      { title: "Clear learning", description: "Each test teaches something you can use in future campaigns." },
    ],
    faqs: [
      { question: "Do you create the ad designs?", answer: "Yes. Ad creatives and reel edits can be included in your plan." },
      { question: "What is the minimum ad budget?", answer: "It varies by goal and market. We will recommend a realistic test budget before launch." },
      { question: "Can you run ads for my Instagram page only?", answer: "Yes. Campaigns can be set to run only on Instagram placements if that suits your audience." },
    ],
  },
  {
    slug: "social-media-management", name: "Social Media Management", category: "digital-marketing", form: "social", icon: "Share2",
    tagline: "A consistent, on-brand social presence without the daily scramble.",
    short: "Content planning, posting and community management for your social channels.",
    intro: "Posting regularly on social media takes planning, design, writing and timing. We take care of the whole cycle: a monthly content calendar, designed posts and reels, captions and hashtags, scheduling and responding to comments, so your channels stay active and on-brand.",
    offerings: [
      { title: "Content calendar", description: "Monthly plans mixing education, promotion, behind-the-scenes and festive posts." },
      { title: "Post and carousel design", description: "Branded designs in a consistent visual style." },
      { title: "Reels", description: "Scripting ideas, editing and cover design for short videos." },
      { title: "Captions and hashtags", description: "Copy written for your audience, with relevant hashtags." },
      { title: "Community management", description: "Responding to comments and messages within agreed hours." },
      { title: "Profile optimisation", description: "Bio, highlights, links and profile setup across platforms." },
    ],
    benefits: [
      { title: "Consistency", description: "Your audience sees regular, planned content instead of bursts and silence." },
      { title: "Approval before posting", description: "You review the calendar and designs before anything goes live." },
      { title: "Monthly insights", description: "We report on reach and engagement and adjust the content mix." },
    ],
    faqs: [
      { question: "Which platforms do you manage?", answer: "Instagram, Facebook, LinkedIn and YouTube are the most common. Tell us which ones matter for your business." },
      { question: "Do you shoot photos and videos?", answer: "We primarily work with content you provide plus designed creatives. Shoots can be arranged on request." },
      { question: "Is ad management included?", answer: "It can be added. Indicate it in the enquiry form and we will include it in your quote." },
    ],
  },
  {
    slug: "ecommerce-management", name: "E-commerce Management", category: "ecommerce-management", form: "ecommerce", icon: "ShoppingCart",
    tagline: "One team for your marketplaces and your own store.",
    short: "Day-to-day operations support across your online sales channels.",
    intro: "Selling online across Amazon, Flipkart, Myntra and your own Shopify store means many dashboards, rules and daily tasks. We manage them as one operation: catalogue, pricing, advertising, account health and reporting, so you can focus on products and fulfilment.",
    offerings: [
      { title: "Multi-channel management", description: "Amazon, Flipkart, Myntra, Meesho and Shopify managed together." },
      { title: "Catalogue management", description: "Listings, variations, images and attributes kept accurate and consistent." },
      { title: "Marketplace advertising", description: "Sponsored ads managed against your margins." },
      { title: "Account health", description: "Monitoring policy notices, performance metrics and listing errors." },
      { title: "Inventory and pricing", description: "Keeping stock and prices in sync across channels." },
    ],
    benefits: [
      { title: "Fewer dashboards for you", description: "One point of contact and one report across channels." },
      { title: "Fewer listing errors", description: "Catalogue issues are caught and fixed early." },
      { title: "Margin-aware decisions", description: "Advertising and pricing account for marketplace fees and returns." },
    ],
    faqs: [
      { question: "Do you handle shipping and packing?", answer: "No. We manage the online operations; fulfilment stays with you or your logistics partner." },
      { question: "Can you start with one marketplace?", answer: "Yes. Many sellers start with one channel and add others once it is running smoothly." },
      { question: "Do I need to share my login?", answer: "Where marketplaces support it, we use user permissions instead of your main login." },
    ],
  },
  {
    slug: "amazon-account-management", name: "Amazon Account Management", category: "ecommerce-management", form: "ecommerce", icon: "Package",
    tagline: "Keep your Amazon account healthy, visible and profitable.",
    short: "Amazon seller account setup, listings, A+ content and advertising support.",
    intro: "Amazon rewards sellers with complete, keyword-rich listings, good account health and well-managed advertising. We support the whole cycle on Amazon.in: account setup, brand registry guidance, listings, A+ content, Sponsored Products and Brands campaigns, and day-to-day account health.",
    offerings: [
      { title: "Account setup", description: "Seller Central registration guidance, tax settings and shipping templates." },
      { title: "Listing optimisation", description: "Titles, bullet points, descriptions and backend search terms." },
      { title: "A+ content", description: "Enhanced brand content modules designed and published." },
      { title: "Amazon PPC", description: "Sponsored Products, Brands and Display campaigns." },
      { title: "Brand Registry support", description: "Guidance through trademark-based Brand Registry and storefront setup." },
      { title: "Account health monitoring", description: "Handling performance notifications and listing suppressions." },
    ],
    benefits: [
      { title: "More visibility", description: "Better listings and ads help products appear in relevant searches." },
      { title: "Controlled ad spend", description: "Campaigns are managed against target ACoS that fits your margins." },
      { title: "Fewer suppressions", description: "Listing issues are fixed before they affect sales." },
    ],
    faqs: [
      { question: "Can you help with a suspended listing?", answer: "We can review the issue and help prepare corrections and responses. Outcomes depend on Amazon's review." },
      { question: "Do you create product images?", answer: "Yes. Listing images and infographics are available through our design team." },
      { question: "Do you manage FBA?", answer: "We can help plan FBA shipments and inventory; physical logistics remain with you." },
    ],
  },
  {
    slug: "myntra-account-management", name: "Myntra Account Management", category: "ecommerce-management", form: "ecommerce", icon: "Shirt",
    tagline: "Fashion and lifestyle catalogues managed to Myntra's standards.",
    short: "Myntra seller onboarding, catalogue and account operations support.",
    intro: "Myntra has strict catalogue, image and quality standards for fashion and lifestyle brands. We help you meet them, from onboarding documentation and catalogue templates to image guidelines, size charts and ongoing account operations.",
    offerings: [
      { title: "Onboarding support", description: "Guidance through the seller application and documentation." },
      { title: "Catalogue creation", description: "Style-wise listings with correct attributes, sizes and colours." },
      { title: "Image compliance", description: "Product images edited to Myntra's background, angle and size requirements." },
      { title: "Size charts", description: "Accurate size charts that help reduce returns." },
      { title: "Promotions and ads", description: "Participation in events and Myntra advertising." },
    ],
    benefits: [
      { title: "Faster approvals", description: "Catalogue submissions that follow guidelines are approved with fewer rejections." },
      { title: "Fewer returns", description: "Accurate sizing and descriptions set the right expectations." },
      { title: "Fashion expertise", description: "We understand style attributes and seasonal catalogue planning." },
    ],
    faqs: [
      { question: "Can any brand sell on Myntra?", answer: "Myntra reviews brands before onboarding. We help you prepare a strong application, but approval is Myntra's decision." },
      { question: "Do you handle photo shoots?", answer: "We edit and prepare images; shoots can be arranged separately." },
      { question: "Do you manage Myntra PPM?", answer: "Yes. Myntra advertising can be included in your management plan." },
    ],
  },
  {
    slug: "flipkart-account-management", name: "Flipkart Account Management", category: "ecommerce-management", form: "ecommerce", icon: "Truck",
    tagline: "Run your Flipkart store with clean listings and focused ads.",
    short: "Flipkart seller account, listing and advertising management.",
    intro: "Flipkart reaches buyers across India, including smaller cities and towns. We manage your seller account end to end: listings, pricing, Flipkart Ads, sale event participation and seller health, so your store stays competitive throughout the year.",
    offerings: [
      { title: "Seller onboarding", description: "Registration guidance, GST setup and pickup configuration." },
      { title: "Listing management", description: "Single and bulk listings with correct verticals and attributes." },
      { title: "Flipkart Ads", description: "Product listing ads and brand ads managed for return on spend." },
      { title: "Sale event planning", description: "Preparing pricing, stock and ads for Big Billion Days and other events." },
      { title: "Seller health", description: "Monitoring ratings, cancellations and policy compliance." },
    ],
    benefits: [
      { title: "Prepared for peak sales", description: "Event plans are made weeks in advance." },
      { title: "Healthy seller metrics", description: "Better metrics support visibility and badges." },
      { title: "Pan-India reach", description: "Listings optimised for how buyers across India search." },
    ],
    faqs: [
      { question: "Can you manage Flipkart and Amazon together?", answer: "Yes. See our E-commerce Management service for multi-channel plans." },
      { question: "Do you help with returns disputes?", answer: "We can help raise and track SPF claims and return disputes through seller support." },
      { question: "What do I need to start?", answer: "A GSTIN, bank account and products ready to list. We guide you through the rest." },
    ],
  },
  {
    slug: "product-listing-services", name: "Product Listing Services", category: "ecommerce-management", form: "ecommerce", icon: "ListChecks",
    tagline: "Product pages that answer questions before buyers ask them.",
    short: "Optimised product titles, descriptions, attributes and images for marketplaces.",
    intro: "A product listing has seconds to convince a shopper. We write titles that match how buyers search, bullet points that answer real questions, complete attributes so filters find your products and images that meet each marketplace's rules.",
    offerings: [
      { title: "Keyword-based titles", description: "Titles structured to marketplace rules and search behaviour." },
      { title: "Bullet points and descriptions", description: "Benefit-led copy with key specifications." },
      { title: "Attribute completion", description: "Every relevant attribute filled so products appear in filtered searches." },
      { title: "Listing images and infographics", description: "White-background images and feature graphics." },
      { title: "Variation setup", description: "Size and colour variations grouped correctly." },
    ],
    benefits: [
      { title: "Found in more searches", description: "Relevant keywords and attributes improve discoverability." },
      { title: "Fewer customer questions", description: "Clear listings reduce pre-sale queries and returns." },
      { title: "Marketplace compliant", description: "Listings follow each platform's style guide." },
    ],
    faqs: [
      { question: "Which marketplaces do you list on?", answer: "Amazon, Flipkart, Myntra, Meesho, Ajio, JioMart and Shopify, among others." },
      { question: "Do you charge per listing?", answer: "Pricing can be per listing or per batch depending on volume. Share your product count for a quote." },
      { question: "Can you list from a spreadsheet?", answer: "Yes. Send your product data and images and we will prepare the marketplace templates." },
    ],
  },
  {
    slug: "marketplace-catalogue-management", name: "Marketplace Catalogue Management", category: "ecommerce-management", form: "ecommerce", icon: "Layers",
    tagline: "Large catalogues kept accurate, consistent and error-free.",
    short: "Bulk catalogue creation, updates and error resolution across marketplaces.",
    intro: "As catalogues grow, errors multiply: wrong categories, broken variations, missing attributes and outdated prices. We manage catalogues of all sizes with bulk templates, regular audits and quick resolution of marketplace errors.",
    offerings: [
      { title: "Bulk uploads", description: "Large product sets prepared and uploaded through marketplace templates." },
      { title: "Catalogue audits", description: "Finding missing attributes, duplicates and suppressed listings." },
      { title: "Error resolution", description: "Fixing upload errors and raising cases with seller support." },
      { title: "Price and stock updates", description: "Scheduled bulk updates across channels." },
      { title: "Catalogue standardisation", description: "Consistent naming, attributes and images across platforms." },
    ],
    benefits: [
      { title: "Scales with you", description: "Processes built for hundreds or thousands of SKUs." },
      { title: "Cleaner data", description: "Consistent product data improves search and reduces returns." },
      { title: "Less manual work", description: "Bulk processes replace one-by-one edits." },
    ],
    faqs: [
      { question: "How big a catalogue can you handle?", answer: "We work with catalogues from a few dozen to several thousand SKUs, planned in batches." },
      { question: "Do you need access to my seller accounts?", answer: "Yes, with user permissions where available, so we can upload and fix listings directly." },
      { question: "Can you migrate a catalogue to a new marketplace?", answer: "Yes. We map your existing product data to the new marketplace's template." },
    ],
  },
];

export const SERVICE_FAQS: Record<string, { question: string; answer: string }[]> = Object.fromEntries(S.map((s) => [s.slug, s.faqs]));

export const FALLBACK_CATEGORIES: ServiceCategory[] = [
  { id: "web-development", name: "Web Development", slug: "web-development", icon: "Code2", display_order: 1,
    short_description: "Fast, secure, conversion-focused websites and online stores built to grow with your business.",
    highlights: ["Business Website Development", "WordPress Development", "Shopify Development", "E-commerce Website Development", "Custom Website Development", "Website Maintenance"] },
  { id: "graphic-design-branding", name: "Graphic Design & Branding", slug: "graphic-design-branding", icon: "Palette", display_order: 2,
    short_description: "Visual identities, creatives and marketplace imagery that make your brand recognisable.",
    highlights: ["Logo Design", "Social Media Creatives", "Branding & Identity", "Product Listing Images", "Amazon A+ Content", "Marketing Banners"] },
  { id: "digital-marketing", name: "Digital Marketing", slug: "digital-marketing", icon: "TrendingUp", display_order: 3,
    short_description: "Search, social and paid campaigns focused on reach, quality leads and measurable growth.",
    highlights: ["SEO", "Google Ads", "Meta Ads", "Performance Marketing", "Social Media Marketing", "Lead Generation"] },
  { id: "ecommerce-management", name: "E-commerce Management", slug: "ecommerce-management", icon: "ShoppingBag", display_order: 4,
    short_description: "End-to-end marketplace and store management across Amazon, Myntra, Flipkart and Shopify.",
    highlights: ["Amazon Seller Account Management", "Myntra Seller Account Management", "Flipkart Account Management", "Shopify Store Management", "Product Listing & Catalogue Management", "Marketplace SEO"] },
];

/** Landing link for each category card on the homepage. */
export const CATEGORY_LINK: Record<string, string> = {
  "web-development": "/services/website-development",
  "graphic-design-branding": "/services/graphic-design",
  "digital-marketing": "/services/digital-marketing",
  "ecommerce-management": "/services/ecommerce-management",
};

export const FALLBACK_SERVICES: Service[] = S.map((s, i) => ({
  id: s.slug, category_id: s.category, name: s.name, slug: s.slug, tagline: s.tagline,
  short_description: s.short, intro: s.intro, offerings: s.offerings, features: [], benefits: s.benefits,
  process: [], form_type: s.form, icon: s.icon, hero_image_url: null, show_in_nav: true, display_order: i + 1,
  seo_title: null, seo_description: null, og_image_url: null,
}));

/** Fill empty DB fields from built-in content so a service page is never blank. */
export function withServiceDefaults(svc: Service): Service {
  const base = FALLBACK_SERVICES.find((f) => f.slug === svc.slug);
  const pick = <T,>(a: T[] | null | undefined, b: T[] | undefined) => (a && a.length ? a : b ?? []);
  return {
    ...svc,
    tagline: svc.tagline || base?.tagline || null,
    short_description: svc.short_description || base?.short_description || null,
    intro: svc.intro || base?.intro || null,
    offerings: pick(svc.offerings, base?.offerings),
    benefits: pick(svc.benefits, base?.benefits),
    process: pick(svc.process, CATEGORY_PROCESS[categorySlugFor(svc) ?? ""] ?? CATEGORY_PROCESS["web-development"]),
    icon: svc.icon || base?.icon || "Sparkles",
  };
}

function categorySlugFor(svc: Service) {
  const base = FALLBACK_SERVICES.find((f) => f.slug === svc.slug);
  return base?.category_id ?? FALLBACK_CATEGORIES.find((c) => c.id === svc.category_id)?.slug ?? null;
}

export const FALLBACK_SLIDES: Slide[] = [
  { id: "s1", eyebrow: null, heading: "Build Your Digital Presence With HRIDAYA IT SOLUTIONS.", description: "From powerful websites to result-driven digital marketing, we help businesses grow online.", primary_cta_label: "Explore Our Services", primary_cta_href: "/services", secondary_cta_label: "Get Started", secondary_cta_href: "/contact", background_image_url: null, visual_variant: "orbit" },
  { id: "s2", eyebrow: null, heading: "Turn Your Ideas Into Powerful Digital Experiences.", description: "Creative design and modern website development solutions for ambitious businesses.", primary_cta_label: "Start Your Project", primary_cta_href: "/contact", secondary_cta_label: null, secondary_cta_href: null, background_image_url: null, visual_variant: "grid" },
  { id: "s3", eyebrow: null, heading: "Grow Your Business Across Digital Platforms.", description: "From Amazon and Myntra to Shopify, we manage your complete e-commerce journey.", primary_cta_label: "Explore E-commerce Solutions", primary_cta_href: "/services/ecommerce-management", secondary_cta_label: null, secondary_cta_href: null, background_image_url: null, visual_variant: "marketplace" },
  { id: "s4", eyebrow: null, heading: "Your Business Deserves More Than Just Marketing.", description: "Build your brand, reach more customers and generate quality leads with our digital solutions.", primary_cta_label: "Talk To Our Experts", primary_cta_href: "/contact", secondary_cta_label: null, secondary_cta_href: null, background_image_url: null, visual_variant: "pulse" },
];

export const FALLBACK_INDUSTRIES: Industry[] = [
  ["Healthcare & Medical", "healthcare-medical", "Stethoscope", true], ["E-commerce & Retail", "ecommerce-retail", "ShoppingBag", true],
  ["Fashion & Jewellery", "fashion-jewellery", "Gem", true], ["Education", "education", "GraduationCap", true],
  ["Real Estate", "real-estate", "Building2", true], ["Startups", "startups", "Rocket", true],
  ["Small & Medium Businesses", "small-medium-businesses", "Store", true], ["Professional Services", "professional-services", "Briefcase", true],
  ["Technology", "technology", "Cpu", false], ["Other Industries", "other", "Layers", false],
].map(([name, slug, icon, home], i) => ({ id: slug as string, name: name as string, slug: slug as string, icon: icon as string, show_on_home: home as boolean, display_order: i + 1 }));

export const INDUSTRY_COPY: Record<string, string> = {
  "healthcare-medical": "Clinic websites, appointment enquiries and local search for doctors and diagnostic centres.",
  "ecommerce-retail": "Online stores, marketplace accounts and ads that move stock.",
  "fashion-jewellery": "Catalogue-ready imagery, Myntra listings and Instagram-first branding.",
  education: "Admission enquiry campaigns and clear course information for institutes and coaches.",
  "real-estate": "Project landing pages and lead campaigns for builders and brokers.",
  startups: "Launch-ready brands, MVP websites and early growth marketing.",
  "small-medium-businesses": "Affordable, complete digital setups for local and regional businesses.",
  "professional-services": "Credible websites and lead generation for consultants, CAs and law firms.",
};

export const FALLBACK_PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  { id: "website-development", name: "Website Development", slug: "website-development" },
  { id: "graphic-design", name: "Graphic Design", slug: "graphic-design" },
  { id: "digital-marketing", name: "Digital Marketing", slug: "digital-marketing" },
  { id: "ecommerce", name: "E-commerce", slug: "ecommerce" },
  { id: "social-media-creatives", name: "Social Media Creatives", slug: "social-media-creatives" },
];

export const WHY_CHOOSE = [
  { icon: "Boxes", title: "Complete digital solutions under one roof", description: "Website, design, marketing and marketplaces handled by one coordinated team." },
  { icon: "Users", title: "Creative and technical team", description: "Designers, developers and marketers who plan together from the first call." },
  { icon: "Target", title: "Business-focused approach", description: "Work is planned around enquiries, sales and visibility, not vanity metrics." },
  { icon: "Wallet", title: "Affordable, flexible packages", description: "Start with what you need now and add services as you grow." },
  { icon: "MapPin", title: "Remote services across India", description: "Based in Noida, working with businesses anywhere in India." },
  { icon: "MessageSquare", title: "Transparent communication", description: "Clear timelines, regular updates and reports in plain language." },
  { icon: "LifeBuoy", title: "Long-term support", description: "We stay after launch for updates, fixes and growth." },
];

export const WORK_PROCESS: Item[] = [
  { title: "Understand your business", description: "Your goals, customers, competitors and current digital presence." },
  { title: "Discuss requirements", description: "Scope, priorities, budget and timelines agreed in writing." },
  { title: "Strategy and planning", description: "A clear plan for pages, campaigns or catalogue work before execution." },
  { title: "Design and development", description: "Creative and technical work with your feedback at each milestone." },
  { title: "Testing and execution", description: "Quality checks across devices, platforms and tracking." },
  { title: "Launch and ongoing support", description: "Go live, measure and keep improving." },
];

export const TRUST_POINTS = [
  { title: "You always know what is happening", description: "A single point of contact, shared timelines and updates at every milestone, over WhatsApp, email or calls." },
  { title: "Remote, without the distance", description: "Video calls, shared folders and screen-share walkthroughs make remote work as clear as sitting together in Noida." },
  { title: "Accounts stay in your name", description: "Domains, ad accounts, seller accounts and design files belong to you. We work inside them with permissions." },
  { title: "Honest expectations", description: "We explain what each service can realistically do and how long it takes. We do not promise rankings or guaranteed sales." },
];

export const HOME_FAQS = [
  { question: "How much does website development cost?", answer: "Cost depends on the number of pages, design complexity and features such as payments or bookings. Share your requirements and we will send an itemised quote, usually within one working day." },
  { question: "What digital marketing services do you offer?", answer: "SEO, Google Ads, Meta Ads, social media management, performance marketing and lead generation, planned together or individually." },
  { question: "Do you offer SEO for local businesses in Noida and Delhi NCR?", answer: "Yes. Local SEO includes Google Business Profile optimisation, location pages and local citations. We also serve businesses in other cities across India." },
  { question: "Can you manage my Amazon and Myntra seller accounts?", answer: "Yes. We manage listings, A+ content, advertising and account health on Amazon, Myntra, Flipkart and other marketplaces." },
  { question: "Do you build Shopify stores?", answer: "Yes. We set up and customise Shopify stores, configure Indian payment gateways and shipping, and can manage the store after launch." },
  { question: "Do you work with businesses outside Noida?", answer: "Yes. We work remotely with clients across India using video calls, WhatsApp and shared project tools." },
  { question: "How long do projects take?", answer: "A business website typically takes a few weeks; logo projects one to three weeks; marketing and marketplace management are ongoing monthly services. Exact timelines are agreed before starting." },
  { question: "How do payments and packages work?", answer: "Projects are usually billed in milestones, starting with an advance. Ongoing services are billed monthly. Packages are flexible and quoted based on your scope." },
];

export const NAV_SEO_TOOLS = [
  { name: "Website SEO Audit", href: "/seo-tools/audit", description: "Instant technical and on-page check of any page." },
  { name: "Keyword Research Tool", href: "/seo-tools/keywords", description: "AI keyword ideas grouped by intent and location." },
  { name: "SEO Score Checker", href: "/seo-tools/score", description: "How well a page targets a keyword, with competitor comparison." },
];
