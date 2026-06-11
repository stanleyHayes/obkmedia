/**
 * Brand content sourced from the OBK MEDIA client information request document.
 * Centralized so copy changes never require touching components.
 */

export const BRAND = {
  name: 'OBK MEDIA',
  tagline: 'The Master’s Touch You Need',
  intro:
    'OBK MEDIA is a professional media brand focused on capturing authentic moments and creating powerful visual stories.',
  heroHeadline: 'Capturing Moments That Live Beyond Time',
  heroSubheadline:
    'Professional photography and visual storytelling that transforms life’s most meaningful moments into timeless works of art.',
  primaryCta: 'Book a Shoot',
  secondaryCta: 'View Portfolio',
  yearsExperience: 4,
  location: 'Abuakwa-Nkawie, Ghana',
  areasServed: 'Nationwide',
  email: 'Obkmedia30@gmail.com',
  phone: '0546175921',
  phoneIntl: '+233 54 617 5921',
  whatsappUrl: 'https://wa.me/233546175921',
  mapsUrl: 'https://maps.app.goo.gl/HMybFXDbMB5n1Sgg6',
  hours: 'Available 24 hours, nationwide',
  seoKeyword: 'Wedding Photography Kumasi',
} as const;

export const SOCIALS = [
  { name: 'TikTok', url: 'https://www.tiktok.com/@obkmedia' },
  { name: 'YouTube', url: 'https://www.youtube.com/channel/UCKc_qTRt39Dx6XrVf9maJnA' },
  { name: 'Facebook', url: 'https://www.facebook.com' }, // profile: Onboard Onboard
] as const;

export const ABOUT = {
  story: [
    'At OBK MEDIA, we believe every moment has a story worth telling. We are a creative photography and videography brand dedicated to capturing genuine emotions, unforgettable memories, and powerful visual experiences.',
    'From weddings and engagements to portraits, events, commercial projects, and cinematic productions, our goal is to transform ordinary moments into timeless masterpieces. We combine creativity, passion, and attention to detail to deliver images and films that not only look beautiful but also tell meaningful stories.',
    'OBK MEDIA doesn’t just take photos or record videos — we preserve emotions, celebrate milestones, and create memories that last a lifetime.',
  ],
  mission:
    'To provide high-quality visual storytelling that inspires, connects, and leaves a lasting impact.',
  vision:
    'To become a trusted and leading creative media brand known for excellence, innovation, and authentic storytelling.',
  difference:
    'At OBK MEDIA, your story isn’t just another project — it’s a legacy worth preserving.',
} as const;

export const SERVICES = [
  {
    title: 'Wedding Videography',
    description:
      'Cinematic films of traditional, white, and destination weddings — including beautiful engagement and pre-wedding storytelling sessions that celebrate your love journey.',
  },
  {
    title: 'Portrait Photography',
    description:
      'Directed studio and location portraits with sculpted light — presence, heritage, and personality in every frame.',
  },
  {
    title: 'Event Photography',
    description:
      'Full coverage of ceremonies, celebrations, and milestones — every speech, embrace, and dance preserved.',
  },
  {
    title: 'Documentary Photography',
    description:
      'Honest, unscripted visual records of real life — funerals, festivals, and family histories told with dignity.',
  },
  {
    title: 'Corporate Media Production',
    description:
      'Brand films, conference coverage, and executive portraits that elevate how your organisation is seen.',
  },
  {
    title: 'Social Media Photography',
    description:
      'Scroll-stopping content created for your feed — consistent, on-brand imagery delivered ready to post.',
  },
] as const;

export const TESTIMONIALS = [
  {
    name: 'Sarah & Michael',
    role: 'Wedding Clients',
    quote:
      'OBK MEDIA exceeded our expectations. Every photo captured the emotions of our special day perfectly. Looking through our wedding album feels like reliving every beautiful moment again.',
    rating: 5,
  },
] as const;

export const AWARDS = [
  {
    title: 'Best Video Director Award',
    body: 'Ghana Impact Makers and Professionals Awards — for excellence in video production, visual storytelling, and creative direction.',
  },
  {
    title: 'Youth Photographer Award',
    body: 'Ghana Youth Leaders Excellence Professionals Awards — recognising exceptional creativity, innovation, and contribution to photography.',
  },
] as const;

export const AWARDS_QUOTE = 'Every award is a reminder that great stories deserve to be told beautifully.';

export const BOOKING_POLICY = [
  'To officially secure your date and initiate production services, a non-refundable deposit of 50% of the total project fee is required, alongside a signed services agreement.',
  'Dates are strictly booked on a first-come, first-served basis; no dates, gear, or calendar slots will be reserved or guaranteed until both the deposit has cleared and the contract is executed.',
  'The remaining balance is due in full prior to the event date or upon the completion of production, before final unwatermarked deliverables are released. Cancellation or rescheduling notice must be provided in writing within the timeframe specified in your contract; failure to do so will result in the forfeiture of the deposit.',
] as const;

export const SHOOT_TYPES = [
  'General Inquiry',
  'Wedding Photography',
  'Wedding Videography',
  'Engagement / Pre-Wedding',
  'Portrait Session',
  'Event Coverage',
  'Funeral Coverage',
  'Fashion / Editorial',
  'Real Estate',
  'Corporate / Media Production',
  'Collaboration',
] as const;

export const BUDGET_RANGES = [
  'Under GH₵ 2,000',
  'GH₵ 2,000 – 5,000',
  'GH₵ 5,000 – 10,000',
  'GH₵ 10,000+',
  'Not sure yet',
] as const;
