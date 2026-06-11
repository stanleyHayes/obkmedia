import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { BOOKING_POLICY, BRAND } from '../content';
import Seo from '../seo/Seo';
import { palette } from '../theme';

interface LegalSection {
  heading: string;
  body: string[];
}

const PRIVACY: LegalSection[] = [
  {
    heading: 'Information we collect',
    body: [
      `When you contact ${BRAND.name} through our website, we collect the details you provide — your name, email address, phone number, and the information you share about your project. We also record basic technical data (IP address and browser type) to protect the form from abuse.`,
    ],
  },
  {
    heading: 'How we use your information',
    body: [
      'Your details are used solely to respond to your inquiry, prepare quotes, and deliver our photography and videography services. We do not sell, rent, or share your personal information with third parties for marketing purposes.',
    ],
  },
  {
    heading: 'Data storage and retention',
    body: [
      'Inquiry messages are stored securely and retained only as long as needed to serve you. You may request deletion of your data at any time by emailing us.',
    ],
  },
  {
    heading: 'Analytics',
    body: [
      'We use Google Analytics to understand how visitors use our website so we can improve it. Analytics data is aggregated and does not personally identify you.',
    ],
  },
  {
    heading: 'Contact',
    body: [`For any privacy questions or data requests, contact ${BRAND.email}.`],
  },
];

const TERMS: LegalSection[] = [
  {
    heading: 'Bookings and deposits',
    body: [...BOOKING_POLICY],
  },
  {
    heading: 'Image usage and copyright',
    body: [
      `All photographs, videos, and creative works produced by ${BRAND.name} are protected by copyright and remain the intellectual property of ${BRAND.name} unless otherwise agreed in writing.`,
      'Images displayed on this website — including portfolio and gallery images — are watermarked and may not be downloaded, reproduced, edited, or used in any form without prior written permission.',
      'Clients receive a personal-use licence for their delivered images unless a commercial licence is agreed. Final unwatermarked deliverables are released only after full payment.',
    ],
  },
  {
    heading: 'Deliverables and timelines',
    body: [
      'Delivery timelines are specified in your services agreement. Rush delivery may be available on request and may attract an additional fee.',
    ],
  },
  {
    heading: 'Liability',
    body: [
      `${BRAND.name} takes every reasonable precaution to capture and protect your moments. In the unlikely event of equipment failure or circumstances beyond our control, liability is limited to the amount paid for the affected service.`,
    ],
  },
];

interface LegalPageProps {
  kind: 'privacy' | 'terms';
}

export default function LegalPage({ kind }: LegalPageProps) {
  const sections = kind === 'privacy' ? PRIVACY : TERMS;
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';

  return (
    <>
      <Seo title={title} />
      <Container maxWidth="md" sx={{ pt: { xs: 16, md: 22 }, pb: { xs: 10, md: 14 } }}>
        <Typography variant="overline" sx={{ color: palette.rose }}>
          {BRAND.name}
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: '2.4rem', md: '3.6rem' }, mt: 1, mb: 1.5 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
          Last updated: June 2026
        </Typography>
        <Box sx={{ mt: 6 }}>
          {sections.map((section) => (
            <Box key={section.heading} sx={{ mb: 5, borderTop: `1px solid ${palette.inkBorder}`, pt: 4 }}>
              <Typography variant="h4" sx={{ mb: 2, color: palette.ivory }}>
                {section.heading}
              </Typography>
              {section.body.map((paragraph, i) => (
                <Typography key={i} variant="body1" sx={{ color: palette.ivoryMuted, mb: 2 }}>
                  {paragraph}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      </Container>
    </>
  );
}
