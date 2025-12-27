export type Item = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
};

export const items: Item[] = [
  {
    id: "1",
    slug: "starlight-journal",
    title: "Starlight Journal",
    description: "A collection of nightly observations and celestial sketches.",
    imageUrl: "https://picsum.photos/seed/stars/600/400"
  },
  {
    id: "2",
    slug: "nebula-notes",
    title: "Nebula Notes",
    description: "Field notes from wandering through colorful gas clouds.",
    imageUrl: "https://picsum.photos/seed/nebula/600/400"
  },
  {
    id: "3",
    slug: "comet-chronicler",
    title: "Comet Chronicler",
    description: "Tracking the swift visitors with icy tails.",
    imageUrl: "https://picsum.photos/seed/comet/600/400"
  },
  {
    id: "4",
    slug: "lunar-legends",
    title: "Lunar Legends",
    description: "Stories etched across the moon's enduring face.",
    imageUrl: "https://picsum.photos/seed/moon/600/400"
  }
];


