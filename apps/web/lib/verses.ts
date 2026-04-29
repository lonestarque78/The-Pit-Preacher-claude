export type Verse = {
  text: string;
  chapter: string;
};

export const VERSES: Verse[] = [
  {
    text: "The stall is not failure. The stall is patience being tested.",
    chapter: "The Gospel of the Pit, 12:7",
  },
  {
    text: "Low and slow is not a temperature. It is a way of life.",
    chapter: "Proverbs of the Preacher, 3:1",
  },
  {
    text: "If you tend to the pit with pride, the meat will preach on its own.",
    chapter: "Book of Fire, 6:14",
  },
  {
    text: "The smoke does not lie. Read it, and it will tell you everything.",
    chapter: "Revelations of Oak, 9:3",
  },
  {
    text: "A pitmaster who rushes the rest is a pitmaster who serves regret.",
    chapter: "Lamentations of the Sliced Brisket, 4:2",
  },
  {
    text: "Bark is not burned. Bark is battle-tested.",
    chapter: "The Bark Psalms, 1:1",
  },
  {
    text: "Do not open the lid and question the pit. Trust what you have built.",
    chapter: "The Letters of Patience, 7:8",
  },
  {
    text: "Wood selection is not a detail. It is the first sermon you write.",
    chapter: "Genesis of Smoke, 2:9",
  },
  {
    text: "Every great cook begins before the fire does. It begins in the mind.",
    chapter: "Book of Preparation, 1:3",
  },
  {
    text: "The thermometer does not lie. Neither does the pit. Only the pitmaster lies to himself.",
    chapter: "Honest Teachings, 11:5",
  },
  {
    text: "A spritz is an act of faith. You cannot see inside. You can only believe.",
    chapter: "The Spritz Epistles, 2:14",
  },
  {
    text: "Competition is with yesterday's cook. Nothing more.",
    chapter: "Proverbs of the Preacher, 8:6",
  },
  {
    text: "Fire is the beginning. Rest is the sermon. The slice is the amen.",
    chapter: "The Final Rites, 15:1",
  },
  {
    text: "Salt and time are the only secrets. Everything else is showmanship.",
    chapter: "The Rub Scriptures, 4:11",
  },
  {
    text: "The pit does not care about your reputation. Only your attention.",
    chapter: "Teachings of Humility, 6:3",
  },
];

export function getRandomVerse(): Verse {
  return VERSES[Math.floor(Math.random() * VERSES.length)] ?? VERSES[0]!;
}
