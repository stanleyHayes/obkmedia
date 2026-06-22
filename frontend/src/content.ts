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
  { name: 'Facebook', url: 'https://web.facebook.com/obkmedia99' },
] as const;

// Client names/ratings for testimonials. The quote and role text are translated
// in i18n/resources.ts (testimonials.quote / testimonials.role).
export const TESTIMONIALS = [{ name: 'Sarah & Michael', rating: 5 }] as const;

// Booking/deposit policy, shown on the Terms page (English legal copy).
export const BOOKING_POLICY = [
  'To officially secure your date and initiate production services, a non-refundable deposit of 50% of the total project fee is required, alongside a signed services agreement.',
  'Dates are strictly booked on a first-come, first-served basis; no dates, gear, or calendar slots will be reserved or guaranteed until both the deposit has cleared and the contract is executed.',
  'The remaining balance is due in full prior to the event date or upon the completion of production, before final unwatermarked deliverables are released. Cancellation or rescheduling notice must be provided in writing within the timeframe specified in your contract; failure to do so will result in the forfeiture of the deposit.',
] as const;
