import { faker } from "@faker-js/faker";

import { createMockStore } from "@/lib/mock/mock-store";
import {
  type Skater,
  skaterStances,
  skaterStatuses,
  skaterStyles,
} from "./skater.types";

const SKATER_COUNT = 100;
const SKATER_SEED = 20260813;

const availableTricks = [
  "Kickflip",
  "Heelflip",
  "Tre Flip",
  "Hardflip",
  "Varial Flip",
  "360 Flip",
  "Ollie",
  "Nollie",
  "Pop Shove-it",
  "FS Boardslide",
  "BS Boardslide",
  "50-50 Grind",
  "5-0 Grind",
  "Crooked Grind",
  "Smith Grind",
] as const;

const sampleMedia = [
  { name: "trick_clip.mp4", type: "video/mp4", sizeRange: [5000, 50000] },
  { name: "skate_edit.mp4", type: "video/mp4", sizeRange: [10000, 100000] },
  { name: "photo_1.jpg", type: "image/jpeg", sizeRange: [500, 3000] },
  { name: "photo_2.jpg", type: "image/jpeg", sizeRange: [500, 3000] },
  {
    name: "sponsor_contract.pdf",
    type: "application/pdf",
    sizeRange: [100, 500],
  },
] as const;

function mockId(prefix: string) {
  return `${prefix}_${faker.string.alphanumeric({ length: 12, casing: "mixed" })}`;
}

export function generateRandomSkater(input?: Partial<Skater>): Skater {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const trickCount = faker.number.int({ min: 0, max: 8 });
  const tricks =
    trickCount > 0
      ? faker.helpers.arrayElements([...availableTricks], trickCount)
      : null;

  const hasMedia = faker.datatype.boolean({ probability: 0.3 });
  const media = hasMedia
    ? faker.helpers
        .arrayElements(sampleMedia, { min: 1, max: 2 })
        .map((file, index) => ({
          id: `${mockId("media")}-${index}`,
          name: file.name,
          size:
            faker.number.int({
              min: file.sizeRange[0],
              max: file.sizeRange[1],
            }) * 1024,
          type: file.type,
          url: `https://example.com/media/${file.name}`,
        }))
    : null;

  return {
    id: mockId("skater"),
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    stance: faker.helpers.arrayElement(skaterStances),
    style: faker.helpers.arrayElement(skaterStyles),
    status: faker.helpers.arrayElement(skaterStatuses),
    yearsSkating: faker.number.int({ min: 1, max: 25 }),
    startedSkating: faker.date.between({
      from: "2000-01-01",
      to: "2023-01-01",
    }),
    isPro: faker.datatype.boolean({ probability: 0.3 }),
    tricks,
    media,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...input,
  };
}

function seedSkaters(): Skater[] {
  faker.seed(SKATER_SEED);
  const rows = Array.from({ length: SKATER_COUNT }, (_, index) =>
    generateRandomSkater({ order: index }),
  );
  faker.seed();
  return rows;
}

export const skatersStore = createMockStore<Skater>({
  seed: seedSkaters,
  getKey: (skater) => skater.id,
});
