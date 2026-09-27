import { StoryChapter } from '../types/story';

export const STORY_CHAPTERS: StoryChapter[] = [
  // --------------------------------------------------------------------------
  // CHAPTER 1: The Flight to Dream Forest (Level 1)
  // --------------------------------------------------------------------------
  {
    id: 1,
    chapterNumber: 1,
    title: 'The Flight to Dream Forest',
    subtitle: 'Where a runaway boy laid the very first stone of his fantasy.',
    levelReq: 1,
    sketchIcon: '🏡',
    summary: 'Exhausted by grey concrete and endless noise, a young boy ran far into the mythical Dream Forest. There, he built a small timber cottage.',
    bgGradient: 'from-[#1b2a1a] via-[#121c12] to-[#0a100a]',
    aceLore: {
      natureMessage: 'Nature embraces your quiet escape, whispering peace through pine needles.',
      peopleMessage: 'Though you fled alone, your heart secretly longs to shelter others.',
      selfMessage: 'In your solitary step lies the spark of a true pioneer.',
    },
    slides: [
      {
        id: 'c1-1',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Runaway Dreamer',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'dream_forest',
        text: 'I ran... I ran until the blaring sirens and towering grey skyscrapers faded into distant memories. My feet were bruised, but my heart finally felt light.',
      },
      {
        id: 'c1-2',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Runaway Dreamer',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'dream_forest',
        text: 'The adults in the city always talked about deadlines, quotas, and burnout. They worked until their eyes turned dull. I swore I would never let my dreams wither like that.',
      },
      {
        id: 'c1-3',
        speakerName: 'Forest Whispers',
        speakerRole: 'Guardian Spirit of the Dream Forest',
        speakerType: 'nature',
        avatarIcon: '🌿',
        backgroundMood: 'dream_forest',
        text: 'Welcome, young one. This is the Dream Forest — a realm where thoughts take shape as timber and sunstone plinths. What will you build in this quiet clearing?',
      },
      {
        id: 'c1-4',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Runaway Dreamer',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'sunlit_clearing',
        text: 'A city! But not like the noisy ones. A city of cozy timber cottages, glowing lanterns, and endless green groves where no one ever has to feel trapped.',
      },
      {
        id: 'c1-5',
        speakerName: 'System / ACE Guardian',
        speakerRole: 'The Bond of Creation',
        speakerType: 'system',
        avatarIcon: '✦',
        backgroundMood: 'sunlit_clearing',
        text: 'Three elemental bonds slumber within this forest: Nature, People, and Self. Remember: in each chapter, you may invoke only ONE ACE bond. To trust one deeply is more meaningful than relying on distant blessings.',
        optionChoice: {
          prompt: 'Which bond will guide your first foundation in the forest?',
          options: [
            {
              text: 'Invoke Bond with Nature (Grove Serenity)',
              aceBond: 'nature',
              reflectionResponse: 'The ancient emerald pines sway in approval. Your roots grow deep into the soil.',
            },
            {
              text: 'Invoke Bond with People (Hearth Warmth)',
              aceBond: 'people',
              reflectionResponse: 'Golden amber lanterns light up the porch, waiting for weary travelers.',
            },
            {
              text: 'Invoke Bond with Himself (Inner Fire)',
              aceBond: 'self',
              reflectionResponse: 'A crimson spark ignites in your chest. You stand tall on your own two feet.',
            },
          ],
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAPTER 2: Footsteps in the Sunlit Meadow (Level 3)
  // --------------------------------------------------------------------------
  {
    id: 2,
    chapterNumber: 2,
    title: 'Footsteps in the Sunlit Meadow',
    subtitle: 'The arrival of the first weary wanderer seeking respite.',
    levelReq: 3,
    sketchIcon: '🌾',
    summary: 'A burnt-out graphic designer stumbles into the sunlit meadow, carrying a heavy suitcase and an exhausted spirit.',
    bgGradient: 'from-[#2e2010] via-[#1c120a] to-[#0d0704]',
    aceLore: {
      natureMessage: 'The soft grass soothes tired feet that have walked on cold asphalt for years.',
      peopleMessage: 'A shared cup of warm tea opens closed hearts faster than a thousand words.',
      selfMessage: 'Watching someone else rest reinforces why you built this sanctuary.',
    },
    slides: [
      {
        id: 'c2-1',
        speakerName: 'Weary Traveler',
        speakerRole: 'Burnt-Out Designer',
        speakerType: 'traveler',
        avatarIcon: '🧳',
        backgroundMood: 'sunlit_clearing',
        text: 'Is... is this real? I was driving down the highway after working 80 hours straight this week. My head was pounding, my screen blared with revision demands... and I just turned off the exit into the mist.',
      },
      {
        id: 'c2-2',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Builder of Sanctuaries',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'sunlit_clearing',
        text: 'Sit down on this wooden bench! I built this cottage yesterday. The sun here stays warm, and there are no alarms or notification pings.',
      },
      {
        id: 'c2-3',
        speakerName: 'Weary Traveler',
        speakerRole: 'Burnt-Out Designer',
        speakerType: 'traveler',
        avatarIcon: '🧳',
        backgroundMood: 'sunlit_clearing',
        text: 'I forgot what green trees smell like... In the corporate tower, if you stop producing for a single day, you are treated like a broken gear. I felt like I was breaking down inside.',
      },
      {
        id: 'c2-4',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Builder of Sanctuaries',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'sunlit_clearing',
        text: 'Hearing his story made something burn inside me. I did not just run away to build a toy town for myself... People out there are hurting. They need a place to breathe.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAPTER 3: Echoes at the Elder Stones (Level 5)
  // --------------------------------------------------------------------------
  {
    id: 3,
    chapterNumber: 3,
    title: 'Echoes at the Elder Stones',
    subtitle: 'Learning about emotional breakdowns and the price of modern life.',
    levelReq: 5,
    sketchIcon: '🗿',
    summary: 'An overworked physician sits by the ancient monoliths, weeping tears of relief after years of suppressed grief.',
    bgGradient: 'from-[#1a2828] via-[#0f1818] to-[#070b0b]',
    aceLore: {
      natureMessage: 'The stone monoliths absorb ancient grief without judgment.',
      peopleMessage: 'Validation is the gentlest balm for a spirit pushed beyond its limits.',
      selfMessage: 'To hold space for another’s pain requires unwavering inner calm.',
    },
    slides: [
      {
        id: 'c3-1',
        speakerName: 'Elder Stone Spirit',
        speakerRole: 'Watcher of Time',
        speakerType: 'nature',
        avatarIcon: '🗿',
        backgroundMood: 'elder_monolith',
        text: 'Listen closely, young pioneer. The monoliths echo with voices from beyond the forest border. More and more souls are wandering toward your clearings.',
      },
      {
        id: 'c3-2',
        speakerName: 'Exhausted Physician',
        speakerRole: 'Night-Shift Doctor',
        speakerType: 'traveler',
        avatarIcon: '🩺',
        backgroundMood: 'elder_monolith',
        text: 'I saved dozens of lives every week, but I had no life of my own left. My family became strangers. I suffered panic attacks in hallway closets... I felt so guilty for wanting to break down.',
      },
      {
        id: 'c3-3',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Builder of Sanctuaries',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'elder_monolith',
        text: 'You don’t have to feel guilty here. The Elder Stones don’t ask for doctor notes or shift logs. You can cry as long as you need.',
      },
      {
        id: 'c3-4',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Builder of Sanctuaries',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'elder_monolith',
        text: 'My purpose ignited brighter. This forest is becoming an oasis. I must expand the settlements, align the colors, and build homes for every weary soul searching for peace.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAPTER 4: The Fellowship of the Stoneworks (Level 8)
  // --------------------------------------------------------------------------
  {
    id: 4,
    chapterNumber: 4,
    title: 'The Fellowship of the Stoneworks',
    subtitle: 'When travelers join hands to carve multi-hex cluster foundations.',
    levelReq: 8,
    sketchIcon: '🏛️',
    summary: 'Travelers who came to rest start offering their skills to help build multi-hex clusters and wide garden districts.',
    bgGradient: 'from-[#2b1f14] via-[#1a120b] to-[#0b0704]',
    aceLore: {
      natureMessage: 'Hand-carved timber and quarried stone form unbreakable ties.',
      peopleMessage: 'When strangers work together for a peaceful dream, isolation dissolves.',
      selfMessage: 'Leadership is not commanding others, but lighting the way forward.',
    },
    slides: [
      {
        id: 'c4-1',
        speakerName: 'Retired Mason',
        speakerRole: 'Former Construction Veteran',
        speakerType: 'traveler',
        avatarIcon: '⚒️',
        backgroundMood: 'sunlit_clearing',
        text: 'Kid, in my youth I built hundreds of high-rises, but none of them felt alive. Let me teach you how to assemble 3-Hex Triads and 4-Hex Quads so we can house whole families!',
      },
      {
        id: 'c4-2',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Architect of the Dream',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'sunlit_clearing',
        text: 'Look at them! The designer is sketching garden paths, the doctor is growing herbal tea glades, and the mason is laying stone foundations. They found their joy again.',
      },
      {
        id: 'c4-3',
        speakerName: 'ACE of People',
        speakerRole: 'Steward of Harmony',
        speakerType: 'people',
        avatarIcon: '💛',
        backgroundMood: 'sunlit_clearing',
        text: 'Your city is no longer just a escape for one. It is becoming a sanctuary for humanity. But remember, as creator, you alone must place each cluster with precision.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAPTER 5: Whispers Across the Rotary River (Level 12)
  // --------------------------------------------------------------------------
  {
    id: 5,
    chapterNumber: 5,
    title: 'Whispers Across the Rotary River',
    subtitle: 'Finding work-life rhythm through the revolving waterwheels.',
    levelReq: 12,
    sketchIcon: '⚙️',
    summary: 'A corporate executive learns the delicate balance between effort and rest while watching the 60-degree rotary wheels.',
    bgGradient: 'from-[#12222e] via-[#0a141c] to-[#04080a]',
    aceLore: {
      natureMessage: 'Rushing currents flow continuously without ever feeling rushed.',
      peopleMessage: 'Synchronization brings peace; forcing speed brings friction.',
      selfMessage: 'Mastery over the turntable reflects control over one’s internal state.',
    },
    slides: [
      {
        id: 'c5-1',
        speakerName: 'Burnt-Out Executive',
        speakerRole: 'Former Tech Vice President',
        speakerType: 'traveler',
        avatarIcon: '💼',
        backgroundMood: 'rotary_river',
        text: 'I used to think life was a linear sprint to the top. I sacrificed my health, my hobbies, my sleep... and when I reached the top, it was empty.',
      },
      {
        id: 'c5-2',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Architect of the Dream',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'rotary_river',
        text: 'Watch the rotary wheel in the river. It turns 60 degrees, pauses, aligns the colors, and turns again. Movement and stillness belong together.',
      },
      {
        id: 'c5-3',
        speakerName: 'Burnt-Out Executive',
        speakerRole: 'Former Tech Vice President',
        speakerType: 'traveler',
        avatarIcon: '💼',
        backgroundMood: 'rotary_river',
        text: 'Work and life... they aren’t enemies. They are two colors on the same rotating wheel. Thank you, little pioneer.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAPTER 6: High Fortress of Rest (Level 16)
  // --------------------------------------------------------------------------
  {
    id: 6,
    chapterNumber: 6,
    title: 'High Fortress of Rest',
    subtitle: 'The 3 ACE Guardians test the young pioneer’s commitment.',
    levelReq: 16,
    sketchIcon: '🏰',
    summary: 'High above the mist-filled valleys, the ACE Guardians test whether the kid relies on his own hands or external magic.',
    bgGradient: 'from-[#2e1224] via-[#1c0a16] to-[#0a0308]',
    aceLore: {
      natureMessage: 'The forest offers shade, but you must plant the seeds.',
      peopleMessage: 'The community offers cheer, but you must build the hearth.',
      selfMessage: 'Blessings guide your mind, but only your hands can lay the tiles.',
    },
    slides: [
      {
        id: 'c6-1',
        speakerName: 'ACE of Nature',
        speakerRole: 'Emerald Guardian',
        speakerType: 'nature',
        avatarIcon: '🌲',
        backgroundMood: 'highland_sanctuary',
        text: 'Young pioneer, your city grows grand. But do you seek our divine magic to build it automatically, or do you trust your own hands?',
      },
      {
        id: 'c6-2',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Master Builder',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'highland_sanctuary',
        text: 'Magic cannot replace love! Every timber cottage, every sunstone plaza, every aqueduct stream is placed by hand. That is why it feels warm to those who stay here.',
      },
      {
        id: 'c6-3',
        speakerName: 'ACE of Self',
        speakerRole: 'Crimson Sovereign',
        speakerType: 'self',
        avatarIcon: '🔥',
        backgroundMood: 'highland_sanctuary',
        text: 'Spoken like a true pioneer. We grant you one ACE blessing per chapter to guide your wisdom — but the placement remains strictly yours.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAPTER 7: The Blossom Metropolis (Level 20)
  // --------------------------------------------------------------------------
  {
    id: 7,
    chapterNumber: 7,
    title: 'The Blossom Metropolis',
    subtitle: 'A thriving haven of hundreds of healed dreamers.',
    levelReq: 20,
    sketchIcon: '🌸',
    summary: 'The Dream Forest city becomes a world-renowned paradise for burnt-out souls... until dark clouds gather upriver.',
    bgGradient: 'from-[#2a1a10] via-[#1a0f08] to-[#0a0502]',
    aceLore: {
      natureMessage: 'Peak blooming flowers herald both beauty and imminent transformation.',
      peopleMessage: 'Hundreds of souls now call your valley their true home.',
      selfMessage: 'Enjoy the dawn, but keep your tools ready for the storm.',
    },
    slides: [
      {
        id: 'c7-1',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Master Builder',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'sovereign_dawn',
        text: 'Look across the valley! Thousands of glowing lanterns, 6-Hex Blossom mega-clusters, laughing children, and adults who have finally found peace.',
      },
      {
        id: 'c7-2',
        speakerName: 'Community Representative',
        speakerRole: 'Healed Wanderer',
        speakerType: 'people',
        avatarIcon: '🏮',
        backgroundMood: 'sovereign_dawn',
        text: 'You saved us, little pioneer. You turned our emotional breakdowns into a thriving paradise!',
      },
      {
        id: 'c7-3',
        speakerName: 'Distress Signals',
        speakerRole: 'Ominous River Echoes',
        speakerType: 'dam',
        avatarIcon: '⚠️',
        backgroundMood: 'storm_dam',
        text: '*BOOM... CRACKLE...* Ominous tremors shake the valley floor. High in the northern canyon, the ancient corrupted Water Dam groans under tremendous pressure!',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAPTER 8: CRITICAL CALAMITY — The Collapse of the Ancient Dam (Level 25)
  // --------------------------------------------------------------------------
  {
    id: 8,
    chapterNumber: 8,
    title: 'Calamity at the Water Dam',
    subtitle: 'The corrupted dam collapses! Evacuate and build a New Era in the highlands!',
    levelReq: 25,
    sketchIcon: '🌊',
    summary: 'The ancient corrupted dam bursts! Rushing flood waters destroy the lowlands, forcing the pioneer to urgently build elevated mountain settlements to rescue all tourists into a New Era!',
    bgGradient: 'from-[#1c0808] via-[#120404] to-[#080202]',
    aceLore: {
      natureMessage: 'Rushing floods destroy the old, forcing a rebirth in high altitude.',
      peopleMessage: 'In moments of disaster, your calm leadership saves every single life.',
      selfMessage: 'When everything collapses, a pioneer stands firm and rebuilds higher.',
    },
    slides: [
      {
        id: 'c8-1',
        speakerName: 'The Collapsing Dam',
        speakerRole: 'Corrupted Ancient Structure',
        speakerType: 'dam',
        avatarIcon: '🌊',
        backgroundMood: 'storm_dam',
        text: '*KABOOM!* The concrete barrier shatters into a million fragments! A towering wall of dark, corrupted water surges down the river canyon directly toward the lower valley!',
      },
      {
        id: 'c8-2',
        speakerName: 'Panicked Tourists',
        speakerRole: 'Scattered Travelers',
        speakerType: 'traveler',
        avatarIcon: '🏃',
        backgroundMood: 'storm_dam',
        text: 'The water is rising! The lower clearings are being submerged! Where do we go?!',
      },
      {
        id: 'c8-3',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Heroic Pioneer',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'storm_dam',
        text: 'DON’T PANIC! Follow me to the high mountain peaks! We will build new elevated terraces, river causeways, and fog-bridged havens! I will not let anyone be lost!',
      },
      {
        id: 'c8-4',
        speakerName: 'ACE Guardians',
        speakerRole: 'Unite of the Three Spirits',
        speakerType: 'system',
        avatarIcon: '🌟',
        backgroundMood: 'highland_sanctuary',
        text: 'The flood marks the end of the old lowland era and the birth of the Highland Era (Levels 26–40). You faced the greatest struggle, but your resolve shines brighter than the deluge!',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAPTER 9: The Highland Meridian Sanctuary (Level 30)
  // --------------------------------------------------------------------------
  {
    id: 9,
    chapterNumber: 9,
    title: 'The Highland Meridian Sanctuary',
    subtitle: 'Building a safer, resilient high-altitude paradise above the waters.',
    levelReq: 30,
    sketchIcon: '⛰️',
    summary: 'Above the floodline, the young pioneer constructs the Quad-Color Meridian, creating an even grander, storm-proof city for all rescued tourists.',
    bgGradient: 'from-[#122822] via-[#0a1814] to-[#040a08]',
    aceLore: {
      natureMessage: 'Mountain pines withstand storms that wash away lowland shrubs.',
      peopleMessage: 'Overcoming disaster together bonds the community forever.',
      selfMessage: 'You turned a catastrophic flood into a golden renaissance.',
    },
    slides: [
      {
        id: 'c9-1',
        speakerName: 'Rescued Tourist',
        speakerRole: 'Grateful Family',
        speakerType: 'traveler',
        avatarIcon: '🌄',
        backgroundMood: 'highland_sanctuary',
        text: 'Look down from these cliffs... the old valley is now a peaceful blue lake, but up here in these highlands, our new homes are warmer and safer than ever before!',
      },
      {
        id: 'c9-2',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Sovereign Builder',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'highland_sanctuary',
        text: 'We bridged the rivers with rotary gears, dispelled the deep fog, and aligned all four harmonic colors. No calamity can break what we build with true heart.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CHAPTER 10: The Eternal Sovereign Empire (Level 40)
  // --------------------------------------------------------------------------
  {
    id: 10,
    chapterNumber: 10,
    title: 'The Eternal Sovereign Empire',
    subtitle: 'The ultimate climax of the runaway boy who built a paradise for humanity.',
    levelReq: 40,
    sketchIcon: '👑',
    summary: 'The runaway boy reflects on his journey. He started alone fleeing burnout, and built an eternal empire of healing, hope, and human warmth.',
    bgGradient: 'from-[#2a1c08] via-[#1a1004] to-[#0a0602]',
    aceLore: {
      natureMessage: 'The Dream Forest is now an eternal sanctuary for all generations.',
      peopleMessage: 'Millions of weary souls find their way home to your paradise.',
      selfMessage: 'You are no longer a runaway boy — you are the Eternal Sovereign Pioneer.',
    },
    slides: [
      {
        id: 'c10-1',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Eternal Sovereign Pioneer',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'sovereign_dawn',
        text: 'I remember the day I ran away from the city... I was scared, lonely, and exhausted. I thought I was just building a small wooden house to hide in.',
      },
      {
        id: 'c10-2',
        speakerName: 'The Young Pioneer',
        speakerRole: 'Eternal Sovereign Pioneer',
        speakerType: 'kid',
        avatarIcon: '👦',
        backgroundMood: 'sovereign_dawn',
        text: 'I didn’t know I would meet so many people who were hurting just like me. I didn’t know we would survive floodwaters, corrupted dams, and deep fog together.',
      },
      {
        id: 'c10-3',
        speakerName: 'The Three ACE Guardians',
        speakerRole: 'Embodiments of Nature, People & Self',
        speakerType: 'system',
        avatarIcon: '👑',
        backgroundMood: 'sovereign_dawn',
        text: 'We gave you our trust, but YOU — the Player — built every single wall, aligned every hex, and saved every soul. This Eternal Sovereign Empire belongs to your hands forever.',
      },
    ],
  },
];
