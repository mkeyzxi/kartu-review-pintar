import { z } from 'zod';

// URL validation regex - harus dari Google Maps, Vercel, Netlify, atau makbuln.web.id
const URL_REGEX = /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:google\.com|goo\.gl|vercel\.app|netlify\.app|makbuln\.web\.id)(?:\/|$)/i;

export const activateSchema = z.object({
  url_gmb: z
    .string()
    .min(1, 'Link URL wajib diisi.')
    .url('Format URL tidak valid. Pastikan diawali https://')
    .max(2048, 'URL terlalu panjang.')
    .regex(URL_REGEX, 'Link harus berupa URL dari Google Maps, Vercel, Netlify, atau makbuln.web.id.'),
  store_name: z
    .string()
    .max(255, 'Nama toko terlalu panjang.')
    .nullable()
    .optional(),
  phone_number: z
    .string()
    .min(1, 'Nomor Telepon wajib diisi.')
    .max(20, 'Nomor telepon terlalu panjang.'),
  pin: z
    .string()
    .regex(/^\d{4,6}$/, 'PIN harus berupa angka 4–6 digit.'),
});

export const editVerifySchema = z.object({
  pin: z
    .string()
    .regex(/^\d{4,6}$/, 'PIN harus berupa angka 4–6 digit.'),
});

export const editUpdateSchema = z.object({
  pin: z
    .string()
    .regex(/^\d{4,6}$/, 'PIN harus berupa angka 4–6 digit.'),
  url_gmb: z
    .string()
    .min(1, 'Link URL wajib diisi.')
    .url('Format URL tidak valid. Pastikan diawali https://')
    .max(2048, 'URL terlalu panjang.')
    .regex(URL_REGEX, 'Link harus berupa URL dari Google Maps, Vercel, Netlify, atau makbuln.web.id.'),
});

export const generateSchema = z.object({
  count: z.number().int().min(1).max(500).default(1),
  store_name: z.string().max(255).nullable().optional(),
});

export const updateStoreNameSchema = z.object({
  store_name: z.string().max(255).nullable().optional(),
});

export const updateUrlGmbSchema = z.object({
  url_gmb: z.string().url().max(2000).nullable().optional(),
});

export const updateExpirySchema = z.object({
  expired_at: z.string().nullable().optional(),
});

export const updateLabelSchema = z.object({
  label: z.string().max(100).nullable().optional(),
});

export type ActivateInput = z.infer<typeof activateSchema>;
export type EditVerifyInput = z.infer<typeof editVerifySchema>;
export type EditUpdateInput = z.infer<typeof editUpdateSchema>;
export type GenerateInput = z.infer<typeof generateSchema>;
