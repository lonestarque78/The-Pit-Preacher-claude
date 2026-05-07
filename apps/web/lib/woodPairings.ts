export type Wood = { id: string; name: string; flavor: string; intensity: number }
export type Meat = { id: string; name: string; sub: string }
export type Pairing = { rating: string; tags: string[]; preacher: string; notes: string[] }
export type PairingsMap = Record<string, Pairing>

export const WOODS: Wood[] = [
  { id: 'post_oak', name: 'Post Oak', flavor: 'Clean, medium smoke. The backbone of Texas BBQ.', intensity: 3 },
  { id: 'hickory', name: 'Hickory', flavor: 'Bold and strong. Easy to over-smoke. Classic Southern.', intensity: 5 },
  { id: 'mesquite', name: 'Mesquite', flavor: 'Intense and fast-burning. West Texas tradition.', intensity: 5 },
  { id: 'apple', name: 'Apple', flavor: 'Mild and sweet. Patient wood. Great for long cooks.', intensity: 2 },
  { id: 'cherry', name: 'Cherry', flavor: 'Fruity and rich. Beautiful color on the bark.', intensity: 2 },
  { id: 'pecan', name: 'Pecan', flavor: 'Nutty and mild. A Texas staple. Forgiving and versatile.', intensity: 3 },
  { id: 'maple', name: 'Maple', flavor: 'Subtle sweetness. Great for poultry and ham.', intensity: 2 },
  { id: 'alder', name: 'Alder', flavor: 'Delicate and light. The classic choice for salmon.', intensity: 1 },
  { id: 'walnut', name: 'Walnut', flavor: 'Heavy and bitter. Use sparingly or blend with fruit wood.', intensity: 4 },
  { id: 'competition', name: 'Competition Blend', flavor: 'Engineered for bark and color. Trust the blend.', intensity: 3 },
]

export const MEATS: Meat[] = [
  { id: 'beef', name: 'Beef', sub: 'Brisket, ribs, steaks, roasts' },
  { id: 'pork', name: 'Pork', sub: 'Shoulder, ribs, belly, chops' },
  { id: 'poultry', name: 'Poultry', sub: 'Chicken, turkey, duck' },
  { id: 'seafood', name: 'Seafood', sub: 'Salmon, fish, shrimp' },
  { id: 'lamb', name: 'Lamb', sub: 'Leg, rack, shoulder' },
  { id: 'vegetables', name: 'Vegetables', sub: 'Cauliflower, peppers, corn' },
]

export const PAIRINGS: PairingsMap = {
  post_oak_beef: {
    rating: 'Classic',
    tags: ['Traditional', 'Medium Smoke', 'Bark-Friendly', 'Earthy'],
    preacher: "Post oak on beef is the Central Texas sacrament. Medium smoke, clean burn, lets the beef speak. This is the pairing that built a religion.",
    notes: [
      "Smoke penetration peaks at hour 4 — after that bark development takes over",
      "Watch for deep mahogany color — that is your signal",
      "Post oak burns clean and long — ideal for 10-12 hour brisket cooks",
    ],
  },
  post_oak_pork: {
    rating: 'Excellent',
    tags: ['Versatile', 'Medium Smoke', 'Clean Finish'],
    preacher: "Post oak works on pork without overwhelming it. The smoke complements rather than competes.",
    notes: [
      "Works especially well on pork butt for the first 4-6 hours",
      "Pairs well with simple salt and pepper or SPG rub",
      "Clean finish means the pork flavor comes through clearly",
    ],
  },
  post_oak_poultry: {
    rating: 'Good',
    tags: ['Medium Smoke', 'Clean'],
    preacher: "Post oak on poultry is solid but not the first choice. The smoke is present without being aggressive.",
    notes: [
      "Keep cook times short enough that smoke does not overwhelm",
      "Works better on dark meat than white meat",
      "2-3 hours maximum smoke exposure for best results",
    ],
  },
  post_oak_seafood: {
    rating: 'Use Caution',
    tags: ['Can Overpower', 'Use Sparingly'],
    preacher: "Post oak on seafood is asking the wood to do too much. The smoke can overpower delicate fish in under an hour.",
    notes: [
      "Never more than 30-45 minutes for salmon or fish",
      "Works better on heartier seafood like swordfish",
      "Consider apple or alder instead",
    ],
  },
  post_oak_lamb: {
    rating: 'Excellent',
    tags: ['Complementary', 'Medium Smoke', 'Traditional'],
    preacher: "Oak and lamb is a combination with deep roots. The earthy smoke complements the rich flavor of the meat without fighting it.",
    notes: [
      "Leg of lamb benefits from 3-4 hours of post oak smoke",
      "The fat in lamb carries smoke well",
      "Pairs beautifully with Mediterranean-style seasoning",
    ],
  },
  post_oak_vegetables: {
    rating: 'Good',
    tags: ['Light Application', 'Earthy'],
    preacher: "Post oak adds earthy depth to vegetables without turning them bitter. A short smoke session transforms ordinary sides into something worth talking about.",
    notes: [
      "30-60 minutes is all vegetables need",
      "Works especially well on whole cauliflower and corn",
      "Do not over-smoke — vegetables absorb quickly",
    ],
  },
  hickory_beef: {
    rating: 'Classic',
    tags: ['Bold', 'Southern Tradition', 'Strong Smoke'],
    preacher: "Hickory and beef is the Southern classic. Bold smoke, strong flavor, the combination that defines Memphis and Carolina beef traditions.",
    notes: [
      "Use sparingly on long cooks — hickory can turn bitter after 6+ hours",
      "Ideal for the first 3-4 hours then let the fire run cleaner",
      "Exceptional on beef ribs and chuck roasts",
    ],
  },
  hickory_pork: {
    rating: 'Classic',
    tags: ['Bold', 'Traditional', 'Strong Smoke', 'Southern'],
    preacher: "Hickory on pork is the soul of Southern BBQ. Pulled pork, ribs, shoulder — hickory defines the flavor profile of half the BBQ belt.",
    notes: [
      "The gold standard for Memphis-style ribs",
      "Pairs perfectly with sweet rubs and tangy sauces",
      "Manage exposure time — too much hickory on pork turns sharp",
    ],
  },
  hickory_poultry: {
    rating: 'Use Caution',
    tags: ['Can Overpower', 'Use Sparingly'],
    preacher: "Hickory on chicken is a high-wire act. Done right it adds depth. Done wrong it turns the bird bitter and harsh. Keep the smoke light.",
    notes: [
      "No more than 1-2 hours of hickory smoke on poultry",
      "Blend with apple or cherry for better balance",
      "Works better on whole birds than pieces",
    ],
  },
  hickory_seafood: {
    rating: 'Avoid',
    tags: ['Too Aggressive', 'Overpowers'],
    preacher: "Hickory will destroy seafood. The smoke is too aggressive for anything that delicate. Choose alder or apple and thank me later.",
    notes: [
      "Hickory overpowers fish flavor completely",
      "Even short exposure leaves a harsh aftertaste",
      "Use alder for salmon, apple for shrimp",
    ],
  },
  hickory_lamb: {
    rating: 'Good',
    tags: ['Bold Pairing', 'Strong'],
    preacher: "Hickory and lamb is bold meeting bold. The strong smoke can stand up to lamb's assertive flavor. Not traditional but not wrong.",
    notes: [
      "Keep smoke exposure to 2-3 hours maximum",
      "Works best on larger cuts like leg of lamb",
      "Use a herb-forward rub to bridge the two strong flavors",
    ],
  },
  hickory_vegetables: {
    rating: 'Use Caution',
    tags: ['Heavy', 'Short Exposure Only'],
    preacher: "Hickory on vegetables requires a very light hand. Twenty minutes of hickory smoke on a whole cauliflower is interesting. An hour is a mistake.",
    notes: [
      "Maximum 20-30 minutes of hickory smoke",
      "Works on hearty vegetables like eggplant and peppers",
      "Avoid delicate vegetables entirely",
    ],
  },
  mesquite_beef: {
    rating: 'Classic',
    tags: ['West Texas', 'Intense', 'Traditional'],
    preacher: "Mesquite and beef is West Texas religion. Direct heat, fast burn, intense smoke. Santa Maria tri-tip lives here.",
    notes: [
      "Best for hot and fast cooks under 4 hours",
      "Mesquite burns hot — manage your fire carefully",
      "Exceptional for steaks and tri-tip over direct heat",
    ],
  },
  mesquite_pork: {
    rating: 'Use Caution',
    tags: ['Intense', 'Easy to Over-Smoke'],
    preacher: "Mesquite on pork demands respect. The intensity can overwhelm pork's natural sweetness quickly.",
    notes: [
      "First hour only for mesquite smoke on pork",
      "Blend with fruit wood to soften the intensity",
      "Not recommended for long cooks like pork butt",
    ],
  },
  mesquite_poultry: {
    rating: 'Avoid',
    tags: ['Too Aggressive', 'Bitter Risk'],
    preacher: "Mesquite on chicken is a gamble that rarely pays off. The smoke moves too fast and too hard for poultry.",
    notes: [
      "The intensity overwhelms poultry's mild flavor",
      "Even 30 minutes can produce off flavors",
      "Choose apple, cherry, or pecan instead",
    ],
  },
  mesquite_seafood: {
    rating: 'Avoid',
    tags: ['Far Too Aggressive'],
    preacher: "Do not do this. Mesquite and seafood do not belong in the same conversation.",
    notes: [
      "Mesquite smoke destroys delicate seafood flavor completely",
      "No amount of time is appropriate",
      "Use alder or apple for all seafood",
    ],
  },
  mesquite_lamb: {
    rating: 'Good',
    tags: ['Bold', 'Southwestern', 'Complementary'],
    preacher: "Mesquite and lamb is a Southwestern pairing worth exploring. The bold smoke can match lamb's assertive flavor.",
    notes: [
      "Best for direct heat or hot and fast lamb cooks",
      "2 hours maximum smoke exposure",
      "Works beautifully with Southwestern spices",
    ],
  },
  mesquite_vegetables: {
    rating: 'Good',
    tags: ['Intense', 'Short Cook Only'],
    preacher: "A kiss of mesquite on vegetables creates something memorable. Fifteen minutes over mesquite coals transforms corn and peppers completely.",
    notes: [
      "Direct heat only — short exposure",
      "Excellent for grilled vegetables over open fire",
      "Not appropriate for low and slow smoking",
    ],
  },
  apple_beef: {
    rating: 'Good',
    tags: ['Mild', 'Subtle', 'Color-Friendly'],
    preacher: "Apple on beef is a light touch on a bold canvas. Good for when you want a hint of sweetness without the bark going dark.",
    notes: [
      "Works well blended with oak or hickory",
      "Keeps bark color lighter — good for competition presentation",
      "Best for shorter beef cooks like burgers and steaks",
    ],
  },
  apple_pork: {
    rating: 'Excellent',
    tags: ['Sweet', 'Complementary', 'Traditional', 'Versatile'],
    preacher: "Apple and pork is one of the great natural pairings in BBQ. The sweetness complements the natural sweetness of pork. Patient wood for patient cooks.",
    notes: [
      "The standard choice for competition pork ribs",
      "Use for the full cook — apple is mild enough to go the distance",
      "Pairs perfectly with sweet rubs and apple-based spritzes",
    ],
  },
  apple_poultry: {
    rating: 'Classic',
    tags: ['Sweet', 'Mild', 'Traditional', 'Complementary'],
    preacher: "Apple on chicken and turkey is one of the safest and most satisfying pairings in BBQ. Sweet, mild, and complementary. Hard to mess up.",
    notes: [
      "Full cook exposure is fine — apple is too mild to overwhelm",
      "Creates beautiful golden-brown skin color",
      "The standard choice for competition chicken",
    ],
  },
  apple_seafood: {
    rating: 'Excellent',
    tags: ['Mild', 'Sweet', 'Complementary'],
    preacher: "Apple wood is one of the better choices for seafood. Light enough not to overpower, just enough smoke to add a layer of flavor.",
    notes: [
      "45-60 minutes maximum for most seafood",
      "Exceptional on salmon and trout",
      "Creates a delicate smoke flavor that complements rather than competes",
    ],
  },
  apple_lamb: {
    rating: 'Good',
    tags: ['Sweet', 'Mild', 'Complementary'],
    preacher: "Apple softens lamb's natural intensity and adds a gentle sweetness. Not the boldest pairing but a reliable one.",
    notes: [
      "Works well for the full cook duration",
      "Pairs well with herb-based rubs",
      "A good choice for guests unfamiliar with lamb",
    ],
  },
  apple_vegetables: {
    rating: 'Excellent',
    tags: ['Sweet', 'Mild', 'Versatile'],
    preacher: "Apple smoke on vegetables is almost always a good idea. Mild enough for delicate vegetables, sweet enough to add interest to heartier ones.",
    notes: [
      "Works on virtually any vegetable",
      "30-60 minutes of apple smoke transforms most sides",
      "Exceptional on sweet potatoes, squash, and corn",
    ],
  },
  cherry_beef: {
    rating: 'Excellent',
    tags: ['Color', 'Sweet', 'Rich', 'Bark-Friendly'],
    preacher: "Cherry wood on beef does something almost magical to the color. Deep mahogany bark, rich flavor, sweet smoke that complements without competing.",
    notes: [
      "Cherry creates exceptional bark color — deep red-mahogany",
      "Blend with oak for flavor depth plus color",
      "Works for full cook duration without turning bitter",
    ],
  },
  cherry_pork: {
    rating: 'Classic',
    tags: ['Sweet', 'Color', 'Competition', 'Traditional'],
    preacher: "Cherry and pork is a competition favorite for good reason. The color it produces on ribs and shoulder is unmatched.",
    notes: [
      "The go-to wood for competition rib color",
      "Creates the deep red smoke ring competition judges look for",
      "Can be used for full cook duration",
    ],
  },
  cherry_poultry: {
    rating: 'Classic',
    tags: ['Sweet', 'Color', 'Mild', 'Beautiful'],
    preacher: "Cherry on poultry gives you the most beautiful skin color in BBQ. Deep mahogany, sweet flavor, and a presentation that makes people reach for their phones.",
    notes: [
      "Full cook exposure is appropriate",
      "Creates stunning skin color on whole birds",
      "Pairs well with sweet or herb-based rubs",
    ],
  },
  cherry_seafood: {
    rating: 'Good',
    tags: ['Mild', 'Sweet', 'Complementary'],
    preacher: "Cherry is one of the gentler options for seafood. The sweetness complements rather than overwhelms.",
    notes: [
      "30-45 minutes maximum for most seafood",
      "Creates beautiful color on salmon skin",
      "Works well with honey or citrus glazes",
    ],
  },
  cherry_lamb: {
    rating: 'Excellent',
    tags: ['Sweet', 'Rich', 'Color', 'Complementary'],
    preacher: "Cherry and lamb is an underrated pairing. The sweetness of the wood balances the richness of the meat.",
    notes: [
      "Works for full cook duration on larger lamb cuts",
      "Creates exceptional color on leg of lamb",
      "Pairs well with fruit-based sauces",
    ],
  },
  cherry_vegetables: {
    rating: 'Excellent',
    tags: ['Sweet', 'Color', 'Mild'],
    preacher: "Cherry smoke adds both flavor and color to vegetables. Light enough to not overwhelm, sweet enough to add real interest.",
    notes: [
      "Creates beautiful color on pale vegetables like cauliflower",
      "30-45 minutes is ideal for most vegetables",
      "Works exceptionally well on root vegetables",
    ],
  },
  pecan_beef: {
    rating: 'Excellent',
    tags: ['Nutty', 'Mild', 'Versatile', 'Texas'],
    preacher: "Pecan on beef is a Texas staple that never disappoints. Nutty, mild, and versatile enough to work on every cut from brisket to burgers.",
    notes: [
      "Can be used for full cook duration without turning bitter",
      "Pairs well with virtually any rub style",
      "A reliable choice when you want smoke without the boldness of hickory",
    ],
  },
  pecan_pork: {
    rating: 'Classic',
    tags: ['Nutty', 'Sweet', 'Versatile', 'Traditional'],
    preacher: "Pecan on pork is a Southern tradition with deep roots. The nutty sweetness complements pork beautifully at every level.",
    notes: [
      "Works for full cook duration on all pork cuts",
      "Pairs well with sweet and savory rubs alike",
      "A competition-proven choice for pork categories",
    ],
  },
  pecan_poultry: {
    rating: 'Excellent',
    tags: ['Nutty', 'Mild', 'Versatile'],
    preacher: "Pecan on poultry is one of the most reliable pairings in BBQ. Mild enough not to overwhelm, flavorful enough to matter.",
    notes: [
      "Full cook exposure is appropriate",
      "Creates good color without going too dark",
      "Works on all poultry from wings to whole turkey",
    ],
  },
  pecan_seafood: {
    rating: 'Good',
    tags: ['Mild', 'Nutty', 'Complementary'],
    preacher: "Pecan is one of the better wood choices for seafood — mild enough to complement without overpowering.",
    notes: [
      "45-60 minutes maximum for most seafood",
      "Works particularly well on shrimp and heartier fish",
      "A more interesting choice than alder with less risk than hickory",
    ],
  },
  pecan_lamb: {
    rating: 'Good',
    tags: ['Nutty', 'Mild', 'Complementary'],
    preacher: "Pecan softens lamb's intensity and adds a pleasant nutty note. Not the boldest pairing but a consistent one.",
    notes: [
      "Works well for full cook duration",
      "Pairs well with herb-forward rubs",
      "A good choice for cooks who want smoke without boldness",
    ],
  },
  pecan_vegetables: {
    rating: 'Excellent',
    tags: ['Nutty', 'Mild', 'Versatile'],
    preacher: "Pecan smoke on vegetables adds a nutty richness that elevates simple sides into something memorable.",
    notes: [
      "30-60 minutes works for most vegetables",
      "Exceptional on corn, sweet potatoes, and squash",
      "Pairs well with butter and herb-based preparations",
    ],
  },
  maple_beef: {
    rating: 'Good',
    tags: ['Subtle', 'Sweet', 'Mild'],
    preacher: "Maple on beef is a subtle choice. The sweetness is there but barely. Use it when you want smoke without commitment.",
    notes: [
      "Works best blended with a stronger wood",
      "Good for shorter beef cooks",
      "Keeps bark color light",
    ],
  },
  maple_pork: {
    rating: 'Excellent',
    tags: ['Sweet', 'Mild', 'Complementary'],
    preacher: "Maple and pork is a natural pairing. The subtle sweetness complements pork without overwhelming it. A reliable choice for any pork cut.",
    notes: [
      "Works for full cook duration",
      "Pairs well with sweet rubs and brown sugar preparations",
      "Exceptional on pork belly and ham",
    ],
  },
  maple_poultry: {
    rating: 'Excellent',
    tags: ['Sweet', 'Mild', 'Traditional'],
    preacher: "Maple on poultry produces beautiful color and gentle sweetness. One of the cleanest pairings in BBQ.",
    notes: [
      "Full cook exposure is appropriate",
      "Creates golden skin color",
      "Works on all poultry cuts",
    ],
  },
  maple_seafood: {
    rating: 'Excellent',
    tags: ['Mild', 'Sweet', 'Gentle'],
    preacher: "Maple is one of the better wood choices for seafood. Gentle enough not to overwhelm, flavorful enough to matter.",
    notes: [
      "45-60 minutes maximum",
      "Works well on salmon and trout",
      "Pairs beautifully with maple glazes",
    ],
  },
  maple_lamb: {
    rating: 'Good',
    tags: ['Mild', 'Sweet'],
    preacher: "Maple on lamb adds gentle sweetness without the boldness lamb can sometimes need. A softer approach to a strong meat.",
    notes: [
      "Works for full cook duration",
      "Best on smaller lamb cuts",
      "Pairs well with mint and herb preparations",
    ],
  },
  maple_vegetables: {
    rating: 'Excellent',
    tags: ['Sweet', 'Mild', 'Versatile'],
    preacher: "Maple smoke on vegetables is consistently good. Sweet, gentle, and complementary to almost anything from the garden.",
    notes: [
      "30-60 minutes for most vegetables",
      "Exceptional on sweet potatoes and squash",
      "Pairs well with butter glazes",
    ],
  },
  alder_beef: {
    rating: 'Use Caution',
    tags: ['Too Light', 'Subtle'],
    preacher: "Alder on beef is like whispering in a thunderstorm. The smoke is too delicate for beef's bold flavor. You will barely notice it.",
    notes: [
      "Only appropriate for quick beef cooks",
      "You will need to use significant quantities to taste anything",
      "Consider a stronger wood for beef",
    ],
  },
  alder_pork: {
    rating: 'Good',
    tags: ['Delicate', 'Light'],
    preacher: "Alder on pork is a lighter approach. The smoke is present but gentle. Works for cooks who want minimal smoke influence.",
    notes: [
      "Best for tenderloin and quick pork cooks",
      "Not appropriate for long low and slow cooks",
      "Blend with pecan or apple for more flavor",
    ],
  },
  alder_poultry: {
    rating: 'Good',
    tags: ['Delicate', 'Light', 'Traditional'],
    preacher: "Alder on poultry keeps things clean and subtle. Good smoke flavor without any risk of overpowering the bird.",
    notes: [
      "Full cook exposure is fine",
      "Creates light golden color",
      "A safe choice for anyone new to smoking poultry",
    ],
  },
  alder_seafood: {
    rating: 'Classic',
    tags: ['Traditional', 'Delicate', 'Pacific Northwest'],
    preacher: "Alder and salmon is the Pacific Northwest tradition. Delicate smoke that enhances rather than competes. This is the classic for good reason.",
    notes: [
      "The traditional choice for smoked salmon",
      "45-60 minutes is perfect",
      "Pairs beautifully with lemon, dill, and citrus preparations",
    ],
  },
  alder_lamb: {
    rating: 'Use Caution',
    tags: ['Too Light'],
    preacher: "Alder on lamb is almost too delicate to matter. The wood does not have the strength to complement lamb's assertive flavor.",
    notes: [
      "You will barely taste the smoke",
      "Consider a stronger wood for lamb",
      "Only use if you want minimal smoke influence",
    ],
  },
  alder_vegetables: {
    rating: 'Good',
    tags: ['Delicate', 'Light', 'Clean'],
    preacher: "Alder on vegetables is clean and light. Good for delicate vegetables where other woods might overwhelm.",
    notes: [
      "Perfect for asparagus and delicate greens",
      "30 minutes maximum",
      "Pairs well with light herb preparations",
    ],
  },
  walnut_beef: {
    rating: 'Use Caution',
    tags: ['Heavy', 'Bitter Risk'],
    preacher: "Walnut on beef can be interesting or terrible depending on how you use it. Blend it with oak or cherry and keep the exposure short.",
    notes: [
      "Blend with other woods — never use alone",
      "Maximum 2 hours of walnut smoke",
      "Watch carefully for bitter flavors developing",
    ],
  },
  walnut_pork: {
    rating: 'Use Caution',
    tags: ['Heavy', 'Use Sparingly'],
    preacher: "Walnut on pork needs a careful hand. The bitterness can develop quickly and ruin an otherwise good cook.",
    notes: [
      "Blend with apple or cherry at a 1:3 ratio",
      "First 1-2 hours only",
      "Better options exist for pork",
    ],
  },
  walnut_poultry: {
    rating: 'Avoid',
    tags: ['Too Heavy', 'Bitter'],
    preacher: "Walnut on poultry is a mistake waiting to happen. The bitterness develops too fast on delicate meat.",
    notes: [
      "Avoid for all poultry",
      "Even short exposure produces off flavors",
      "Choose apple, cherry, or pecan instead",
    ],
  },
  walnut_seafood: {
    rating: 'Avoid',
    tags: ['Far Too Heavy'],
    preacher: "Walnut and seafood is not a combination any pitmaster should attempt. The heavy bitterness destroys delicate fish flavor.",
    notes: [
      "Never use walnut on seafood",
      "The bitterness is immediate and overwhelming",
      "Use alder or apple for all seafood",
    ],
  },
  walnut_lamb: {
    rating: 'Good',
    tags: ['Bold', 'Earthy', 'Complementary'],
    preacher: "Walnut is one of the few meats that can stand up to walnut's aggressive character. Blend it carefully and the result is earthy and complex.",
    notes: [
      "Blend with oak at a 1:2 ratio",
      "2-3 hours maximum",
      "Pairs well with bold herb and spice rubs",
    ],
  },
  walnut_vegetables: {
    rating: 'Use Caution',
    tags: ['Heavy', 'Short Only'],
    preacher: "Walnut on vegetables is interesting in very small doses. Fifteen minutes adds complexity. Thirty minutes adds bitterness.",
    notes: [
      "Maximum 15-20 minutes",
      "Works on hearty root vegetables only",
      "Blend with apple to soften the bitterness",
    ],
  },
  competition_beef: {
    rating: 'Excellent',
    tags: ['Engineered', 'Color', 'Bark', 'Versatile'],
    preacher: "Competition blends are built for beef. Bark color, smoke ring, presentation — the blend does the work so you can focus on the cook.",
    notes: [
      "Designed specifically for competition results",
      "Consistent flavor profile every cook",
      "Follow the blend manufacturer recommendations for exposure time",
    ],
  },
  competition_pork: {
    rating: 'Excellent',
    tags: ['Engineered', 'Color', 'Versatile'],
    preacher: "Competition blends on pork deliver consistent results. The blend is engineered to hit the right notes for judges and backyard guests alike.",
    notes: [
      "Reliable color and flavor every time",
      "Works for full cook duration",
      "A safe choice when you need consistent results",
    ],
  },
  competition_poultry: {
    rating: 'Good',
    tags: ['Versatile', 'Consistent'],
    preacher: "Competition blends work on poultry though they are built more for beef and pork. Consistent results without the precision of single-wood selection.",
    notes: [
      "Full cook exposure is fine",
      "Creates good color",
      "A reliable backup when you are out of apple or cherry",
    ],
  },
  competition_seafood: {
    rating: 'Use Caution',
    tags: ['Can Overpower'],
    preacher: "Competition blends are built for bold meats. On seafood the complexity can overwhelm delicate flavors. Use sparingly if at all.",
    notes: [
      "30 minutes maximum on seafood",
      "The blend's boldness can overwhelm fish",
      "Consider alder or apple instead",
    ],
  },
  competition_lamb: {
    rating: 'Good',
    tags: ['Versatile', 'Bold'],
    preacher: "Competition blends hold their own against lamb's assertive flavor. Consistent and reliable for a meat that can be unpredictable.",
    notes: [
      "Works for most of the cook duration",
      "Creates good color and smoke ring",
      "A solid choice when you want consistent results",
    ],
  },
  competition_vegetables: {
    rating: 'Good',
    tags: ['Versatile', 'Consistent'],
    preacher: "Competition blends on vegetables add complexity and color. More interesting than a single mild wood, more manageable than a single bold wood.",
    notes: [
      "30-45 minutes for most vegetables",
      "Creates good color",
      "A versatile choice for mixed vegetable cooks",
    ],
  },
}
