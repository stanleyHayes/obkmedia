import Box from '@mui/material/Box';

/** Client requirement: public gallery images carry an OBK MEDIA watermark. */
export default function Watermark() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        p: 2,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          fontFamily: '"Outfit", sans-serif',
          fontSize: '0.7rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(244, 237, 231, 0.55)',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        }}
      >
        © OBK MEDIA
      </Box>
    </Box>
  );
}
