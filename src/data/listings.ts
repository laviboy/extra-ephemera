export type Listing = {
  id: string;
  title: string;
  subtitle: string; // e.g., city/region + nights
  priceText: string; // e.g., RM250 night · 4.85
  imageUrl: string;
  isGuestFavorite?: boolean;
};

const make = (i: number, seed: string, title: string, subtitle: string, priceText: string, fav = false): Listing => ({
  id: `lst-${i}`,
  title,
  subtitle,
  priceText,
  isGuestFavorite: fav,
  imageUrl: `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/480`
});

export const popularKualaLumpur: Listing[] = [
  make(1, 'kl-bed', 'Popular homes in Kuala Lumpur', 'Apartment in Kuala Lumpur', 'RM270 per night · 4.83', true),
  make(2, 'kl-dining', 'Cafe-style Studio', 'Kuala Lumpur · 1 bed · 2 guests', 'RM240 per night · 4.78'),
  make(3, 'kl-minimal', 'Minimalist Room', 'Kuala Lumpur · 1 bed', 'RM120 per night · 4.65'),
  make(4, 'kl-towers', 'Condo near KLCC', 'Kuala Lumpur · 2 beds · 4 guests', 'RM320 per night · 4.90', true),
  make(5, 'kl-loft', 'Loft in Bukit Bintang', 'Kuala Lumpur · 1 bed · 2 guests', 'RM290 per night · 4.81'),
  make(6, 'kl-ensuite', 'Ensuite in KL Sentral', 'Kuala Lumpur · 1 bed · 2 guests', 'RM210 per night · 4.70'),
  make(7, 'kl-cinema', 'Skyline Suite + Projector', 'Kuala Lumpur · 1 bed · 2 guests', 'RM410 per night · 4.95', true)
];

export const petalingThisWeekend: Listing[] = Array.from({ length: 15 }).map((_, i) =>
  make(100 + i, `pj-${i}`, `Apartment in Petaling Jaya`, 'Petaling Jaya · 2 beds · 4 guests', 'RM250 per night · 4.72', i % 7 === 0)
);

export const johorBahru: Listing[] = Array.from({ length: 15 }).map((_, i) =>
  make(200 + i, `jb-${i}`, `Apartment in Johor Bahru`, 'Johor Bahru · 2 beds · 4 guests', 'RM230 per night · 4.69', i % 5 === 0)
);

export const melakaWeekend: Listing[] = Array.from({ length: 15 }).map((_, i) =>
  make(300 + i, `mk-${i}`, `Apartment in Malacca`, 'Malacca · 2 beds · 4 guests', 'RM220 per night · 4.71', i % 6 === 0)
);

export const kuantanDistrict: Listing[] = Array.from({ length: 12 }).map((_, i) =>
  make(400 + i, `kt-${i}`, `Apartment in Kuantan`, 'Kuantan · 2 beds · 4 guests', 'RM210 per night · 4.68', i % 4 === 0)
);

export const allListings: Listing[] = [
  ...popularKualaLumpur,
  ...petalingThisWeekend,
  ...johorBahru,
  ...melakaWeekend,
  ...kuantanDistrict
];


