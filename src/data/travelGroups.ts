export type TravelGroup = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  seatsLeft: number;
  priceUsd: number;
  coverUrl: string;
  shortDescription: string;
  tags: string[];
};

export const trendingGroups: TravelGroup[] = [
  {
    id: "tg-001",
    slug: "bali-surf-and-yoga-retreat",
    title: "Bali Surf & Yoga Retreat",
    destination: "Uluwatu, Bali",
    startDate: "2026-02-05",
    endDate: "2026-02-12",
    seatsLeft: 4,
    priceUsd: 1299,
    coverUrl: "https://picsum.photos/seed/bali/800/600",
    shortDescription: "Sunrise yoga, beginner-friendly surf lessons, and clifftop sunsets.",
    tags: ["wellness", "beach", "surf"]
  },
  {
    id: "tg-002",
    slug: "kyoto-cherry-blossom-walks",
    title: "Kyoto Cherry Blossom Walks",
    destination: "Kyoto, Japan",
    startDate: "2026-03-28",
    endDate: "2026-04-03",
    seatsLeft: 8,
    priceUsd: 1590,
    coverUrl: "https://picsum.photos/seed/kyoto/800/600",
    shortDescription: "Temples, tea ceremonies, and hanami picnics under sakura trees.",
    tags: ["culture", "city", "spring"]
  },
  {
    id: "tg-003",
    slug: "iceland-ring-road-adventure",
    title: "Iceland Ring Road Adventure",
    destination: "Iceland",
    startDate: "2026-06-10",
    endDate: "2026-06-18",
    seatsLeft: 3,
    priceUsd: 1990,
    coverUrl: "https://picsum.photos/seed/iceland/800/600",
    shortDescription: "Waterfalls, black-sand beaches, glaciers, and hot springs.",
    tags: ["nature", "road trip", "photography"]
  }
];

export const lastMinuteGroups: TravelGroup[] = [
  {
    id: "tg-004",
    slug: "amalfi-coast-weekender",
    title: "Amalfi Coast Weekender",
    destination: "Amalfi, Italy",
    startDate: "2025-11-21",
    endDate: "2025-11-24",
    seatsLeft: 2,
    priceUsd: 890,
    coverUrl: "https://picsum.photos/seed/amalfi/800/600",
    shortDescription: "Lemons, lanes, and seaside hikes. Short and sweet.",
    tags: ["coast", "food", "short break"]
  },
  {
    id: "tg-005",
    slug: "marrakesh-markets-and-atlas",
    title: "Marrakesh Markets & Atlas",
    destination: "Marrakesh, Morocco",
    startDate: "2025-11-30",
    endDate: "2025-12-05",
    seatsLeft: 5,
    priceUsd: 990,
    coverUrl: "https://picsum.photos/seed/marrakesh/800/600",
    shortDescription: "Souks, tagines, and a day trek in the Atlas Mountains.",
    tags: ["markets", "desert", "culture"]
  }
];

export const budgetFriendlyGroups: TravelGroup[] = [
  {
    id: "tg-006",
    slug: "porto-creative-cowork-week",
    title: "Porto Creative Cowork Week",
    destination: "Porto, Portugal",
    startDate: "2026-01-12",
    endDate: "2026-01-19",
    seatsLeft: 7,
    priceUsd: 690,
    coverUrl: "https://picsum.photos/seed/porto/800/600",
    shortDescription: "Riverside cafes, tiled alleys, and evening tastings.",
    tags: ["cowork", "food", "city"]
  },
  {
    id: "tg-007",
    slug: "chiang-mai-mountains-and-markets",
    title: "Chiang Mai Mountains & Markets",
    destination: "Chiang Mai, Thailand",
    startDate: "2026-02-02",
    endDate: "2026-02-08",
    seatsLeft: 10,
    priceUsd: 590,
    coverUrl: "https://picsum.photos/seed/chiangmai/800/600",
    shortDescription: "Night bazaars, temples, and a gentle mountain loop.",
    tags: ["budget", "temples", "food"]
  }
];

export const allGroups: TravelGroup[] = [
  ...trendingGroups,
  ...lastMinuteGroups,
  ...budgetFriendlyGroups
];


