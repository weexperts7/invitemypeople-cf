// Written copy for each template's own page (/templates/wedding/:id,
// /satsang/:slug, /templates/ganesh-chaturthi/:slug), kept here as data so the
// page, the server-rendered HTML and the structured data all read one source.
// Plain data only: it is imported by Node and by the Cloudflare function.
//
// Every claim below comes from that template's own data or code (its card
// description, tags and the components it renders). Do not add a feature to a
// template's list unless the template really has it.
//
// templateSeo.js adds the parts that are the same everywhere or must stay in
// step with live data: how ordering works, the price and the links. What lives
// here is what is specific to one template:
//   intro    paragraphs on the look and feel
//   suits    who it is for, from its tradition
//   features what it includes, as phrases that finish "It includes ..."
//   meta     the meta description without a price; templateSeo.js appends
//            the live price, and the whole thing stays 155 characters or fewer

// What every wedding template that uses the shared invitation layout has
// (InvitationExperience.jsx): the landing reveal, the scratch card, the events
// list with a live countdown, the gallery, RSVP and wishes, and music.
export const SHARED_WEDDING_FEATURES = [
  'a tap-to-open envelope reveal',
  'a scratch-to-reveal card for the date',
  'a live countdown',
  'every function (Haldi, Sangeet, the wedding and more) on one page',
  'a photo gallery',
  'RSVP with attendance, guest count and wishes',
  'a wishes wall',
  'optional background music that guests can mute',
]

export const WEDDING_COPY = {
  'mahogany-seal': {
    intro: [
      'Mahogany Seal opens like a film. A rope-pull envelope video plays behind a 3D red wax seal, and when the seal breaks the invitation settles into a gold-on-cream page.',
      'What sets it apart is the caricature video. Our team hand-animates a 3D caricature of the couple for every order, and it sits at the top of the page. No self-serve template includes one.',
    ],
    suits:
      'It suits Hindu couples who want a cinematic, luxury first impression rather than a floral or festive one, and who are happy to share their details on WhatsApp so the caricature can be made.',
    features: [
      'the rope-pull envelope video and 3D wax seal',
      'your own hand-animated caricature video',
      'a couple hero',
      'a live countdown',
      'an itinerary for each ceremony',
      'a scratch-to-reveal date',
      'a gallery',
      'RSVP',
    ],
    meta: 'Mahogany Seal: a cinematic Hindu wedding invitation with a wax-seal envelope reveal and your own hand-animated 3D caricature video.',
  },
  'rajasthani-royal': {
    intro: [
      'Rajasthani Royal is built around the palace. Jharokha arches frame the page, a royal crest medallion sits at its centre, and heavy antique gold glows over deep crimson with a hint of sapphire.',
      'It reads as a heritage invitation: rich, ornate and unhurried, the way a Rajasthani royal wedding looks in the imagination before a single detail is planned.',
    ],
    suits:
      'Choose it for a Hindu wedding with a royal or Rajasthani feel, or for any family that wants gold and crimson to do the talking.',
    meta: 'Rajasthani Royal: a palace-inspired Hindu wedding invitation with jharokha arches, antique gold, envelope reveal, scratch card and RSVP.',
  },
  'royal-festive-vibrant': {
    intro: [
      'A jewel-box mandala medallion in deep crimson, marigold yellow, rani pink and emerald green, set over shimmering gold. Every colour is turned up on purpose.',
      'The mood is the celebration itself. This template is for a couple who wants guests to feel the festivities have started the moment they open the link.',
    ],
    suits:
      'It is a match for Hindu weddings that are colourful and full of events, with a Haldi, a Sangeet and the wedding day all on the same page.',
    meta: 'Royal Festive Vibrant: a colourful Hindu wedding invitation in crimson, marigold, rani pink and emerald, with envelope reveal and RSVP.',
  },
  'gujarati-traditional': {
    intro: [
      'Fresh pastel ivory with a strung marigold garland across the header, bandhani-dot borders and a leheriya-blue accent.',
      'It is light, joyful and unmistakably Gujarati, closer to a bright wedding morning than to a heavy formal card.',
    ],
    suits:
      'It is made for Gujarati Hindu weddings, and for anyone who prefers pastel warmth to deep jewel tones.',
    meta: 'Gujarati Traditional: a pastel Hindu wedding invitation with a marigold garland, bandhani borders and a leheriya-blue accent. RSVP built in.',
  },
  'vrindavan-radha-krishna': {
    intro: [
      'A lotus halo, delicate peacock-feather line art and soft pastel blues, creams and gold. The look is quiet and devotional.',
      'It takes its cue from Vrindavan, the town of Radha and Krishna, so the invitation feels closer to a blessing than to a flyer.',
    ],
    suits:
      'It suits Hindu couples who want a spiritual Radha-Krishna theme, and families who approach the wedding in a devotional spirit.',
    meta: 'Vrindavan Divine: a Radha-Krishna Hindu wedding invitation with a lotus halo, peacock-feather art and soft pastels. RSVP built in.',
  },
  'western-elegant-minimalist': {
    intro: [
      'Clean typography, one restrained floral line-art sprig and soft champagne-blush tones over generous white space.',
      'Nothing competes with the details. It is an invitation for a church wedding and reception with the volume turned down.',
    ],
    suits:
      'It suits Christian weddings, and any couple who wants a modern, minimal invitation with a romantic touch.',
    meta: 'Western Elegant Minimalist: a clean Christian wedding invitation with floral line art and champagne-blush tones. Envelope reveal and RSVP.',
  },
  'south-indian-temple-gold': {
    intro: [
      'A temple gopuram arch crowns the header, with rich matte-gold double-line borders and jasmine and lotus motifs on warm, classic ivory.',
      'It borrows the timeless grammar of a South Indian Kalyanam: gold on ivory, symmetrical and calm.',
    ],
    suits: 'It is made for South Indian weddings and temple-style celebrations.',
    meta: 'South Indian Temple Gold: a gopuram-arch wedding invitation in matte gold with jasmine and lotus motifs on ivory. Envelope reveal and RSVP.',
  },
  'punjabi-phulkari': {
    intro: [
      'Hand-embroidered Bagh Phulkari geometry in crimson and deep maroon, worked over with antique-gold filigree and a royal frame.',
      'The result carries the opulent spirit of a Punjabi wedding inside the structure of a classic card.',
    ],
    suits:
      'It is built for Sikh weddings and the Anand Karaj, and for Punjabi families who want phulkari colour and detail.',
    meta: 'Punjabi Phulkari: a Sikh wedding invitation for the Anand Karaj, in Bagh Phulkari crimson and antique gold. Envelope reveal and RSVP.',
  },
  'royal-mughal': {
    intro: [
      'Intricate jaali lattice work, arched domes and gold over ivory. The design draws on the grandeur of Mughal-era architecture.',
      'The lattice and the arches give the page its structure, so the details sit inside something that feels built rather than decorated.',
    ],
    suits:
      'It is made for a Nikah and Walima, and for families who prefer a Mughal-inspired look.',
    meta: 'Royal Mughal: a Muslim wedding invitation for a Nikah and Walima, with jaali lattice, arched domes and gold on ivory. RSVP built in.',
  },
  'bengali-traditional': {
    intro: [
      'Vermilion red and gold with delicate alpona swirls, the floor art traditional to Bengali celebrations.',
      'Together they capture the warmth of a Bengali wedding morning.',
    ],
    suits: 'It is a fit for Bengali Hindu weddings.',
    meta: 'Bengali Traditional: a Hindu wedding invitation in vermilion red and gold with alpona swirls. Envelope reveal and RSVP.',
  },
  'midnight-noir': {
    intro: [
      'Deep charcoal-black with a radiant gold Art Deco sunburst and sharp chevron borders. It is a black-tie invitation in every line.',
      'The reference is a Gatsby-era soirée: glamorous, dramatic and unashamedly formal.',
    ],
    suits:
      'It suits a Christian or modern evening wedding with a black-tie feel, for a couple who wants the invitation to set that tone.',
    meta: 'Midnight Noir: a black-tie wedding invitation in charcoal and gold with an Art Deco sunburst. Envelope reveal and RSVP.',
  },
  'regal-onyx': {
    intro: [
      'A heraldic gold crest and laurel sprigs over deep emerald-onyx. The mood is quiet, moody grandeur.',
      'It gives a royal look without the pastels, for a couple who wants weight and shadow rather than softness.',
    ],
    suits:
      'It suits Christian weddings with a formal, dark and elegant look.',
    meta: 'Regal Onyx: a Christian wedding invitation with a gold heraldic crest on deep emerald-onyx. Envelope reveal and RSVP.',
  },
  'velvet-theatre': {
    intro: [
      'Red velvet theatre curtains rise on a tap and your names stand centre stage. The rest of the page follows the theatre: gold scratch-off coins hide the date, and your events appear as tickets.',
      'Cream and oxblood keep it clean and editorial, so the drama stays in the curtain rather than in the colours.',
    ],
    suits:
      'It suits Hindu couples who want a modern, playful invitation that still feels grand, and who like the idea of guests reserving a seat.',
    features: [
      'a velvet curtain reveal',
      'gold scratch-off coins for the date',
      'a live countdown',
      'your events as theatre tickets',
      'a framed gallery',
      'RSVP',
      'a wall of love notes',
    ],
    meta: 'Velvet Theatre: a Hindu wedding invitation where red velvet curtains rise, coins scratch off to the date and events become tickets.',
  },
  'rang-mahal': {
    intro: [
      'Rang Mahal is a block-printed Rajasthani card that guests work with their hands. They pull a silk latkan to swing open the gatefold onto a marigold toran, light diyas to reveal your date, and walk the Saat Phere around the sacred fire.',
      'Each ceremony then appears as its own miniature print, so the schedule reads like a small collection of cards.',
    ],
    suits:
      'It is made for Hindu weddings that want Rajasthani craft and ritual in the invitation: the Saat Phere, the marigolds and the diyas.',
    features: [
      'a latkan-pull gatefold reveal',
      'diyas that light up the date',
      'a Saat Phere section',
      'each ceremony as its own print',
      'a live countdown',
      'RSVP',
      'a blessings wall',
    ],
    meta: 'Rang Mahal: a block-printed Rajasthani Hindu wedding invitation. Pull the latkan, light diyas for the date and walk the Saat Phere.',
  },
}

export const SATSANG_COPY = {
  'shukrana-darshan': {
    intro: [
      "Shukrana Darshan is a Guruji Satsang invitation built around doing rather than reading. Guests light a jyot, and its glow opens into Guruji's darshan.",
      "From there the invitation asks something of the guest. They chant together on the Sangat Jaap, a mala whose count the whole sangat shares, open a rose to receive one of Guruji's vachans, offer seva as they RSVP, and leave their shukrana on a wall everyone can read.",
    ],
    suits:
      'It suits hosts of a Guruji Satsang who want the sangat to take part in the invitation itself, not only read the date and venue.',
    features: [
      'a jyot that opens the invitation',
      'the Sangat Jaap, a shared mala',
      "a rose that opens to a vachan of Guruji's",
      'seva offered together with the RSVP',
      'the Shukrana Wall',
      'programme and langar prasad details',
      'an optional invite-only note',
    ],
    meta: "Shukrana Darshan: a Guruji Satsang invitation. Guests light the jyot, chant on a shared mala, open a rose for Guruji's vachan and RSVP.",
  },
  'gulab-marg': {
    intro: [
      "Gulab Marg is bright where Shukrana Darshan is dark. It opens on a carved garden gate, and a tap swings the doors open onto Guruji's darshan.",
      "Scrolling down walks the guest along a rose vine that grows as they read. At the end each guest offers a rose to a bouquet that grows with the whole sangat, and opens a note with Guruji's vachan.",
    ],
    suits:
      'It suits hosts who want a soft daylight look in pink and gold with a garden theme, rather than the lamp-lit mood of Shukrana Darshan.',
    features: [
      'a garden gate that opens onto the darshan',
      'a rose vine that grows as guests read',
      "a note with Guruji's vachan",
      'a rose bouquet that grows with every guest',
      'a live countdown',
      'programme and langar prasad details',
      'RSVP and a Shukrana Wall',
    ],
    meta: "Gulab Marg: a rose-garden Guruji Satsang invitation. Open the gate, follow the rose vine, receive Guruji's vachan and offer a rose.",
  },
}

// Ganesh Chaturthi templates are fully designed but ordering is not open yet,
// so none of this copy mentions a price.
export const GANESH_COPY = {
  'marigold-mandap': {
    intro: [
      'A vivid marigold-and-gold mandap unfolds as five chapters. Sacred red curtains part on a tap to reveal Bappa, framed by a marigold garland border.',
      'It is the brightest of the Ganesh Chaturthi designs, made for a home or society celebration that wants colour from the first screen.',
    ],
    suits: 'It suits a Ganesh Chaturthi celebration that wants a joyful, colourful welcome.',
    features: [
      'a tap-to-reveal curtain',
      'a marigold garland border',
      'the full puja muhurat',
      'interactive RSVP',
      'a blessing wall',
    ],
    meta: 'Marigold Mandap: a Ganesh Chaturthi invitation with a tap-to-reveal curtain, marigold border, puja muhurat and blessing wall. Launching soon.',
  },
  'golden-trunk-blessing': {
    intro: [
      "Bappa's photo takes centre stage inside a golden symmetric panel, framed by a modak-and-mandala border in deep vermilion and gold.",
      'A scratch-to-reveal golden modak card uncovers a personal blessing for the guest.',
    ],
    suits: 'It suits a celebration that wants a formal, symmetrical look with a small surprise for each guest.',
    features: [
      'a golden symmetric panel',
      'a modak-and-mandala border',
      'a scratch-to-reveal blessing card',
      'the full puja muhurat',
      'RSVP',
      'a blessing wall',
    ],
    meta: 'Golden Trunk Blessing: a Ganesh Chaturthi invitation with a modak-and-mandala border and a scratch-to-reveal blessing card. Launching soon.',
  },
  'vermilion-lotus-aarti': {
    intro: [
      "A radiant vermilion-red canvas glowing with gold lotus accents. It is an aarti-lit welcome to Bappa's ten-day stay.",
      'A curtain opens on a tap, and the puja muhurat, RSVP and blessing wall follow.',
    ],
    suits: "It suits a household or mandal welcoming Bappa for the full ten days.",
    features: [
      'a tap-to-reveal curtain',
      'gold lotus accents',
      'the full puja muhurat',
      'RSVP',
      'a blessing wall',
    ],
    meta: "Vermilion Lotus Aarti: a Ganesh Chaturthi invitation in vermilion and gold lotus for Bappa's ten-day stay. Tap-to-reveal curtain. Launching soon.",
  },
  'emerald-doob-grace': {
    intro: [
      'A serene emerald-green canvas edged in gold, honouring the sacred doob grass offered to Bappa.',
      'It is a peaceful, grounded welcome, with a curtain that opens on a tap.',
    ],
    suits: 'It suits a celebration that prefers a calm green and gold look to red and marigold.',
    features: [
      'a tap-to-reveal curtain',
      'an emerald and gold design inspired by doob grass',
      'the full puja muhurat',
      'RSVP',
      'a blessing wall',
    ],
    meta: 'Emerald Doob Grace: a calm emerald-and-gold Ganesh Chaturthi invitation honouring sacred doob grass, with a tap-to-reveal curtain. Launching soon.',
  },
  'royal-durbar-darshan': {
    intro: [
      "A cinematic, photo-led welcome fit for a king. Bappa's portrait rises inside a crowned jharokha niche over a full-bleed festival photograph.",
      'Below it a scrollable gallery shows real festival moments, and the puja muhurat unfurls as a parchment scroll.',
    ],
    suits: 'It suits a celebration that has photographs to show and wants a grand, regal welcome in maroon and gold.',
    features: [
      'a crowned jharokha niche',
      'a full-bleed festival photograph',
      'a scrollable photo gallery',
      'a parchment scroll of the puja muhurat',
      'RSVP',
      'a blessing wall',
    ],
    meta: 'Royal Durbar Darshan: a photo-led Ganesh Chaturthi invitation with a jharokha niche, festival gallery and parchment puja-muhurat scroll. Launching soon.',
  },
  'divine-threshold': {
    intro: [
      'A full-bleed festival photograph stands behind two ornate temple doors that swing open on a tap to reveal Bappa, in marigold orange, auspicious red and sacred gold.',
      'A day-by-day festival timeline then lays out the Sthapana, the daily Aarti and the Visarjan with Maha Prasad at a glance.',
    ],
    suits: 'It suits a multi-day celebration, such as a community mandal, that wants the whole schedule visible in one view.',
    features: [
      'temple doors that open on a tap',
      'a full-bleed festival photograph',
      'a day-by-day festival timeline',
      'a swipeable photo gallery',
      'RSVP',
      'a blessing wall',
    ],
    meta: 'Divine Threshold: a Ganesh Chaturthi invitation where temple doors open to reveal Bappa, with a day-by-day festival timeline and gallery. Launching soon.',
  },
}
