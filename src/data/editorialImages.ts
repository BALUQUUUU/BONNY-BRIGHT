export const EDITORIAL_IMAGES = {
  aloe: {
    src: '/images/editorial/aloe-texture.jpg',
    alt: 'Close-up texture of aloe leaves',
    source: 'https://unsplash.com/photos/aloe-vera-plant-N3RKwCzW4-s',
    credit: 'Josefin / Unsplash',
  },
  dew: {
    src: '/images/editorial/dew-leaf.jpg',
    alt: 'Water droplets gathered on a green leaf',
    source: 'https://unsplash.com/photos/water-droplets-on-green-leaf-m2cNS2FXuOk',
    credit: 'Mark Olsen / Unsplash',
  },
  oat: {
    src: '/images/editorial/oat-field.jpg',
    alt: 'Oat stems in warm natural light',
    source: 'https://unsplash.com/photos/crop-field-r9VxidMj-iM',
    credit: 'Chad Stembridge / Unsplash',
  },
} as const

export type EditorialImageName = keyof typeof EDITORIAL_IMAGES

/**
 * Every image is covered by the Unsplash License and the direct source and
 * credit stay adjacent to the local asset. This is an interim editorial
 * treatment: replace it with commissioned ingredient photography when the
 * product line is finalised.
 */
export function ingredientImageFor(name: string): EditorialImageName {
  const normalized = name.toLowerCase()
  if (/(oat|shea|bakuchiol|jojoba)/.test(normalized)) return 'oat'
  if (/(tremella|chamomile|green tea|aloe)/.test(normalized)) return 'aloe'
  return 'dew'
}
