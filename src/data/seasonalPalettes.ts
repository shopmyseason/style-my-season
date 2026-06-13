export type PaletteColor = {
  name: string;
  hex: string;
};

export type AvoidColor = {
  name: string;
  hex: string;
  reason: string;
};

export type SeasonalPaletteData = {
  name: string;
  colors: PaletteColor[];
  avoidColors: AvoidColor[];
};

export const seasonalPalettes: SeasonalPaletteData[] = [
  {
    name: "Light Spring",
    colors: [
      { name: "Peach", hex: "#F5C4A8" },
      { name: "Warm Ivory", hex: "#FFF5E8" },
      { name: "Light Coral", hex: "#F4A88A" },
      { name: "Butter Yellow", hex: "#F5E6A3" },
      { name: "Mint Aqua", hex: "#A8E6CF" },
      { name: "Apricot", hex: "#F2B88C" },
      { name: "Soft Salmon", hex: "#F0B5A0" },
      { name: "Light Aqua", hex: "#8ED9D4" },
    ],
    avoidColors: [
      {
        name: "Stark Black",
        hex: "#0A0A0A",
        reason: "Too harsh and heavy for light, warm coloring",
      },
      {
        name: "Deep Burgundy",
        hex: "#5C2030",
        reason: "Overly deep and cool for a light spring complexion",
      },
      {
        name: "Dusty Mauve",
        hex: "#8A7080",
        reason: "Muted cool tones dull spring brightness",
      },
      {
        name: "Neon Lime",
        hex: "#88FF00",
        reason: "Artificial green clashes with soft warmth",
      },
      {
        name: "Charcoal Gray",
        hex: "#404048",
        reason: "Cool dark gray washes out golden undertones",
      },
    ],
  },
  {
    name: "Warm Spring",
    colors: [
      { name: "Golden Yellow", hex: "#E8C547" },
      { name: "Warm Coral", hex: "#E87A5A" },
      { name: "Peach", hex: "#F0A878" },
      { name: "Turquoise", hex: "#3DB8A8" },
      { name: "Honey Gold", hex: "#D4A04A" },
      { name: "Warm Green", hex: "#7CB868" },
      { name: "Camel", hex: "#C4A060" },
      { name: "Cream", hex: "#FFF8E8" },
    ],
    avoidColors: [
      {
        name: "Cool Gray",
        hex: "#9098A8",
        reason: "Ashy cool grays fight warm golden undertones",
      },
      {
        name: "Icy Pink",
        hex: "#F0D0E0",
        reason: "Too cool and pale for vibrant spring warmth",
      },
      {
        name: "Stark Black",
        hex: "#101010",
        reason: "Creates harsh contrast against warm skin",
      },
      {
        name: "Dusty Plum",
        hex: "#786080",
        reason: "Muted purple-gray feels muddy on warm springs",
      },
      {
        name: "Steel Blue",
        hex: "#5878A0",
        reason: "Cool blue drains warmth from the complexion",
      },
    ],
  },
  {
    name: "Clear Spring",
    colors: [
      { name: "Bright Coral", hex: "#FF6B5A" },
      { name: "Turquoise", hex: "#00C9B8" },
      { name: "Hot Pink", hex: "#FF3D8A" },
      { name: "Lemon Yellow", hex: "#FFE838" },
      { name: "Emerald", hex: "#00B87A" },
      { name: "Clear Blue", hex: "#2890FF" },
      { name: "Violet", hex: "#9040E8" },
      { name: "Pure White", hex: "#FFFFFF" },
    ],
    avoidColors: [
      {
        name: "Muted Taupe",
        hex: "#A09088",
        reason: "Dusty neutrals mute clear, bright coloring",
      },
      {
        name: "Dusty Rose",
        hex: "#B898A0",
        reason: "Soft muddy pink lacks the clarity springs need",
      },
      {
        name: "Olive Brown",
        hex: "#6A6840",
        reason: "Murky green-brown dulls vivid undertones",
      },
      {
        name: "Warm Beige",
        hex: "#C8B8A0",
        reason: "Too muted and warm without enough clarity",
      },
      {
        name: "Charcoal",
        hex: "#383840",
        reason: "Heavy gray-brown overshadows bright features",
      },
    ],
  },
  {
    name: "Light Summer",
    colors: [
      { name: "Powder Lavender", hex: "#D4C4E8" },
      { name: "Soft Pink", hex: "#E8B4C8" },
      { name: "Periwinkle", hex: "#A8B4E0" },
      { name: "Mauve", hex: "#C8A8B8" },
      { name: "Light Gray", hex: "#D0D4D8" },
      { name: "Rose Water", hex: "#E0A8C0" },
      { name: "Soft Blue", hex: "#B8C8E8" },
      { name: "Soft White", hex: "#F5F0F5" },
    ],
    avoidColors: [
      {
        name: "Warm Orange",
        hex: "#E87840",
        reason: "Too warm and saturated for cool summer softness",
      },
      {
        name: "Mustard Yellow",
        hex: "#C8A820",
        reason: "Golden yellow clashes with cool, light coloring",
      },
      {
        name: "Dark Chocolate Brown",
        hex: "#3A2818",
        reason: "Heavy warm brown overwhelms delicate contrast",
      },
      {
        name: "Stark Black",
        hex: "#0A0A0A",
        reason: "Harsh black is too severe for light summer features",
      },
      {
        name: "Neon Lime",
        hex: "#A8FF20",
        reason: "Electric warm green fights cool undertones",
      },
    ],
  },
  {
    name: "Soft Summer",
    colors: [
      { name: "Dusty Rose", hex: "#C9A0A8" },
      { name: "Sage", hex: "#A8B8A0" },
      { name: "Soft Blue", hex: "#98A8C0" },
      { name: "Mauve", hex: "#B8A0B0" },
      { name: "Grayed Navy", hex: "#6878A0" },
      { name: "Plum", hex: "#9070A0" },
      { name: "Soft Teal", hex: "#88A8A8" },
      { name: "Mushroom", hex: "#B0A098" },
    ],
    avoidColors: [
      {
        name: "Bright Orange",
        hex: "#F07830",
        reason: "Vivid warmth overpowers soft, muted coloring",
      },
      {
        name: "Pure White",
        hex: "#FFFFFF",
        reason: "Stark white is too bright for gentle contrast",
      },
      {
        name: "True Black",
        hex: "#101010",
        reason: "Harsh black disrupts soft summer harmony",
      },
      {
        name: "Golden Yellow",
        hex: "#E0C030",
        reason: "Warm bright yellow looks jarring and loud",
      },
      {
        name: "Kelly Green",
        hex: "#208040",
        reason: "Clear warm green clashes with dusty cool tones",
      },
    ],
  },
  {
    name: "Cool Summer",
    colors: [
      { name: "Rose", hex: "#D08098" },
      { name: "Raspberry", hex: "#B05078" },
      { name: "Soft Navy", hex: "#5060A0" },
      { name: "Icy Pink", hex: "#E8B0C8" },
      { name: "Cool Gray", hex: "#9098A8" },
      { name: "Burgundy", hex: "#804060" },
      { name: "Blue Red", hex: "#A04068" },
      { name: "Plum", hex: "#785888" },
    ],
    avoidColors: [
      {
        name: "Pumpkin Orange",
        hex: "#D06828",
        reason: "Warm orange fights cool rose undertones",
      },
      {
        name: "Mustard",
        hex: "#C0A018",
        reason: "Golden mustard reads muddy on cool summers",
      },
      {
        name: "Camel",
        hex: "#C0A060",
        reason: "Warm golden brown dulls cool clarity",
      },
      {
        name: "Rust",
        hex: "#B85028",
        reason: "Red-orange warmth clashes with cool pink skin",
      },
      {
        name: "Neon Coral",
        hex: "#FF6040",
        reason: "Overly bright and warm for subdued cool coloring",
      },
    ],
  },
  {
    name: "Soft Autumn",
    colors: [
      { name: "Moss Green", hex: "#8A9878" },
      { name: "Terracotta", hex: "#C08068" },
      { name: "Dusty Teal", hex: "#689890" },
      { name: "Camel", hex: "#C0A070" },
      { name: "Olive", hex: "#888858" },
      { name: "Rust", hex: "#B06848" },
      { name: "Warm Gray", hex: "#A09890" },
      { name: "Soft Peach", hex: "#D8B0A0" },
    ],
    avoidColors: [
      {
        name: "Hot Pink",
        hex: "#FF3088",
        reason: "Clear cool pink overwhelms muted warmth",
      },
      {
        name: "Pure White",
        hex: "#FFFFFF",
        reason: "Stark white is too crisp for soft autumn depth",
      },
      {
        name: "Royal Blue",
        hex: "#2040C0",
        reason: "Clear cool blue clashes with earthy softness",
      },
      {
        name: "Stark Black",
        hex: "#0A0A0A",
        reason: "Harsh black feels severe against gentle coloring",
      },
      {
        name: "Icy Lavender",
        hex: "#D8C8F0",
        reason: "Cool pastel lavender washes out warm softness",
      },
    ],
  },
  {
    name: "Warm Autumn",
    colors: [
      { name: "Pumpkin", hex: "#D07030" },
      { name: "Rust", hex: "#B85028" },
      { name: "Mustard", hex: "#C8A020" },
      { name: "Olive", hex: "#788040" },
      { name: "Copper", hex: "#B87840" },
      { name: "Tomato", hex: "#C84830" },
      { name: "Warm Brown", hex: "#886040" },
      { name: "Gold", hex: "#D0A030" },
    ],
    avoidColors: [
      {
        name: "Cool Pink",
        hex: "#E8A0C8",
        reason: "Icy pink fights rich golden undertones",
      },
      {
        name: "Periwinkle",
        hex: "#8898E0",
        reason: "Cool blue-violet dulls autumn warmth",
      },
      {
        name: "Charcoal Gray",
        hex: "#505058",
        reason: "Cool gray mutes vibrant autumn richness",
      },
      {
        name: "Fuchsia",
        hex: "#E020A0",
        reason: "Blue-based bright pink clashes with warm skin",
      },
      {
        name: "Icy Blue",
        hex: "#A8D8F8",
        reason: "Pale cool blue looks disconnected and chalky",
      },
    ],
  },
  {
    name: "Deep Autumn",
    colors: [
      { name: "Forest Green", hex: "#2D5038" },
      { name: "Burgundy", hex: "#6B2838" },
      { name: "Bronze", hex: "#8B6830" },
      { name: "Deep Teal", hex: "#1A4848" },
      { name: "Chocolate", hex: "#4A3020" },
      { name: "Burnt Orange", hex: "#B85020" },
      { name: "Dark Olive", hex: "#485028" },
      { name: "Aubergine", hex: "#482838" },
    ],
    avoidColors: [
      {
        name: "Pastel Pink",
        hex: "#F0C0D0",
        reason: "Light cool pink is too weak for deep contrast",
      },
      {
        name: "Baby Blue",
        hex: "#A8D0F0",
        reason: "Soft cool blue washes out rich depth",
      },
      {
        name: "Lavender",
        hex: "#C8B0E8",
        reason: "Dusty cool purple looks faded on deep autumns",
      },
      {
        name: "Cool Beige",
        hex: "#D0C8C0",
        reason: "Ashy beige lacks the warmth and depth needed",
      },
      {
        name: "Silver Gray",
        hex: "#B8B8C0",
        reason: "Cool metallic gray fights warm golden undertones",
      },
    ],
  },
  {
    name: "Clear Winter",
    colors: [
      { name: "True Red", hex: "#E02030" },
      { name: "Hot Pink", hex: "#FF2088" },
      { name: "Emerald", hex: "#00A868" },
      { name: "Royal Blue", hex: "#1040D0" },
      { name: "Black", hex: "#101010" },
      { name: "Pure White", hex: "#FFFFFF" },
      { name: "Bright Purple", hex: "#8020E0" },
      { name: "Lemon", hex: "#FFE820" },
    ],
    avoidColors: [
      {
        name: "Muted Taupe",
        hex: "#A89890",
        reason: "Dusty warm neutrals muddy clear winter contrast",
      },
      {
        name: "Dusty Coral",
        hex: "#D0A090",
        reason: "Soft warm coral lacks crisp winter clarity",
      },
      {
        name: "Olive Green",
        hex: "#788050",
        reason: "Murky green-brown dulls sharp undertones",
      },
      {
        name: "Warm Beige",
        hex: "#D8C8B0",
        reason: "Muted beige blends features instead of defining them",
      },
      {
        name: "Terracotta",
        hex: "#C07858",
        reason: "Soft earthy orange fights cool, clear coloring",
      },
    ],
  },
  {
    name: "Cool Winter",
    colors: [
      { name: "Icy Pink", hex: "#F0A8C8" },
      { name: "Royal Blue", hex: "#2040B0" },
      { name: "Magenta", hex: "#C02080" },
      { name: "Charcoal", hex: "#383840" },
      { name: "Burgundy", hex: "#802848" },
      { name: "Emerald", hex: "#008858" },
      { name: "Pure White", hex: "#FFFFFF" },
      { name: "Raspberry", hex: "#C02868" },
    ],
    avoidColors: [
      {
        name: "Warm Orange",
        hex: "#E87038",
        reason: "Golden orange clashes with cool blue undertones",
      },
      {
        name: "Mustard Yellow",
        hex: "#C8A820",
        reason: "Warm yellow looks sallow on cool winter skin",
      },
      {
        name: "Camel",
        hex: "#C0A060",
        reason: "Golden brown mutes cool, high-contrast coloring",
      },
      {
        name: "Rust",
        hex: "#B85830",
        reason: "Warm red-orange fights icy pink undertones",
      },
      {
        name: "Peach",
        hex: "#F0B090",
        reason: "Soft warm peach lacks the cool clarity winters need",
      },
    ],
  },
  {
    name: "Deep Winter",
    colors: [
      { name: "True Black", hex: "#0A0A0A" },
      { name: "Pure White", hex: "#FFFFFF" },
      { name: "True Red", hex: "#C01828" },
      { name: "Emerald", hex: "#006848" },
      { name: "Navy", hex: "#102050" },
      { name: "Icy Pink", hex: "#E8A0C0" },
      { name: "Purple", hex: "#502878" },
      { name: "Burgundy", hex: "#601830" },
    ],
    avoidColors: [
      {
        name: "Warm Beige",
        hex: "#D8C0A8",
        reason: "Muted warm beige softens striking winter contrast",
      },
      {
        name: "Dusty Rose",
        hex: "#C0A0A8",
        reason: "Muddy pink-gray lacks depth and cool clarity",
      },
      {
        name: "Muted Olive",
        hex: "#888860",
        reason: "Warm green-brown looks dull and heavy",
      },
      {
        name: "Apricot",
        hex: "#F0B888",
        reason: "Soft warm peach fights cool, deep undertones",
      },
      {
        name: "Golden Tan",
        hex: "#C8A878",
        reason: "Warm tan blurs the bold contrast deep winters need",
      },
    ],
  },
];

export const seasonalPaletteNames = seasonalPalettes.map(
  (palette) => palette.name,
) as [
  "Light Spring",
  "Warm Spring",
  "Clear Spring",
  "Light Summer",
  "Soft Summer",
  "Cool Summer",
  "Soft Autumn",
  "Warm Autumn",
  "Deep Autumn",
  "Clear Winter",
  "Cool Winter",
  "Deep Winter",
];

export type SeasonalPalette = (typeof seasonalPaletteNames)[number];
