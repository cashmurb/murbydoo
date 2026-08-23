import eyesReference from "../assets/reference/eyes.svg";
import noseReference from "../assets/reference/nose.svg";
import mouthReference from "../assets/reference/mouth.svg";
import hair1Reference from "../assets/reference/hair-1.svg";
import hair2Reference from "../assets/reference/hair-2.svg";
import bodyReference from "../assets/reference/body.svg";
import clothesReference from "../assets/reference/clothes.svg";
import itemsReference from "../assets/reference/items.svg";

const pieceModules = import.meta.glob("../assets/pieces/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const itemModules = import.meta.glob("../assets/items/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const pieceUrl = (name) =>
  pieceModules[`../assets/pieces/${name}`];

const itemUrl = (name) =>
  itemModules[`../assets/items/${name}`];

export const REFERENCES = {
  eyes: eyesReference,
  nose: noseReference,
  mouth: mouthReference,
  hair: hair1Reference,
  hair2: hair2Reference,
  body: bodyReference,
  clothes: clothesReference,
  items: itemsReference,
};

export const AVATAR_ANCHORS = {
  faceCenterX: 91.5,
  faceCenterY: 97,
  bodyTop: 154,
};

const EYE_TOPS = [
  89,
  88,
  92,
  89,
  87,
  86,
  93,
  92,
  88,
  79,
  89,
  89,
];

const NOSE_TOPS = [
  112,
  100,
  96,
  109,
  105,
  102,
  107,
  100,
  101,
  104,
];

const MOUTH_TOPS = [
  122,
  124,
  125,
  123,
  124,
  128,
  123,
  126,
  124,
  128,
];


const HAIR_GEOMETRY = [
  {
    includesHead: true,
    faceCenterX: 48.5,
    faceCenterY: 69,
  },
  {
    includesHead: true,
    faceCenterX: 60.5,
    faceCenterY: 59.6001,
  },
  {
    includesHead: true,
    faceCenterX: 49.6709,
    faceCenterY: 50.5386,
  },
  {
    includesHead: true,
    faceCenterX: 58.1006,
    faceCenterY: 71,
  },
  {
    includesHead: true,
    faceCenterX: 48.5,
    faceCenterY: 56.6001,
  },
  {
    includesHead: true,
    faceCenterX: 59.5,
    faceCenterY: 62,
  },
  {
    includesHead: true,
    faceCenterX: 48.5,
    faceCenterY: 57.9829,
  },

  {
    includesHead: true,
    faceCenterX: 60,
    faceCenterY: 60,
  },

  {
    includesHead: true,
    faceCenterX: 48.7959,
    faceCenterY: 57.5,
  },
  {
    includesHead: true,
    faceCenterX: 48.5,
    faceCenterY: 101,
  },
  {
    includesHead: true,
    faceCenterX: 78.5,
    faceCenterY: 54.2158,
  },
  {
    includesHead: true,
    faceCenterX: 53.1045,
    faceCenterY: 68.5659,
  },
];

export const OPTIONS = {
  eyes: Array.from({ length: 12 }, (_, index) => ({
    id: `eye-${index}`,
    image: pieceUrl(`eye-${index}.svg`),
    centerX: AVATAR_ANCHORS.faceCenterX,
    top: EYE_TOPS[index],
  })),

  nose: Array.from({ length: 10 }, (_, index) => ({
    id: `nose-${index}`,
    image: pieceUrl(`nose-${index}.svg`),
    centerX: AVATAR_ANCHORS.faceCenterX,
    top: NOSE_TOPS[index],
  })),

  mouth: Array.from({ length: 10 }, (_, index) => ({
    id: `mouth-${index}`,
    image: pieceUrl(`mouth-${index}.svg`),
    centerX: AVATAR_ANCHORS.faceCenterX,
    top: MOUTH_TOPS[index],
  })),

  hair: Array.from({ length: 12 }, (_, index) => ({
    id: `hair-${index}`,
    image: pieceUrl(`hair-${index}.svg`),
    ...HAIR_GEOMETRY[index],
  })),

  body: [
    {
      id: "male",
      image: pieceUrl("body-male.svg"),
      centerX: AVATAR_ANCHORS.faceCenterX,
      top: 130.5,
    },

    {
      id: "female",
      image: pieceUrl("body-female.svg"),
      centerX: AVATAR_ANCHORS.faceCenterX,
      top: 153.483,
    },
  ],
  items: [
    {
      id: "glasses-black",
      image: itemUrl("glasses-black.svg"),
      type: "glasses",
    },

    {
      id: "scarf",
      image: itemUrl("scarf.svg"),
      type: "scarf",
      left: 51,
      top: 141.565,
    },

    {
      id: "watch",
      image: itemUrl("watch.svg"),
      type: "watch",
      left: 150,
      top: 223.5,
    },

    {
      id: "jewelry",
      image: itemUrl("jewelry.svg"),
      type: "jewelry",
      left: 37,
      top: 111.60,
    },

    {
      id: "glasses-orange",
      image: itemUrl("glasses-orange.svg"),
      type: "glasses",
    },
  ],
};

export const HEAD_HOTSPOTS = {
  eyes: [
    [772, 348, 70, 50],
    [902, 348, 70, 50],
    [1038, 348, 82, 50],

    [772, 410, 70, 50],
    [902, 410, 70, 50],
    [1038, 410, 82, 50],

    [772, 476, 70, 50],
    [902, 476, 70, 50],
    [1038, 476, 82, 55],

    [772, 546, 70, 55],
    [902, 546, 70, 55],
    [1038, 546, 82, 55],
  ],

  nose: [
    [770, 348, 60, 48],
    [870, 348, 60, 48],
    [980, 348, 60, 48],
    [1055, 348, 60, 48],

    [770, 408, 60, 48],
    [870, 408, 60, 48],
    [980, 408, 60, 48],
    [1055, 408, 60, 48],

    [770, 474, 60, 48],
    [870, 474, 60, 48],
  ],

  mouth: [
    [770, 348, 60, 48],
    [870, 348, 60, 48],
    [980, 348, 60, 48],
    [1055, 348, 60, 48],

    [770, 408, 60, 48],
    [870, 408, 60, 48],
    [980, 408, 60, 48],
    [1055, 408, 60, 48],

    [770, 474, 60, 48],
    [870, 474, 60, 48],
  ],
};

export const HAIR_HOTSPOTS = [
  [755, 335, 112, 140],
  [880, 335, 112, 140],
  [1017, 335, 112, 140],

  [755, 490, 112, 140],
  [880, 490, 112, 140],
  [1017, 490, 112, 140],
];

export const BODY_HOTSPOTS = [
  [755, 385, 195, 210],
  [950, 385, 185, 215],
];

export const ITEM_HOTSPOTS = [
  [775, 340, 95, 50],
  [905, 325, 90, 140],
  [1018, 333, 100, 95],
  [807, 479, 130, 150],
  [981, 518, 95, 50],
];