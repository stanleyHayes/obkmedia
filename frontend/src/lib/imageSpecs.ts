/**
 * Recommended dimensions for admin-uploaded images. Uploads outside these
 * ranges are rejected client-side before they ever reach Cloudinary.
 */
export interface ImageSpec {
  label: string;
  recommended: string;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  /** Allowed aspect ratio (width / height) range. */
  minAspect?: number;
  maxAspect?: number;
  maxBytes: number;
}

export const IMAGE_SPECS = {
  hero: {
    label: 'Hero image',
    recommended: '2400 × 1350px, 16:9 landscape, JPG, ≤ 6 MB',
    minW: 1600,
    maxW: 4000,
    minH: 900,
    maxH: 2600,
    minAspect: 1.4,
    maxAspect: 2.2,
    maxBytes: 6_000_000,
  },
  about: {
    label: 'About image',
    recommended: '1050 × 1400px, 3:4 portrait, JPG, ≤ 5 MB',
    minW: 800,
    maxW: 2400,
    minH: 1000,
    maxH: 3200,
    minAspect: 0.6,
    maxAspect: 0.9,
    maxBytes: 5_000_000,
  },
  logo: {
    label: 'Logo',
    recommended: '≈ 600 × 200px, transparent PNG/SVG, ≤ 1.5 MB',
    minW: 80,
    maxW: 1600,
    minH: 40,
    maxH: 800,
    maxBytes: 1_500_000,
  },
} satisfies Record<string, ImageSpec>;

export type ImageSpecKey = keyof typeof IMAGE_SPECS;

export interface ImageValidationResult {
  ok: boolean;
  width: number;
  height: number;
  error?: string;
}

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

/** Validates type, file size, dimensions, and aspect ratio against a spec. */
export async function validateImageFile(file: File, spec: ImageSpec): Promise<ImageValidationResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, width: 0, height: 0, error: 'File must be an image.' };
  }
  if (file.size > spec.maxBytes) {
    const mb = (spec.maxBytes / 1_000_000).toFixed(1);
    return { ok: false, width: 0, height: 0, error: `File is too large (max ${mb} MB). Recommended: ${spec.recommended}.` };
  }

  // SVGs have no raster dimensions; accept them for logos by file size alone.
  if (file.type === 'image/svg+xml') {
    return { ok: true, width: 0, height: 0 };
  }

  let dims: { width: number; height: number };
  try {
    dims = await readDimensions(file);
  } catch {
    return { ok: false, width: 0, height: 0, error: 'Could not read the image dimensions.' };
  }

  const { width, height } = dims;
  const fail = (reason: string): ImageValidationResult => ({
    ok: false,
    width,
    height,
    error: `${reason} Yours is ${width} × ${height}px. Recommended: ${spec.recommended}.`,
  });

  if (width < spec.minW || width > spec.maxW) return fail('Width is out of the recommended range.');
  if (height < spec.minH || height > spec.maxH) return fail('Height is out of the recommended range.');

  if (spec.minAspect != null && spec.maxAspect != null) {
    const aspect = width / height;
    if (aspect < spec.minAspect || aspect > spec.maxAspect) {
      return fail('Aspect ratio is wrong (the image is the wrong shape).');
    }
  }

  return { ok: true, width, height };
}
