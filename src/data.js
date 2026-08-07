// Single source of truth for every piece of copy on the landing page.
// Facts here are cross-checked against the client brief — see README
// "Brief cross-check" before changing any claim about warranty,
// certification, experience or timelines.

export const site = {
  name: 'SkyLine Stretch Ceilings',
  phone: '604‑345‑2324',
  phoneHref: 'tel:+16043452324',
  whatsapp: 'https://wa.me/16043452324',
  email: 'vladtkachenko2110@gmail.com',
  legal: 'GREAT HOME RENOVATIONS LTD · Vancouver, BC',
  // Brief states "8AM - 6PM" with no day breakdown — confirm before adding days.
  hours: ['8am – 6pm'],
  social: [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/skyline_stretchceilings/',
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61591128723418',
    },
    { label: 'Google', href: 'https://share.google/iTtPjStWd6E5QaTwt' },
  ],
}

export const nav = [
  { label: 'Ceilings', href: '#ceilings' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Process', href: '#process' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
]

export const heroStats = [
  { value: 'Since 2017', label: 'Installing ceilings' },
  { value: '1–3 days', label: 'Typical project' },
  { value: '15 yr', label: 'Warranty' },
]

export const aboutChips = [
  'Perfectly flat',
  'Integrated LED',
  'Minimal dust',
  'Fire‑safe film',
]

export const ceilingTypes = [
  {
    name: 'Glossy',
    img: '/assets/g13.jpg',
    desc: 'A mirror‑like reflective surface that bounces light around the room and visually raises the ceiling. Our most popular finish for modern interiors.',
  },
  {
    name: 'Translucent',
    img: '/assets/g20.jpg',
    desc: 'A light‑diffusing membrane lit from behind, spreading soft, even light across the surface with no visible fixtures. Installed in roughly two days.',
  },
  {
    name: 'LED Light Lines',
    img: '/assets/g09.png',
    desc: 'Slim channels of hidden LED run through the ceiling as clean lines of light, shaping the room and replacing bulky fixtures.',
  },
  {
    name: 'Track Lighting',
    img: '/assets/g07.jpg',
    desc: 'Magnetic track integrated flush into the ceiling line, so fixtures can be moved, added or re‑aimed later — the one system where you can still change the lighting scene after install.',
  },
  {
    name: 'Matte',
    img: '/assets/g23.jpg',
    desc: 'A soft, paint‑like finish with zero glare — the most natural, timeless look for bedrooms, living rooms and offices. Fitted in a single day.',
  },
  {
    name: 'Cove Lighting',
    img: '/assets/g16.jpg',
    desc: 'A perimeter of concealed light that washes the ceiling with a warm, floating glow — elegant in hallways, bedrooms and lounges.',
  },
  {
    name: 'Printed / Custom',
    img: '/assets/g18.jpg',
    desc: 'Any high‑resolution image or pattern printed onto the membrane — from a printed sky to bespoke artwork for commercial spaces. Fitted in a single day.',
  },
]

// Offered per the brief but with no photography available yet — listed as
// text rather than illustrated with unrelated images.
export const alsoAvailable = [
  'Satin finish',
  'Fabric / polyester systems',
  'Multi‑level ceilings',
  'Acoustic / perforated',
  'Starry sky (fibre optic)',
  'Stretch walls',
  'Repair & membrane replacement',
]

export const works = [
  {
    title: 'Office reception light lines',
    tag: 'Commercial',
    ratio: '4/3',
    img: '/assets/g12.jpg',
  },
  {
    title: 'Kitchen light‑frame ceiling',
    tag: 'Residential',
    ratio: '4/3',
    img: '/assets/g10.png',
  },
  {
    title: 'Hallway cove lighting',
    tag: 'Residential',
    ratio: '4/5',
    img: '/assets/g17.jpg',
  },
  {
    title: 'Commercial lounge ceiling',
    tag: 'Commercial',
    ratio: '4/5',
    img: '/assets/g04.jpg',
  },
  {
    title: 'Translucent light panel',
    tag: 'Residential',
    ratio: '4/3',
    img: '/assets/g22.jpg',
  },
  {
    title: 'Light‑line corridor',
    tag: 'Residential',
    ratio: '4/3',
    img: '/assets/g11.jpg',
  },
]

export const benefits = [
  {
    no: '01',
    title: 'Flawless flat surface',
    text: 'Cracks, stains and an uneven old ceiling disappear behind one perfectly level, modern plane.',
  },
  {
    no: '02',
    title: 'Built‑in lighting',
    text: 'Integrate LED lines, track systems and translucent panels for a designer look — wired in cleanly.',
  },
  {
    no: '03',
    title: 'Fast, low‑dust install',
    text: 'No puttying, sanding, painting or long drying. Most rooms are finished in a single day.',
  },
  {
    no: '04',
    title: 'Hides everything',
    text: 'Wiring, ducting, pipes and an old ceiling all disappear above the membrane.',
  },
  {
    no: '05',
    title: 'Fire‑safe materials',
    text: 'Certified, fire‑rated films that meet North American safety standards for homes and businesses.',
  },
  {
    no: '06',
    title: 'Low maintenance',
    text: 'Never needs repainting — an occasional wipe keeps it looking new for years.',
  },
]

export const reasons = [
  {
    title: 'Experience since 2017',
    text: 'Our team has been installing stretch ceilings since 2017 — that hands‑on experience now serves Vancouver and the Lower Mainland.',
  },
  {
    title: 'Operated by Great Home Renovations Ltd',
    text: 'You deal with a registered company and the same team from quote to final walkthrough.',
  },
  {
    title: 'Lighting specialists',
    text: 'From single LED lines to track systems and translucent panels, integrated light is what we do best.',
  },
  {
    title: 'Transparent pricing',
    text: 'Clear, itemised quotes with no surprises. What we measure is what you pay.',
  },
  {
    title: 'Certified, fire‑rated film',
    text: 'We install Laqfoil PVC and Descor polyester membranes carrying Class 1 fire ratings for Canada and the USA.',
  },
  {
    title: '15‑year warranty',
    text: 'Backed by a 15‑year warranty — 10 years on materials and 3 years on installation.',
  },
]

export const steps = [
  {
    no: '01',
    title: 'Free consultation',
    text: 'We visit your space, discuss ideas and take precise measurements — at no cost.',
  },
  {
    no: '02',
    title: 'Design & quote',
    text: 'You receive a clear quote with finish, lighting and layout options to choose from.',
  },
  {
    no: '03',
    title: 'Manufacturing',
    text: 'Your membrane is cut and prepared to the millimetre, typically 1–2 weeks from measurement.',
  },
  {
    no: '04',
    title: 'Installation',
    text: 'Our crew installs cleanly in a single visit, integrating lights and fixtures.',
  },
  {
    no: '05',
    title: 'Walkthrough',
    text: 'We review the finished result together and hand over your warranty.',
  },
]

// PLACEHOLDER — the brief confirms no completed Canadian projects and no
// reviews yet. Replace with real, attributable reviews or remove the whole
// Reviews section before launch. See README "Brief cross-check".
export const reviews = [
  {
    text: 'From the quote to the install, everything was on time and spotless. The gloss ceiling completely transformed our kitchen.',
    name: 'Client Name',
    location: 'Coquitlam, BC',
  },
  {
    text: 'The translucent ceiling in our basement theatre is stunning. Professional crew, tidy work, done in an afternoon.',
    name: 'Client Name',
    location: 'Port Moody, BC',
  },
  {
    text: 'Honest pricing and beautiful work. We’ve already recommended SkyLine to two neighbours.',
    name: 'Client Name',
    location: 'Burnaby, BC',
  },
]

export const faqs = [
  {
    q: 'Does a stretch ceiling look like plastic?',
    a: 'No. A matte finish looks like perfectly painted drywall, while gloss looks like polished lacquer. Up close it reads as a clean, high‑end surface — not cheap plastic.',
  },
  {
    q: 'Will the ceiling sag over time?',
    a: 'No. The membrane is tensioned edge‑to‑edge into a hidden track and stays taut and flat for decades — it does not droop or bag with age.',
  },
  {
    q: 'Is the material easy to tear?',
    a: 'In everyday use, no. The film is tough and holds its tension; only a deliberate cut from a sharp object will damage it, and a single panel can usually be repaired or replaced without dismantling the whole ceiling.',
  },
  {
    q: 'Is it safe around lighting and heat?',
    a: 'Yes. We use certified, fire‑rated film and pair it with cool‑running LED and the correct fixtures, so lighting integrates safely.',
  },
  {
    q: 'How much room height do I lose?',
    a: 'Less than you would expect. A standard PVC system usually sits a little under one inch below the original ceiling, and a Descor system can be as little as a quarter of an inch. A backlit translucent ceiling is the exception — it needs roughly six inches between the LED and the membrane so the light spreads evenly.',
  },
  {
    q: 'Can the ceiling hold a light fixture or a fan?',
    a: 'The membrane is a finish, not a structural surface, so nothing hangs from it. Fixtures, fans and speakers are mounted to the original ceiling above, and every point where something passes through the membrane is reinforced with a ring or collar.',
  },
  {
    q: 'How is it different from a suspended (drop) ceiling?',
    a: 'A suspended ceiling uses a visible metal grid and tiles. A stretch ceiling is one seamless membrane with no grid, no joints and a far more modern, finished look.',
  },
  {
    q: 'How long does installation take?',
    a: 'A standard room is usually finished in four to six hours. Projects with light lines, multiple levels or commercial scope take two to three days. There is no puttying, sanding, painting or long drying time.',
  },
  {
    q: 'Is there anywhere you would not recommend one?',
    a: 'We do not recommend a PVC membrane in unheated spaces — a fabric system is the better choice there — or anywhere the surface faces a high risk of being cut or knocked.',
  },
  {
    q: 'What warranty and areas do you cover?',
    a: 'Every job carries a 15‑year warranty — 10 years on materials, 3 years on installation. We serve Vancouver and the Lower Mainland, from West Vancouver to Langley and White Rock.',
  },
]

// The map outlines the polygon in src/geo/vancouver-boundary.json and frames
// itself to it, so there is no zoom level to keep in sync here.
// `center` only positions the marker.
export const serviceArea = {
  label: 'Vancouver, BC',
  center: { lat: 49.2488, lng: -123.1027 },
}

export const cities = [
  'Vancouver',
  'West Vancouver',
  'North Vancouver',
  'Burnaby',
  'Coquitlam',
  'Richmond',
  'Surrey',
  'Langley',
  'Maple Ridge',
  'White Rock',
]
