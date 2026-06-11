import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { AWARDS, AWARDS_QUOTE } from '../../content';
import { palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

export default function AwardsSection() {
  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: palette.wine, position: 'relative', overflow: 'hidden' }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 80% 20%, rgba(223,169,201,0.18), transparent 55%)',
        }}
      />
      <Container maxWidth="xl" sx={{ position: 'relative' }}>
        <Reveal>
          <SectionHeading eyebrow="Recognition" title="Award-winning storytelling" />
        </Reveal>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 4, md: 8 } }}>
          {AWARDS.map((award, index) => (
            <Reveal key={award.title} delay={index * 150}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <EmojiEventsOutlinedIcon sx={{ color: palette.rose, fontSize: 38, mt: 0.5 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: palette.ivory, mb: 1 }}>
                    {award.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(244, 237, 231, 0.75)' }}>
                    {award.body}
                  </Typography>
                </Box>
              </Box>
            </Reveal>
          ))}
        </Box>
        <Reveal delay={300}>
          <Typography
            variant="h4"
            sx={{
              mt: { xs: 6, md: 9 },
              fontStyle: 'italic',
              color: palette.ivory,
              maxWidth: 760,
              borderTop: '1px solid rgba(244, 237, 231, 0.25)',
              pt: 4,
            }}
          >
            “{AWARDS_QUOTE}”
          </Typography>
        </Reveal>
      </Container>
    </Box>
  );
}
