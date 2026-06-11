import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { AWARDS, AWARDS_QUOTE } from '../../content';
import { palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import SectionDecor from './SectionDecor';

export default function AwardsSection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 11, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: palette.wine,
        backgroundImage:
          'radial-gradient(ellipse at 85% 15%, rgba(223,169,201,0.22), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(11,7,9,0.55), transparent 60%)',
      }}
    >
      {/* Decorative oversized trophy glyph — brighter here against the wine bg */}
      <SectionDecor sx={{ right: { xs: -40, md: 40 }, top: { xs: -30, md: 20 }, color: 'rgba(244,237,231,0.06)' }}>
        <EmojiEventsOutlinedIcon sx={{ fontSize: { xs: 220, md: 340 } }} />
      </SectionDecor>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Reveal>
          <SectionHeading eyebrow="Recognition" title="Honoured for our craft" align="center" />
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 3, md: 4 },
            mb: { xs: 7, md: 10 },
          }}
        >
          {AWARDS.map((award, index) => (
            <Reveal key={award.title} delay={index * 160}>
              <Box
                sx={{
                  position: 'relative',
                  height: '100%',
                  p: { xs: 3.5, md: 4.5 },
                  border: '1px solid rgba(244,237,231,0.18)',
                  bgcolor: 'rgba(11,7,9,0.22)',
                  backdropFilter: 'blur(2px)',
                  transition: 'transform 360ms ease, border-color 360ms ease, background-color 360ms ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: palette.rose,
                    bgcolor: 'rgba(11,7,9,0.34)',
                  },
                }}
              >
                {/* Index numeral */}
                <Typography
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    top: 18,
                    right: 24,
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '2.6rem',
                    color: 'rgba(244,237,231,0.18)',
                    lineHeight: 1,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </Typography>

                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    border: `1px solid ${palette.rose}`,
                    color: palette.rose,
                    mb: 3,
                  }}
                >
                  <EmojiEventsOutlinedIcon />
                </Box>

                <Typography variant="h5" sx={{ color: palette.ivory, mb: 1.5, pr: 5 }}>
                  {award.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(244,237,231,0.78)' }}>
                  {award.body}
                </Typography>
              </Box>
            </Reveal>
          ))}
        </Box>

        {/* Pull-quote */}
        <Reveal delay={260}>
          <Box sx={{ textAlign: 'center', maxWidth: 820, mx: 'auto' }}>
            <FormatQuoteIcon sx={{ color: palette.rose, fontSize: 44, transform: 'scaleX(-1)', opacity: 0.85 }} />
            <Typography
              variant="h3"
              sx={{
                fontStyle: 'italic',
                color: palette.ivory,
                fontSize: { xs: '1.7rem', md: '2.4rem' },
                lineHeight: 1.3,
                mt: 1,
              }}
            >
              {AWARDS_QUOTE}
            </Typography>
            <Box sx={{ width: 56, height: '1px', bgcolor: palette.rose, mx: 'auto', mt: 4 }} />
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
}
