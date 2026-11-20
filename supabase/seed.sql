-- =====================================================================
-- Seed: only facts from the brief. No clients, stats, testimonials or
-- portfolio items are seeded — those sections render labelled demo
-- placeholders until the admin adds real entries.
-- =====================================================================

insert into public.site_settings (key, value, is_public) values
  ('company',  '{"name":"HRIDAYA IT SOLUTIONS","tagline":"Your Complete Digital Growth Partner.","location":"Noida, Uttar Pradesh, India","coverage":"All India (Remote Services)"}', true),
  ('contact',  '{"email":"kaushalkumar2207@gmail.com","phone":null,"whatsapp":null,"map_embed_url":null}', true),
  ('social',   '{"instagram":null,"facebook":null,"linkedin":null,"youtube":null,"x":null}', true),
  ('branding', '{"logo_url":null,"favicon_url":null}', true),
  ('notifications', '{"lead_recipients":["kaushalkumar2207@gmail.com"],"from_name":"HRIDAYA IT SOLUTIONS"}', false)
on conflict (key) do nothing;

insert into public.industries (name, slug, show_on_home, display_order) values
  ('Healthcare & Medical',      'healthcare-medical',       true,  1),
  ('E-commerce & Retail',       'ecommerce-retail',         true,  2),
  ('Fashion & Jewellery',       'fashion-jewellery',        true,  3),
  ('Education',                 'education',                true,  4),
  ('Real Estate',               'real-estate',              true,  5),
  ('Startups',                  'startups',                 true,  6),
  ('Small & Medium Businesses', 'small-medium-businesses',  true,  7),
  ('Professional Services',     'professional-services',    true,  8),
  ('Technology',                'technology',               false, 9),
  ('Other Industries',          'other',                    false, 10)
on conflict (slug) do nothing;

insert into public.service_categories (name, slug, short_description, icon, highlights, display_order) values
  ('Web Development', 'web-development',
   'Fast, secure, conversion-focused websites and online stores built to grow with your business.', 'Code2',
   '["Business Website Development","WordPress Development","Shopify Development","E-commerce Website Development","Custom Website Development","Website Maintenance"]', 1),
  ('Graphic Design & Branding', 'graphic-design-branding',
   'Visual identities, creatives and marketplace imagery that make your brand recognisable.', 'Palette',
   '["Logo Design","Social Media Creatives","Branding & Identity","Product Listing Images","Amazon A+ Content","Marketing Banners"]', 2),
  ('Digital Marketing', 'digital-marketing',
   'Search, social and paid campaigns focused on reach, quality leads and measurable growth.', 'TrendingUp',
   '["SEO","Google Ads","Meta Ads","Performance Marketing","Social Media Marketing","Lead Generation"]', 3),
  ('E-commerce Management', 'ecommerce-management',
   'End-to-end marketplace and store management across Amazon, Myntra, Flipkart and Shopify.', 'ShoppingBag',
   '["Amazon Seller Account Management","Myntra Seller Account Management","Flipkart Account Management","Shopify Store Management","Product Listing & Catalogue Management","Marketplace SEO"]', 4)
on conflict (slug) do nothing;

with c as (select id, slug from public.service_categories)
insert into public.services (category_id, name, slug, short_description, form_type, icon, published, display_order)
select c.id, s.name, s.slug, s.descr, s.ft::public.form_type, s.icon, true, s.ord
from (values
  ('web-development',         'Website Development',             'website-development',             'Custom business websites designed, built and maintained for performance and leads.', 'website',  'Globe',         1),
  ('web-development',         'WordPress Development',           'wordpress-development',           'Flexible WordPress sites you can update yourself, built on clean, secure foundations.', 'website', 'LayoutTemplate', 2),
  ('web-development',         'Shopify Development',             'shopify-development',             'Shopify stores set up, themed and configured for smooth selling.', 'website',              'Store',          3),
  ('graphic-design-branding', 'Graphic Design',                  'graphic-design',                  'Social creatives, banners and marketing designs aligned with your brand.', 'design',      'PenTool',        4),
  ('graphic-design-branding', 'Branding & Logo Design',          'branding-logo-design',            'Logos and brand identity systems that give your business a consistent look.', 'design',   'Sparkles',       5),
  ('digital-marketing',       'Digital Marketing',               'digital-marketing',               'Integrated online marketing planned around your goals and audience.', 'marketing',         'Megaphone',      6),
  ('digital-marketing',       'SEO Services',                    'seo-services',                    'Technical, on-page and local SEO to improve organic visibility.', 'seo',                  'Search',         7),
  ('digital-marketing',       'Google Ads Management',           'google-ads-management',           'Search, display and shopping campaigns set up and managed for efficient spend.', 'marketing', 'MousePointerClick', 8),
  ('digital-marketing',       'Meta Ads Management',             'meta-ads-management',             'Facebook and Instagram ad campaigns built around targeting and creative testing.', 'marketing', 'Target',      9),
  ('digital-marketing',       'Social Media Management',         'social-media-management',         'Content planning, posting and community management for your social channels.', 'social', 'Share2',        10),
  ('ecommerce-management',    'E-commerce Management',           'ecommerce-management',            'Day-to-day operations support across your online sales channels.', 'ecommerce',         'ShoppingCart',  11),
  ('ecommerce-management',    'Amazon Account Management',       'amazon-account-management',       'Amazon seller account setup, listings, A+ content and advertising support.', 'ecommerce', 'Package',       12),
  ('ecommerce-management',    'Myntra Account Management',       'myntra-account-management',       'Myntra seller onboarding, catalogue and account operations support.', 'ecommerce',        'Shirt',         13),
  ('ecommerce-management',    'Flipkart Account Management',     'flipkart-account-management',     'Flipkart seller account, listing and advertising management.', 'ecommerce',              'Truck',         14),
  ('ecommerce-management',    'Product Listing Services',        'product-listing-services',        'Optimised product titles, descriptions, attributes and images for marketplaces.', 'ecommerce', 'ListChecks', 15),
  ('ecommerce-management',    'Marketplace Catalogue Management', 'marketplace-catalogue-management', 'Bulk catalogue creation, updates and error resolution across marketplaces.', 'ecommerce', 'Layers',        16)
) as s(cat, name, slug, descr, ft, icon, ord)
join c on c.slug = s.cat
on conflict (slug) do nothing;

insert into public.portfolio_categories (name, slug, display_order) values
  ('Website Development',     'website-development',     1),
  ('Graphic Design',          'graphic-design',          2),
  ('Digital Marketing',       'digital-marketing',       3),
  ('E-commerce',              'ecommerce',               4),
  ('Social Media Creatives',  'social-media-creatives',  5)
on conflict (slug) do nothing;

insert into public.homepage_slides
  (heading, description, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, visual_variant, display_order)
values
  ('Build Your Digital Presence With HRIDAYA IT SOLUTIONS.',
   'From powerful websites to result-driven digital marketing, we help businesses grow online.',
   'Explore Our Services', '/services', 'Get Started', '/contact', 'orbit', 1),
  ('Turn Your Ideas Into Powerful Digital Experiences.',
   'Creative design and modern website development solutions for ambitious businesses.',
   'Start Your Project', '/contact', null, null, 'grid', 2),
  ('Grow Your Business Across Digital Platforms.',
   'From Amazon and Myntra to Shopify, we manage your complete e-commerce journey.',
   'Explore E-commerce Solutions', '/services/ecommerce-management', null, null, 'marketplace', 3),
  ('Your Business Deserves More Than Just Marketing.',
   'Build your brand, reach more customers and generate quality leads with our digital solutions.',
   'Talk To Our Experts', '/contact', null, null, 'pulse', 4);
