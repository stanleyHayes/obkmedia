import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect } from 'react';
import type { PortfolioImage } from '../../api/types';
import { palette } from '../../theme';
import Watermark from './Watermark';

interface LightboxProps {
  images: PortfolioImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const open = index !== null;
  const current = open ? images[index] : undefined;

  const prev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + images.length) % images.length);
  }, [index, images.length, onNavigate]);

  const next = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % images.length);
  }, [index, images.length, onNavigate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, prev, next]);

  if (!current) return null;

  return (
    <Modal open={open} onClose={onClose} aria-label="Image gallery viewer">
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(7, 4, 6, 0.96)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
        onClick={onClose}
      >
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: 'absolute', top: 16, right: 16, color: palette.ivory, zIndex: 2 }}
        >
          <CloseIcon />
        </IconButton>

        <IconButton
          aria-label="Previous image"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          sx={{ position: 'absolute', left: { xs: 4, md: 24 }, color: palette.ivory, zIndex: 2 }}
        >
          <ChevronLeftIcon fontSize="large" />
        </IconButton>

        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ position: 'relative', maxWidth: '92vw', maxHeight: '86vh' }}
        >
          <Box
            component="img"
            src={current.imageUrl}
            alt={current.altText || 'Portfolio image'}
            draggable={false}
            onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
            sx={{
              maxWidth: '92vw',
              maxHeight: '82vh',
              display: 'block',
              userSelect: 'none',
            }}
          />
          <Watermark />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
            <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
              {current.caption || ''}
            </Typography>
            <Typography variant="caption" sx={{ color: palette.rose, letterSpacing: '0.2em' }}>
              {String((index ?? 0) + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </Typography>
          </Box>
        </Box>

        <IconButton
          aria-label="Next image"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          sx={{ position: 'absolute', right: { xs: 4, md: 24 }, color: palette.ivory, zIndex: 2 }}
        >
          <ChevronRightIcon fontSize="large" />
        </IconButton>
      </Box>
    </Modal>
  );
}
