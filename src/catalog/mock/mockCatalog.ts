import type { Product } from '../types'

/** Mock catalog (~shop grid). Filters use styleTags / sizeTags / colorTags. */
const products: Product[] = [
  {
    id: 'p_101',
    slug: 'kinetik-v1',
    title: 'Kinetik V1',
    variantLine: 'Cyber / Orange',
    description:
      'Neon-accent runner with breathable mesh upper and resilient street sole.',
    price: { currency: 'USD', amount: 220 },
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTMY4NgJizeorTYfvWtscUqc8hh9jHgc_vA9HDDtJkh73OI-1FzULD-Re3xinbCbkbEnnymd2VV6K6HpJ6P3ocGFT76pL3LBwZsalC-c57ECbuE_rV9bjFGN5J8LKsQ7Snmwyx3zYE74G4vVcd_jSKiSzqmD-6KhduCoAxNFn36KSTbJf3o6JawgPtNNcDHsPqKP59mGjNNzHWNTtWpclhjqZQT8ghxmykxI5D1BNCQ1VcGZilu63DJaBr4AOh6KP10ZfEJ2nwEDk',
        alt: 'Neon orange running shoe on dark industrial background.',
      },
    ],
    listingTone: 'tertiaryFixedDim',
    listingBadge: { kind: 'new_release', label: 'New Release' },
    inStock: true,
    styleTags: ['low-top-tech'],
    sizeTags: ['7', '8', '9', '10', '11', '12'],
    colorTags: ['coral'],
    tags: ['new', 'runner'],
  },
  {
    id: 'p_102',
    slug: 'apex-shell',
    title: 'Apex Shell',
    variantLine: 'Lilac / Frost',
    description:
      'Chunky profile with tonal overlays and frost-finished accents.',
    price: { currency: 'USD', amount: 185 },
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0arpkSjIEK1Yx4915jo9Gc51fokK6YAjggD6yfzr3i34Pq-85cDqvZbg7K2JsXvn8eQBGiW_0QJ5L_rCPmnLM63aPnt4COVTZPXh1mxg-Q2xFGD-N_mrd_h5uRfsrDUwMrdUlKnSs_ZyK1NqgnLPfut5BumpAjbz4wZAMJoikKO_cLbo8YwXWzKz1S0dCOdOza88X1BRAsjmh_O-jh1nA_xYKve56m3u7-vKzrRBuGA94DdsjK3Yl4YOwS73ZwmPh0e9qWnE13B0',
        alt: 'White and lilac chunky sneaker on concrete pedestal.',
      },
    ],
    listingTone: 'secondaryFixedDim',
    inStock: true,
    styleTags: ['high-rise-runner'],
    sizeTags: ['7', '8', '9', '10'],
    colorTags: ['light'],
    tags: ['lifestyle'],
  },
  {
    id: 'p_103',
    slug: 'void-run',
    title: 'Void Run',
    variantLine: 'Eclipse / Chrome',
    description:
      'Low-key monochrome build with reflective chrome piping.',
    price: { currency: 'USD', amount: 240 },
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGpSvwWJwZnwdd_7Idwpe_Uawsn7jC2jYhIeVqLmJl9eo1-REXfVjZK0Jpv3nMrgYiZvQlq4wJnOGXyI1t_wxAUKsYPxm4ifi81XsM4HyGWINxnbbjy8dmBPD_vjmJ5qz8gOif4LdmFY7VuefgVdB368N_1mfi4Q0UxLNA93gW4mRs29eiNegc1D4llg55Aqsov7BOrWGuychYDMN_w_AyRbB_wy_TKNIFiclx4vKAd-YAylvzD1w5LO2tEHWWFLFhvhbU-Io8qtg',
        alt: 'Black and chrome technical sneaker with rim lighting.',
      },
    ],
    listingTone: 'surfaceHighest',
    listingBadge: { kind: 'sold_out', label: 'Sold Out' },
    inStock: false,
    styleTags: ['low-top-tech'],
    sizeTags: ['8', '9', '11'],
    colorTags: ['black'],
    tags: ['tech'],
  },
  {
    id: 'p_104',
    slug: 'monolith',
    title: 'Monolith',
    variantLine: 'Charcoal / Onyx',
    description:
      'High-top boot silhouette in charcoal suede with structured sole stack.',
    price: { currency: 'USD', amount: 310 },
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfoOttC3f9fsWmSYXc1qig2rITjMYtXjIKj1KXucInAJT6sEzrJGBmCvcz4eCbErLhSR_aLnAqgCCE3OqgRhoEPJr_X7NA0Vxx9BA8oSR5RfmBoZZ4kEqZfEXdQ8GRtIXQjtkcV3C4mNrIuT-3cLGns3kTZFOitjs-tGAe8u3lyvTZyjPpd4tMKgiLymL0k7vn8NgbQQgEVBuf3BQgG8sh-Zx9NOuySMKRvPup7RokfMUBU_UD4rsZOnV1OQ0qyvFgo2vTa-aW6LU',
        alt: 'Charcoal suede high-top boot on minimal studio floor.',
      },
    ],
    listingTone: 'primaryFixed',
    inStock: true,
    styleTags: ['brutalist-boot'],
    sizeTags: ['9', '10', '11', '12'],
    colorTags: ['black'],
    tags: ['boot'],
  },
  {
    id: 'p_105',
    slug: 'neon-flux',
    title: 'Neon Flux',
    variantLine: 'Volt / Cobalt',
    description:
      'Performance-forward upper with asym color blocking and breathable knit.',
    price: { currency: 'USD', amount: 190 },
    images: [
      {
        src: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80',
        alt: 'Bold colorful athletic sneaker with strong contrast and streetwear feel.',
      },
    ],
    listingTone: 'tertiaryFixed',
    inStock: true,
    styleTags: ['high-rise-runner'],
    sizeTags: ['7', '8', '9', '10', '11'],
    colorTags: ['lime'],
    tags: ['runner'],
  },
  {
    id: 'p_106',
    slug: 'stealth-walk',
    title: 'Stealth Walk',
    variantLine: 'Triple Black',
    description:
      'All-black leather panels with matte and gloss texture play.',
    price: { currency: 'USD', amount: 215 },
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNqyvb2TIISDiJ01NJRsP6qia_kPqUtpyu8JAzt7BKbks1RzIE0Y9CIDp2UGxOddybgzTm5i3NK7LVfXbj2QVkIpC1Ib0h06H5GuHm0iorc-okjb-8EC5Qevb4ibHthNJK2BnCu76qCtcnzNb5xwJSIaKuzjnbBrtBrdhUcIV9JzDGOqSLN6_yCTAOWYlZqT2L9eFhA-BSJjlJG7Y8I0c3aPDDjRg9fpKQp3k7Ub-LBKUka04abXbqHB96JgYfzb9uCUhThz9ikh0',
        alt: 'All-black leather sneaker with varied textures.',
      },
    ],
    listingTone: 'surfaceHigh',
    inStock: true,
    styleTags: ['low-top-tech'],
    sizeTags: ['8', '9', '10', '11', '12'],
    colorTags: ['black'],
    tags: ['leather'],
  },
  {
    id: 'p_onyx',
    slug: 'onyx-flux-01',
    title: 'Onyx Flux 01',
    variantLine: 'Signal / Optical',
    description:
      'The architectural evolution of speed. Featuring our proprietary Kinetic-Cell™ cushioning and a reinforced nylon exoskeleton for maximum energy return. Designed for the urban athlete.',
    price: { currency: 'USD', amount: 340 },
    images: [
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASI5hT7iA095kbwcDCaN5UcFaRTGReityHsyoNxjeIo6rz_umaY9n-2LoIk7cmdGcocHR6kDVyII6_tJZ-8ZEsldzGFh7arYHVKzMl7y0q8IKgBe_uMeIXahmFNjadglIdfBG5RwFr90dhXFJemjDbKSdocqjefns4s4RF3smpJbmxPCMwBE8scq1f7hdBsvCOm4JXVT1h4u9jH-_1NlpJtUYbCBQfWi4AmfUf-QDUdEqYaBVNvwPT3WHqf66y2VihqboAtikaZak',
        alt: 'Futuristic premium sneaker with geometric white upper and vivid orange accents on dark studio backdrop.',
      },
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA80IZMQqnPzls4cae4zc8fVCMavlr-cwixHhB1Rt1VYxVNKPUU-SND9OW1_UccpRjowiMz3MQqOJWvfCBWlZLuujyvyGbFlq3ju-hxZEL_SOENgmySlTsSi-HWS0_AcogtUjjPkC7h0pm89tzksi9UrpZZjpZGaOCZk5FxPU9kY40EDnVcLe41x1WVLNDSL0Ra4zJ13evE3GyDicgr55bZdxcKeBUamxJ3hy0aHSUe98KIT7_Hg3nrkMS_GQt2Jm2PYiObDul2mL4',
        alt: 'Heel macro of premium streetwear sneaker with mesh textures and translucent orange sole.',
      },
      {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgz6S1Zbn317O3qGZhtjnKvrfDytRbI2DiT99mk-wGan5xnAiZVITkLiYz5IUbMnvYslTWljdjoXbG1N1bB02pt8JpGl1A7uDtDDQhZ3iWKy114wf6eBrzA4WaSH3bm0NyYYtIzWfw8gk89t9dxTSUsPbunflVfVN0CLCIdPbgarKItzXcgWNpWzdKLOOt8liyq08VwEsv2zJxKMLdjkkWSIEP24-VoEgSB3gfId-l7guoolQuO2QdPpfZH3M5l7PFTqrAKemWTk4',
        alt: 'Tongue and lacing detail on high-end sneaker with leather overlays and orange accents.',
      },
    ],
    listingTone: 'tertiaryFixedDim',
    listingBadge: { kind: 'new_release', label: 'New Release' },
    detailBadge: { label: 'Limited Drop', variant: 'secondary' },
    inStock: true,
    styleTags: ['low-top-tech'],
    sizeTags: ['7', '8', '9', '10', '11', '12', '13', '14'],
    pdpSizesDisabled: ['13'],
    defaultSizeUs: '10',
    stockRemaining: 12,
    stockFillPercent: 25,
    colorTags: ['coral', 'light'],
    reviewsSummary: { average: '4.9', count: 124 },
    tags: ['flagship', 'limited'],
  },
]

export async function mockListProducts(): Promise<Product[]> {
  return products
}

export async function mockGetProductById(id: string): Promise<Product | null> {
  return products.find((p) => p.id === id || p.slug === id) ?? null
}
