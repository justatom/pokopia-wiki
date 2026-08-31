/* Hand-written bilingual content: game facts, story, characters, locations, guides.
   Every string is { en, th }. Facts are sourced from Bulbapedia, Serebii and the
   official Nintendo / Pokémon listings — see the About page for the source list. */

const t = (en, th) => ({ en, th });

export const GAME = {
  title: t('Pokémon Pokopia', 'Pokémon Pokopia'),
  ja: 'ぽこあポケモン',
  tagline: t(
    'A life-sim about a Ditto rebuilding a ruined Kanto into a home for Pokémon.',
    'เกมไลฟ์ซิมที่ให้คุณเล่นเป็นดิตโต้ ฟื้นฟูคันโตที่ล่มสลายให้กลับมาเป็นบ้านของโปเกมอน'
  ),
  intro: t(
    `Pokémon Pokopia is the first Pokémon life-simulation game, and the first Pokémon title made exclusively for Nintendo Switch 2. You play as a Ditto that has transformed into human shape, waking up alone in a withered, abandoned Kanto. Guided by a talking Tangrowth, you gather materials, terraform the land, craft furniture, build houses and — most importantly — create habitats that coax wild Pokémon back into the world.`,
    `Pokémon Pokopia คือเกมแนวไลฟ์ซิมภาคแรกของซีรีส์โปเกมอน และเป็นเกมโปเกมอนเกมแรกที่ทำมาเพื่อ Nintendo Switch 2 โดยเฉพาะ คุณจะได้เล่นเป็นดิตโต้ที่แปลงร่างเป็นมนุษย์ ตื่นขึ้นมาเพียงลำพังในดินแดนคันโตที่แห้งแล้งและถูกทิ้งร้าง โดยมีทังโกรว์ธที่พูดได้คอยชี้ทาง คุณจะเก็บวัสดุ ปรับสภาพภูมิประเทศ คราฟต์เฟอร์นิเจอร์ สร้างบ้าน และที่สำคัญที่สุดคือสร้าง "ที่อยู่อาศัย" เพื่อล่อให้โปเกมอนป่ากลับคืนสู่โลกใบนี้`
  ),
  facts: [
    [t('Japanese title', 'ชื่อภาษาญี่ปุ่น'), t('ぽこあポケモン (Poko a Pokémon)', 'ぽこあポケモン (Poko a Pokémon)')],
    [t('Developer', 'ผู้พัฒนา'), t('Koei Tecmo · Game Freak', 'Koei Tecmo · Game Freak')],
    [t('Publisher', 'ผู้จัดจำหน่าย'), t('Nintendo / The Pokémon Company', 'Nintendo / The Pokémon Company')],
    [t('Platform', 'เครื่องเล่น'), t('Nintendo Switch 2 (exclusive)', 'Nintendo Switch 2 (เอกซ์คลูซีฟ)')],
    [t('Genre', 'แนวเกม'), t('Life simulation / sandbox building', 'ไลฟ์ซิมูเลชัน / แซนด์บ็อกซ์สร้างเมือง')],
    [t('Release', 'วันวางจำหน่าย'), t('5 March 2026, worldwide', '5 มีนาคม 2026 พร้อมกันทั่วโลก')],
    [t('Players', 'จำนวนผู้เล่น'), t('1–4 (local link play + online Cloud Islands)', '1–4 คน (เล่นร่วมแบบ Link Play และ Cloud Island ออนไลน์)')],
    [t('Pokédex', 'โปเกเด็กซ์'), t('300 in the main dex, plus separate Basin and Event dexes', '300 ตัวในเด็กซ์หลัก และมีเด็กซ์แยกสำหรับ Basin กับอีเวนต์')],
    [t('Latest version', 'เวอร์ชันล่าสุด'), t('2.0.0 — 5 August 2026', '2.0.0 — 5 สิงหาคม 2026')],
  ],
  story: [
    t(
      `Long before the game begins, a run of natural disasters pushed the world toward a global famine. Humanity evacuated into space, and the Pokémon left behind were sealed into specially modified PC Boxes so they would survive the wait.`,
      `ก่อนเหตุการณ์ในเกมจะเริ่มต้น ภัยธรรมชาติที่เกิดขึ้นต่อเนื่องผลักโลกเข้าสู่ภาวะขาดแคลนอาหารทั่วโลก มนุษย์จึงอพยพขึ้นสู่อวกาศ ส่วนโปเกมอนที่ถูกทิ้งไว้ถูกผนึกเก็บไว้ในกล่อง PC ที่ดัดแปลงเป็นพิเศษ เพื่อให้รอดชีวิตตลอดช่วงเวลาที่ต้องรอ`
    ),
    t(
      `You wake up as a Ditto in the Withered Wastelands — the ruins of Fuchsia City. Professor Tangrowth, the last Pokémon still awake in the area, explains the rule that drives the whole game: when a habitat is restored well enough, the storage system automatically releases the Pokémon that belongs there. Restore the land, and life comes back on its own.`,
      `คุณตื่นขึ้นมาในร่างดิตโต้ที่ Withered Wastelands ซึ่งก็คือซากของเมือง Fuchsia City ศาสตราจารย์ทังโกรว์ธ โปเกมอนตัวสุดท้ายที่ยังตื่นอยู่ในพื้นที่ อธิบายกฎที่เป็นหัวใจของทั้งเกม นั่นคือเมื่อที่อยู่อาศัยถูกฟื้นฟูจนได้มาตรฐาน ระบบจัดเก็บจะปล่อยโปเกมอนที่ควรอยู่ตรงนั้นออกมาเอง ฟื้นฟูผืนดินให้ดี แล้วชีวิตจะกลับมาเอง`
    ),
    t(
      `From there the story moves area by area: lighting up a beach that never sees the sun, throwing a party loud enough to shake a mountain town, rebuilding a skyscraper in a chain of floating islands, and — with the Expansion Pass — diving into a Cerulean City that now sits on the seabed. Scattered through it all are Human Records: notes, newspapers and journals left behind by the people who evacuated, which slowly fill in what actually happened.`,
      `จากนั้นเนื้อเรื่องจะดำเนินไปทีละพื้นที่ ตั้งแต่การจุดไฟให้ชายหาดที่ไม่เคยเห็นแสงอาทิตย์ จัดปาร์ตี้ที่ดังพอจะปลุกเมืองบนภูเขา บูรณะตึกระฟ้าบนหมู่เกาะลอยฟ้า และเมื่อมี Expansion Pass ก็จะได้ดำน้ำลงไปยัง Cerulean City ที่จมอยู่ใต้ทะเล ระหว่างทางจะพบ Human Records ทั้งบันทึก หนังสือพิมพ์ และไดอารีที่มนุษย์ผู้อพยพทิ้งไว้ ซึ่งจะค่อย ๆ เผยว่าเกิดอะไรขึ้นกันแน่`
    ),
  ],
};

/* ------------------------------------------------------------------ */
export const CHARACTERS = [
  {
    id: 'ditto', natdex: 132, specialty: 'transform',
    name: t('Ditto (you)', 'ดิตโต้ (ตัวคุณ)'),
    role: t('The player character', 'ตัวละครที่ผู้เล่นควบคุม'),
    desc: t(
      `You are a Ditto that has taken human form. Ditto never battles here — instead it borrows the moves of Pokémon it befriends and turns them into tools: Water Gun to irrigate, Leafage to plant, Rock Smash to quarry, Rollout to clear ground. You keep every move you learn and can switch between them at any time. Your look, hair and skin colour can be changed at any large mirror.`,
      `คุณคือดิตโต้ที่แปลงร่างเป็นมนุษย์ ในเกมนี้ดิตโต้ไม่ต่อสู้ แต่จะยืมท่าจากโปเกมอนที่ผูกมิตรด้วยมาใช้เป็นเครื่องมือแทน เช่น Water Gun ใช้รดน้ำ Leafage ใช้ปลูกหญ้า Rock Smash ใช้ทุบหิน Rollout ใช้เคลียร์พื้นที่ ท่าที่เรียนแล้วจะติดตัวถาวรและสลับใช้ได้ตลอดเวลา ส่วนหน้าตา ทรงผม และสีผิว เปลี่ยนได้ที่กระจกบานใหญ่ทุกบาน`
    ),
  },
  {
    id: 'professor-tangrowth', natdex: 465, specialty: 'appraise',
    name: t('Professor Tangrowth', 'ศาสตราจารย์ทังโกรว์ธ'),
    role: t('Your guide · Pokédex #041', 'ผู้ชี้ทางของคุณ · โปเกเด็กซ์ #041'),
    desc: t(
      `The first character you meet and the closest thing the game has to a Pokémon Professor. Tangrowth had been living completely alone in the ruins before you woke up, and it asks for your help rebuilding the region. It appraises Lost Relics for you — from v2.0.0 you can hand over up to ten at a time — and it turns up again at most major story builds.`,
      `ตัวละครแรกที่คุณจะได้เจอ และเป็นเหมือน "ศาสตราจารย์โปเกมอน" ของเกมนี้ ทังโกรว์ธอาศัยอยู่ในซากปรักหักพังตามลำพังมานานก่อนที่คุณจะตื่นขึ้นมา และจะขอให้คุณช่วยฟื้นฟูภูมิภาคนี้ หน้าที่ของมันคือประเมิน Lost Relic ให้คุณ (ตั้งแต่เวอร์ชัน 2.0.0 ส่งได้ครั้งละไม่เกิน 10 ชิ้น) และจะโผล่มาช่วยในงานก่อสร้างเนื้อเรื่องใหญ่ ๆ เกือบทุกครั้ง`
    ),
  },
  {
    id: 'peakychu', natdex: 25, specialty: 'illuminate',
    name: t('Peakychu', 'พีคีชู'),
    role: t('Pale Pikachu · Bleak Beach · Pokédex #079', 'พิคาชูสีซีด · Bleak Beach · โปเกเด็กซ์ #079'),
    desc: t(
      `An unusually pale Pikachu with droopier ears than normal, found wounded in Bleak Beach. Its Illuminate specialty lights up an entire town at once, which is what finally lifts the permanent darkness over the beach. It is also the Pokémon Tinkmaster asks for by name when building the top floor of the Skylands tower.`,
      `พิคาชูสีซีดผิดปกติ หูตกกว่าพิคาชูทั่วไป พบในสภาพบาดเจ็บที่ Bleak Beach ความถนัด Illuminate ของมันส่องสว่างได้ทั้งเมืองในคราวเดียว ซึ่งเป็นสิ่งที่ปลดความมืดถาวรของชายหาดนี้ได้ในที่สุด และยังเป็นโปเกมอนที่ทิงก์มาสเตอร์ระบุชื่อขอตัวมาช่วยตอนสร้างชั้นบนสุดของตึกใน Sparkling Skylands`
    ),
  },
  {
    id: 'mosslax', natdex: 143, specialty: 'eat',
    name: t('Mosslax', 'มอสแลกซ์'),
    role: t('Mossy Snorlax · Bleak Beach · Pokédex #108', 'สนอร์แลกซ์ปกคลุมด้วยมอส · Bleak Beach · โปเกเด็กซ์ #108'),
    desc: t(
      `A Snorlax that has been asleep so long that moss grew over its body and a flower bloomed on its head. It is found behind a wall in Bleak Beach and only wakes once the area is bright enough. Its Eat specialty turns food you offer into a temporary world-wide buff — see the Cooking guide for the full flavour table.`,
      `สนอร์แลกซ์ที่หลับมานานจนมีมอสขึ้นปกคลุมตัวและมีดอกไม้ผลิบนหัว พบหลังกำแพงใน Bleak Beach และจะตื่นก็ต่อเมื่อพื้นที่สว่างพอเท่านั้น ความถนัด Eat ของมันจะเปลี่ยนอาหารที่คุณให้เป็นบัฟชั่วคราวที่มีผลทั้งพื้นที่ ดูตารางรสชาติทั้งหมดได้ในคู่มือการทำอาหาร`
    ),
  },
  {
    id: 'smearguru', natdex: 235, specialty: 'paint',
    name: t('Smearguru', 'สเมียร์กูรู'),
    role: t('Decorator Smeargle · Bleak Beach · Pokédex #119', 'สเมียร์เกิลนักตกแต่ง · Bleak Beach · โปเกเด็กซ์ #119'),
    desc: t(
      `A renowned painter, splattered head to tail in its own colours. Bring it paint — crushed from berries by a Pokémon with Crush, or bought from the shop — and it will recolour furniture, blocks and fixtures. Many items can be painted in two separate parts, and 22 extra patterns can be found on Dream Islands.`,
      `จิตรกรชื่อดัง ตัวเปรอะสีของตัวเองตั้งแต่หัวจรดหาง เอาสีไปให้มัน (ได้จากการให้โปเกมอนที่มีความถนัด Crush บดเบอร์รี หรือซื้อจากร้าน) แล้วมันจะเปลี่ยนสีเฟอร์นิเจอร์ บล็อก และของตกแต่งให้ ของหลายชิ้นทาสีแยกได้ถึงสองส่วน และยังมีลวดลายพิเศษอีก 22 แบบให้ตามหาใน Dream Island`
    ),
  },
  {
    id: 'dj-rotom', natdex: 479, specialty: 'dj',
    name: t('DJ Rotom', 'ดีเจโรทอม'),
    role: t('Stereo Rotom · Rocky Ridges · Pokédex #182', 'โรทอมร่างเครื่องเสียง · Rocky Ridges · โปเกเด็กซ์ #182'),
    desc: t(
      `A Rotom that has possessed a stereo, found in a cave in Rocky Ridges. Hand it any of the 43 music CDs hidden around the region and it will add that track to your rotation. DJ Rotom is the one who proposes the town-wide party that becomes the Rocky Ridges story quest.`,
      `โรทอมที่สิงอยู่ในเครื่องเสียง พบในถ้ำที่ Rocky Ridges เอาแผ่นซีดีเพลงที่ซ่อนอยู่ทั่วภูมิภาคทั้ง 43 แผ่นไปให้ แล้วมันจะเพิ่มเพลงนั้นเข้าลิสต์ให้คุณ ดีเจโรทอมคือตัวที่เสนอไอเดียจัดปาร์ตี้ทั้งเมือง ซึ่งกลายเป็นเควสต์เนื้อเรื่องของ Rocky Ridges`
    ),
  },
  {
    id: 'chef-dente', natdex: 820, specialty: 'party',
    name: t('Chef Dente', 'เชฟเดนเต้'),
    role: t('Cook Greedent · Rocky Ridges · Pokédex #192', 'กรีเดนต์พ่อครัว · Rocky Ridges · โปเกเด็กซ์ #192'),
    desc: t(
      `You first meet Chef Dente stuck inside a barrel in Rocky Ridges. Free it and it teaches you to cook, which is how you power up Leafage, Cut, Rock Smash, Water Gun and Surf. Cooking with Chef Dente as your partner often yields a second copy of the dish for free, and its Party specialty is what makes big celebrations possible.`,
      `คุณจะเจอเชฟเดนเต้ครั้งแรกตอนที่มันติดอยู่ในถังไม้ที่ Rocky Ridges ช่วยมันออกมาแล้วมันจะสอนคุณทำอาหาร ซึ่งเป็นวิธีอัปเกรดท่า Leafage, Cut, Rock Smash, Water Gun และ Surf ถ้าทำอาหารโดยมีเชฟเดนเต้เป็นคู่หู บ่อยครั้งจะได้จานที่มันทำแถมมาอีกจานฟรี ๆ และความถนัด Party ของมันคือสิ่งที่ทำให้จัดงานฉลองใหญ่ ๆ ได้`
    ),
  },
  {
    id: 'tinkmaster', natdex: 959, specialty: 'engineer',
    name: t('Tinkmaster', 'ทิงก์มาสเตอร์'),
    role: t('Supervisor Tinkaton · Sparkling Skylands · Pokédex #270', 'ทิงกาตันหัวหน้าช่าง · Sparkling Skylands · โปเกเด็กซ์ #270'),
    desc: t(
      `A Tinkaton fascinated by human machinery, met in Sparkling Skylands after Dragonite teaches you Glide. Its Engineer specialty unlocks the largest construction projects in the game, including the four-storey Silph tower. Practically: bringing a Tinkaton to any build cuts the time dramatically — a "next day" build finishes in one hour.`,
      `ทิงกาตันที่หลงใหลในเครื่องจักรของมนุษย์ พบที่ Sparkling Skylands หลังจากดราโกไนต์สอนท่า Glide ให้คุณ ความถนัด Engineer ของมันปลดล็อกงานก่อสร้างที่ใหญ่ที่สุดในเกม รวมถึงตึกซิลฟ์สี่ชั้น ในทางปฏิบัติ การพาทิงกาตันไปช่วยงานสร้างจะลดเวลาลงมาก งานที่ปกติต้อง "รอวันถัดไป" จะเสร็จภายใน 1 ชั่วโมง`
    ),
  },
];

/* ------------------------------------------------------------------ */
export const LOCATIONS = [
  {
    id: 'withered-wastelands', order: 1, dlc: false,
    name: t('Withered Wastelands', 'Withered Wastelands'),
    based: t('Ruins of Fuchsia City', 'ซากเมือง Fuchsia City'),
    desc: t(
      `The starting area: a drought-cracked plain where nothing has rained for years. This is where you learn Water Gun from Squirtle and Leafage from Bulbasaur, and where the first story request — getting Slowpoke to yawn up a rainstorm — teaches you the humidity system. Raising humidity to 100 summons Kyogre to the coast, and the rain it brings revives the whole region.`,
      `พื้นที่เริ่มต้น เป็นที่ราบแตกระแหงจากภัยแล้งที่ไม่มีฝนตกมาหลายปี ที่นี่คือที่ที่คุณจะเรียน Water Gun จากสเควิร์ทเทิล และ Leafage จากบัลบาซอร์ และเป็นที่ที่เควสต์เนื้อเรื่องแรก คือทำให้สโลว์โพคหาวจนเกิดฝน จะสอนคุณเรื่องระบบความชื้น เมื่อดันความชื้นถึง 100 ไคออกร์จะมาปรากฏที่ชายฝั่ง และฝนที่มันเรียกมาจะชุบชีวิตทั้งภูมิภาค`
    ),
  },
  {
    id: 'bleak-beach', order: 2, dlc: false,
    name: t('Bleak Beach', 'Bleak Beach'),
    based: t('Storm-wrecked Vermilion City, with the S.S. Anne aground', 'ซาก Vermilion City ที่โดนพายุถล่ม พร้อมเรือ S.S. Anne เกยตื้น'),
    desc: t(
      `A coast locked in permanent darkness, day or night. This is the electricity area: you generate power, string it across town on utility poles, and light the place up until the flowers on Mosslax's head bloom and it finally wakes. Peakychu, Smearguru and Zorua all join here, and from v2.0.0 helping Manaphy here is what unlocks Dive.`,
      `ชายฝั่งที่จมอยู่ในความมืดถาวรไม่ว่าจะกลางวันหรือกลางคืน ที่นี่คือพื้นที่สอนเรื่องไฟฟ้า คุณจะต้องผลิตพลังงาน เดินสายผ่านเสาไฟทั่วเมือง แล้วเปิดไฟให้สว่างจนดอกไม้บนหัวมอสแลกซ์บาน แล้วมันจึงจะตื่น พีคีชู สเมียร์กูรู และโซรัวจะมาร่วมทีมที่นี่ และตั้งแต่เวอร์ชัน 2.0.0 การช่วยมานาฟีที่นี่คือเงื่อนไขปลดล็อกท่า Dive`
    ),
  },
  {
    id: 'rocky-ridges', order: 3, dlc: false,
    name: t('Rocky Ridges', 'Rocky Ridges'),
    based: t('Pewter City valley, buried in volcanic ash', 'หุบเขา Pewter City ที่ถูกเถ้าภูเขาไฟกลบ'),
    desc: t(
      `A mining town under ash, with the museum still standing. Rocky Ridges introduces cooking (rescue Chef Dente from a barrel), music (find DJ Rotom in a cave) and the Mood system — you must push the town's mood to 100 to throw the party that becomes the area's story climax. Repeating that party later, with a cannon and fireworks, is how you recruit Volcanion.`,
      `เมืองเหมืองแร่ใต้ชั้นเถ้าถ่าน โดยพิพิธภัณฑ์ยังตั้งอยู่ Rocky Ridges เป็นพื้นที่ที่แนะนำระบบทำอาหาร (ช่วยเชฟเดนเต้ออกจากถังไม้) ระบบเพลง (ตามหาดีเจโรทอมในถ้ำ) และระบบ Mood โดยคุณต้องดัน Mood ของเมืองให้ถึง 100 เพื่อจัดปาร์ตี้ซึ่งเป็นไคลแมกซ์ของพื้นที่นี้ และการจัดปาร์ตี้ซ้ำอีกครั้งพร้อมปืนใหญ่กับพลุ คือวิธีชวนโวลคาเนียนเข้าทีม`
    ),
  },
  {
    id: 'sparkling-skylands', order: 4, dlc: false,
    name: t('Sparkling Skylands', 'Sparkling Skylands'),
    based: t('Fragments of Saffron City floating in the sky', 'เศษซาก Saffron City ที่ลอยอยู่บนฟ้า'),
    desc: t(
      `A chain of floating islands built from what is left of Saffron City. Dragonite teaches Glide here, Gyarados teaches Waterfall, and Porygon's request unlocks wireless power transmitters. The centrepiece is Tinkmaster's four-storey rebuild of the Silph tower, each floor demanding more resources and more helper Pokémon than the last.`,
      `หมู่เกาะลอยฟ้าที่ประกอบขึ้นจากเศษซากของ Saffron City ที่นี่ดราโกไนต์จะสอนท่า Glide กายาราดอสสอน Waterfall และคำขอของพอริกอนจะปลดล็อกเครื่องส่งไฟฟ้าไร้สาย ไฮไลต์คือการบูรณะตึกซิลฟ์สี่ชั้นของทิงก์มาสเตอร์ ซึ่งแต่ละชั้นต้องใช้ทรัพยากรและจำนวนโปเกมอนช่วยงานมากขึ้นเรื่อย ๆ`
    ),
  },
  {
    id: 'palette-town', order: 5, dlc: false,
    name: t('Palette Town', 'Palette Town'),
    based: t('Three empty islands — a free-build sandbox', 'เกาะว่างสามเกาะ — แซนด์บ็อกซ์สร้างอิสระ'),
    desc: t(
      `Three vacant islands with no story requirements attached — the game hands them to you as a blank canvas. Palette Town is also where the three Legendary bird kits are found: Freezing Chambers (Articuno), Abandoned Power Plant (Zapdos) and Altar of the Flame (Moltres). Each needs 15 Pokémon and a heavy pile of refined materials.`,
      `เกาะว่างสามเกาะที่ไม่มีเงื่อนไขเนื้อเรื่องผูกไว้เลย เกมยกให้เป็นผืนผ้าใบเปล่าของคุณ Palette Town ยังเป็นที่ตั้งของชุดก่อสร้างนกในตำนานทั้งสาม ได้แก่ Freezing Chambers (อาร์ทิคูโน), Abandoned Power Plant (แซปดอส) และ Altar of the Flame (โมลเทรส) แต่ละชุดต้องใช้โปเกมอน 15 ตัวและวัสดุแปรรูปจำนวนมาก`
    ),
  },
  {
    id: 'cloud-island', order: 6, dlc: false,
    name: t('Cloud Island', 'Cloud Island'),
    based: t('Online shared build space', 'พื้นที่สร้างร่วมกันแบบออนไลน์'),
    desc: t(
      `A separate online island, one giant map, with materials from every biome available. Your main-save items do not carry across — you start fresh — but your Pokédex and recipe list do. Up to four players can build together; anything gathered stays on the island. Requires Nintendo Switch Online. Buying Mysterious Goggles lets you tour other people's islands in read-only Virtual mode.`,
      `เกาะออนไลน์แยกต่างหาก เป็นแผนที่ผืนใหญ่ผืนเดียวที่มีวัสดุจากทุกไบโอมให้ใช้ ไอเทมจากเซฟหลักจะไม่ติดมาด้วย คุณจะเริ่มใหม่หมด แต่โปเกเด็กซ์และลิสต์สูตรคราฟต์จะยังอยู่ เล่นสร้างร่วมกันได้สูงสุด 4 คน ของที่เก็บได้จะอยู่บนเกาะนั้น ต้องมี Nintendo Switch Online และถ้าซื้อ Mysterious Goggles จะเข้าไปเดินชมเกาะคนอื่นแบบอ่านอย่างเดียว (Virtual) ได้`
    ),
  },
  {
    id: 'bubbly-basin', order: 7, dlc: true,
    name: t('Bubbly Basin', 'Bubbly Basin'),
    based: t('Sunken Cerulean City — Expansion Pass Part 1', 'Cerulean City ที่จมน้ำ — Expansion Pass ตอนที่ 1'),
    desc: t(
      `The first paid Expansion Pass area, released 5 August 2026 with v2.0.0. Cerulean City now sits on the seabed, and almost all of it is played underwater with the Dive move. Go deep enough and it goes pitch black, so you need light. Crops only grow down here inside bubbles, and buoyant blocks let you build in open water. Six Treasure Maps lead to the six decorative Poké Balls needed for the final habitat, Mermaid's Gym. Manaphy lives here.`,
      `พื้นที่แรกของ Expansion Pass แบบเสียเงิน ปล่อยวันที่ 5 สิงหาคม 2026 พร้อมเวอร์ชัน 2.0.0 ตอนนี้ Cerulean City จมอยู่ก้นทะเล และเกือบทั้งหมดต้องเล่นใต้น้ำด้วยท่า Dive ถ้าลงลึกมากพอจะมืดสนิทจนต้องใช้แสงส่อง พืชผลจะโตใต้น้ำได้ก็ต่อเมื่ออยู่ในฟองอากาศ และบล็อกลอยน้ำช่วยให้สร้างกลางน้ำได้ มีแผนที่สมบัติ 6 ใบชี้ทางไปยังลูกบอลตกแต่ง 6 แบบที่ต้องใช้สร้างที่อยู่อาศัยชิ้นสุดท้ายคือ Mermaid's Gym และมานาฟีอาศัยอยู่ที่นี่`
    ),
  },
];

/* ------------------------------------------------------------------ */
const g = (slug, icon, title, summary, blocks) => ({ slug, icon, title, summary, blocks });
const b = (h, ...p) => ({ h, p });

export const GUIDES = [
  g('getting-started', 'sparkles',
    t('Getting started', 'เริ่มต้นเล่น'),
    t('The loop the whole game runs on, and the order to learn it in.', 'วงจรหลักที่เกมทั้งเกมหมุนรอบ และลำดับที่ควรเรียนรู้'),
    [
      b(t('The core loop', 'วงจรหลักของเกม'),
        t(`Gather materials → craft or build → restore a habitat → a Pokémon moves in → befriend it → learn its move or borrow its specialty → use that to restore a harder habitat. Everything in Pokopia is a variation on that loop.`,
          `เก็บวัสดุ → คราฟต์หรือสร้าง → ฟื้นฟูที่อยู่อาศัย → โปเกมอนย้ายเข้ามา → ผูกมิตรกับมัน → เรียนท่าของมันหรือยืมความถนัดของมัน → เอาไปใช้ฟื้นฟูที่อยู่อาศัยที่ยากขึ้น ทุกอย่างในเกมนี้คือรูปแบบต่าง ๆ ของวงจรนี้`),
        t(`There is no combat anywhere in the game. Moves cost PP, PP regenerates over time, and you can restore it for free once per day at any Pokémon Center you have rebuilt.`,
          `เกมนี้ไม่มีการต่อสู้เลย ท่าต่าง ๆ ใช้ PP และ PP จะฟื้นเองตามเวลา หรือจะเติมฟรีวันละครั้งที่ Pokémon Center ที่คุณสร้างไว้ก็ได้`)),
      b(t('The first four moves that matter', 'สี่ท่าแรกที่สำคัญที่สุด'),
        t(`Water Gun (Squirtle), Leafage (Bulbasaur), Cut (Scyther) and Rock Smash (Hitmonchan) cover irrigation, planting, clearing and quarrying. Get all four before you worry about anything else — nothing can be restored until dry ground has been watered.`,
          `Water Gun (สเควิร์ทเทิล), Leafage (บัลบาซอร์), Cut (ไซเธอร์) และ Rock Smash (ฮิตมอนชาน) ครอบคลุมการรดน้ำ ปลูก ถาง และทุบหิน ควรเก็บให้ครบทั้งสี่ก่อนไปสนใจอย่างอื่น เพราะไม่มีอะไรฟื้นฟูได้เลยจนกว่าจะรดน้ำพื้นดินที่แห้งแล้ง`),
        t(`After that, Rollout (Graveler, Rocky Ridges) is the single biggest quality-of-life jump: it clears terrain many times faster than Rock Smash and shares its PP meter.`,
          `หลังจากนั้น Rollout (กราเวลเลอร์ ที่ Rocky Ridges) คือท่าที่ยกระดับความสะดวกมากที่สุด เพราะเคลียร์ภูมิประเทศได้เร็วกว่า Rock Smash หลายเท่า และใช้มิเตอร์ PP ร่วมกัน`)),
      b(t('What to do every day', 'สิ่งที่ควรทำทุกวัน'),
        t(`Collect the daily PC stamp, check the shop's daily specials, sweep the sparkling ripples in water for random recipes, use each Grow Pokémon once on your crops, and hand any Lost Relics to Professor Tangrowth. Ripples and glowing blocks reset daily and are the cheapest source of new recipes and CDs.`,
          `รับสแตมป์ประจำวันที่ PC เช็กของลดราคาประจำวันในร้าน ไล่เก็บระลอกคลื่นประกายในน้ำเพื่อสุ่มสูตรคราฟต์ ใช้โปเกมอนที่มีความถนัด Grow กับพืชผลตัวละครั้ง และเอา Lost Relic ไปให้ศาสตราจารย์ทังโกรว์ธประเมิน ระลอกคลื่นและบล็อกเรืองแสงจะรีเซ็ตทุกวัน และเป็นแหล่งสูตรคราฟต์กับซีดีที่ถูกที่สุด`)),
    ]),

  g('habitats', 'leaf',
    t('Habitats & Comfy Level', 'ที่อยู่อาศัย และ Comfy Level'),
    t('How Pokémon actually arrive, and how to keep them happy once they do.', 'โปเกมอนมาอยู่กับคุณได้ยังไง และจะทำให้มันมีความสุขได้ยังไง'),
    [
      b(t('How habitats work', 'ที่อยู่อาศัยทำงานอย่างไร'),
        t(`A habitat is a specific arrangement of terrain and objects — tall grass in a plot, grass shaded by a tree, grass at the water's edge. Build one correctly and the matching Pokémon is released from storage and moves in. There are 252 habitats in total: 209 in the main dex, 36 in the Bubbly Basin dex and 7 event-only ones.`,
          `ที่อยู่อาศัยคือการจัดวางภูมิประเทศและวัตถุแบบเฉพาะเจาะจง เช่น หญ้าสูงในแปลง หญ้าใต้ร่มไม้ หรือหญ้าริมน้ำ ถ้าสร้างถูกต้อง โปเกมอนที่ตรงกับที่อยู่นั้นจะถูกปล่อยออกจากระบบจัดเก็บและย้ายเข้ามา รวมทั้งหมดมี 252 แบบ แบ่งเป็น 209 แบบในเด็กซ์หลัก 36 แบบในเด็กซ์ Bubbly Basin และอีก 7 แบบเฉพาะอีเวนต์`),
        t(`Weather and time of day gate some of them, so a habitat that looks finished may still be waiting for rain or for nightfall.`,
          `บางแบบมีเงื่อนไขเรื่องสภาพอากาศและช่วงเวลาของวันด้วย ที่อยู่อาศัยที่ดูเหมือนสร้างเสร็จแล้วอาจแค่กำลังรอฝนตกหรือรอถึงกลางคืนอยู่`)),
      b(t('Comfy Level', 'ระดับ Comfy Level'),
        t(`Every resident has a Comfy Level running from Iffy → Average → Nice → Great → Awesome. A Pokémon with no home at all sits at zero. Ask a resident how it is doing and it will usually name something it wants — a food, a decoration — and giving it that raises the level. Talking to it and giving gifts daily keeps it climbing.`,
          `โปเกมอนทุกตัวที่อาศัยอยู่จะมีค่า Comfy Level ไล่จาก Iffy → Average → Nice → Great → Awesome ตัวที่ไม่มีบ้านเลยจะอยู่ที่ศูนย์ ลองถามมันว่าเป็นยังไงบ้าง แล้วมันมักจะบอกสิ่งที่อยากได้ เช่น อาหารหรือของตกแต่ง ถ้าให้ตามนั้นค่าจะเพิ่มขึ้น และถ้าคุยกับมันพร้อมให้ของขวัญทุกวัน ค่าก็จะไต่ขึ้นเรื่อย ๆ`),
        t(`Each species also prefers certain conditions — warm, humid, dark — and putting things it dislikes near its home pushes the level back down. A Pokémon living in a proper built house gains Comfy Level faster than one living in a bare habitat.`,
          `โปเกมอนแต่ละสายพันธุ์ยังมีสภาพแวดล้อมที่ชอบต่างกัน เช่น อบอุ่น ชื้น หรือมืด และถ้าวางของที่มันไม่ชอบไว้ใกล้บ้าน ค่าจะลดลง โปเกมอนที่อยู่ในบ้านที่สร้างจริง ๆ จะเพิ่ม Comfy Level เร็วกว่าตัวที่อยู่ในที่อยู่อาศัยเปล่า ๆ`),
        t(`From v2.0.0, a Pokémon with the Scrub specialty following you will clean any Pokémon you meet, raising both its Comfy Level and its friendship.`,
          `ตั้งแต่เวอร์ชัน 2.0.0 ถ้าให้โปเกมอนที่มีความถนัด Scrub เดินตามคุณ มันจะทำความสะอาดโปเกมอนที่คุณพบเจอ ซึ่งเพิ่มทั้ง Comfy Level และค่าความเป็นเพื่อน`)),
      b(t('Environment Level', 'Environment Level ของพื้นที่'),
        t(`Each area has its own Environment Level from 1 to 10, driven mostly by how comfortable its residents are. Completing story requests and putting up buildings raises it too, even before anyone moves in. Legendary and Mythical Pokémon count for much more than ordinary ones.`,
          `แต่ละพื้นที่มี Environment Level ของตัวเองตั้งแต่ 1 ถึง 10 โดยหลัก ๆ ขึ้นกับว่าผู้อยู่อาศัยมีความสุขแค่ไหน การทำเควสต์เนื้อเรื่องและการตั้งสิ่งปลูกสร้างก็เพิ่มค่านี้ได้เช่นกัน แม้จะยังไม่มีใครย้ายเข้ามาก็ตาม ส่วนโปเกมอนในตำนานและโปเกมอนลึกลับจะมีน้ำหนักมากกว่าตัวธรรมดามาก`),
        t(`Each level unlocks new shop stock and new PC challenges; level 5 gives an item gift and level 10 gives recipes. Be careful: removing Pokémon from an area lowers the score, and if the level drops, any unpurchased shop items and unfinished challenges from that tier lock again.`,
          `แต่ละเลเวลจะปลดล็อกของในร้านและภารกิจใน PC ใหม่ ๆ เลเวล 5 ได้ไอเทมเป็นของขวัญ และเลเวล 10 ได้สูตรคราฟต์ ระวังไว้ว่าการย้ายโปเกมอนออกจากพื้นที่จะทำให้คะแนนลด และถ้าเลเวลตก ของในร้านที่ยังไม่ได้ซื้อกับภารกิจที่ยังไม่เสร็จของเลเวลนั้นจะถูกล็อกอีกครั้ง`)),
    ]),

  g('building', 'hammer',
    t('Building & house rules', 'การสร้างบ้าน และกฎที่ต้องรู้'),
    t('The exact rules that decide whether a structure counts as a home.', 'กฎที่ตัดสินว่าสิ่งปลูกสร้างของคุณนับเป็นบ้านหรือไม่'),
    [
      b(t('What counts as a home', 'อะไรนับว่าเป็นบ้าน'),
        t(`Four walls and a door. That is the whole requirement — build that out of any materials you like and a Pokémon can live in it. You can even place a habitat inside a building.`,
          `กำแพงสี่ด้านกับประตูหนึ่งบาน แค่นั้นคือเงื่อนไขทั้งหมด สร้างด้วยวัสดุอะไรก็ได้ แล้วโปเกมอนก็อยู่ได้ และคุณยังวางที่อยู่อาศัยไว้ในตัวอาคารได้ด้วย`),
        t(`Two limits apply. Exceed 11 × 12 in width versus depth and the structure stops being classed as a habitat at all. And no matter how big you build, a self-built home houses at most four Pokémon — and none of them will move in until there are three distinct pieces of furniture inside.`,
          `มีข้อจำกัดสองข้อ ข้อแรก ถ้าขนาดเกิน 11 × 12 (กว้างเทียบลึก) สิ่งปลูกสร้างจะไม่ถูกนับเป็นที่อยู่อาศัยอีกต่อไป ข้อสอง ไม่ว่าจะสร้างใหญ่แค่ไหน บ้านที่สร้างเองจะรับโปเกมอนได้สูงสุด 4 ตัว และจะไม่มีตัวไหนย้ายเข้ามาจนกว่าจะมีเฟอร์นิเจอร์ที่ต่างชนิดกันอย่างน้อย 3 ชิ้นอยู่ข้างใน`)),
      b(t('Building kits', 'ชุดก่อสร้างสำเร็จรูป'),
        t(`Kits bought from the shop build a complete structure for you — dens and huts (small, functional homes), cottages and houses (large interiors worth decorating), plus machines, decorations and whole set-pieces stocked with rare items. Building a kit needs helper Pokémon; bring a Tinkaton and the time collapses, turning a "next day" build into one hour.`,
          `ชุดก่อสร้างที่ซื้อจากร้านจะสร้างสิ่งปลูกสร้างให้เสร็จทั้งหลัง มีทั้งโพรงกับกระท่อม (บ้านเล็กใช้งานได้จริง) กระท่อมใหญ่กับบ้าน (พื้นที่ภายในกว้าง เหมาะกับการตกแต่ง) ไปจนถึงเครื่องจักร ของตกแต่ง และฉากใหญ่ ๆ ที่มีของหายากอยู่ข้างใน การสร้างชุดต้องมีโปเกมอนช่วย และถ้าพาทิงกาตันไปด้วย เวลาจะลดฮวบ งานที่ต้องรอวันถัดไปจะเสร็จใน 1 ชั่วโมง`),
        t(`Each area has a budget of 40 building points. Every kit costs 1 or 2 points depending on size, and once you hit 40 you cannot place another kit in that area. Relocation and demolition kits let you undo a placement.`,
          `แต่ละพื้นที่มีโควตา 40 แต้มก่อสร้าง ชุดแต่ละชุดกิน 1 หรือ 2 แต้มตามขนาด และเมื่อครบ 40 แต้มจะวางชุดใหม่ในพื้นที่นั้นไม่ได้อีก ส่วนชุดย้ายที่และชุดรื้อถอนมีไว้ให้แก้ไขสิ่งที่วางไปแล้ว`)),
      b(t('Magnet Rise: the builder\'s tool', 'Magnet Rise: เครื่องมือของนักสร้าง'),
        t(`Post-game, a Magnemite hidden under the launch site in the Withered Wastelands teaches Magnet Rise. It lets you fly freely and, crucially, place up to nine blocks at once instead of one — rotatable vertically or horizontally, with a Replace mode that swaps existing blocks and returns the old ones to your bag.`,
          `หลังจบเนื้อเรื่อง จะมีแมกนีไมต์ซ่อนอยู่ใต้จุดปล่อยจรวดที่ Withered Wastelands คอยสอนท่า Magnet Rise ให้ ท่านี้ทำให้บินได้อิสระ และที่สำคัญคือวางบล็อกได้ครั้งละ 9 ก้อนแทนที่จะทีละก้อน หมุนแนวตั้งหรือแนวนอนก็ได้ และมีโหมด Replace ที่สลับบล็อกเดิมออกแล้วเก็บของเก่าใส่กระเป๋าให้`),
        t(`Its Break function (Y) costs less PP than Rock Smash or Cut and is far quicker. Hold to charge and the whole object goes into your bag intact — including things that normally cannot be picked up, like stone debris and broken streetlights, and partially grown plants.`,
          `ฟังก์ชัน Break (ปุ่ม Y) ใช้ PP น้อยกว่า Rock Smash หรือ Cut และเร็วกว่ามาก ถ้ากดค้างเพื่อชาร์จ วัตถุทั้งชิ้นจะเข้ากระเป๋าโดยไม่แตก รวมถึงของที่ปกติเก็บไม่ได้อย่างเศษหินและเสาไฟหัก และต้นไม้ที่โตยังไม่เต็มที่ด้วย`)),
    ]),

  g('crafting', 'package',
    t('Crafting & recipes', 'การคราฟต์ และสูตร'),
    t('Where the 884 recipes come from and how to farm them.', 'สูตรคราฟต์ 884 สูตรมาจากไหน และจะหามาได้ยังไง'),
    [
      b(t('Getting recipes', 'วิธีหาสูตร'),
        t(`You cannot craft anything without owning the recipe first. Recipes come from four places: the PC Shop, which stocks more as each area's Environment Level rises; the main story; the daily shop specials; and sparkling ripples in water, which reset every day and are the cheapest — though entirely random — source.`,
          `คุณจะคราฟต์อะไรไม่ได้เลยถ้ายังไม่มีสูตร สูตรมาจากสี่แหล่ง คือร้าน PC ซึ่งจะมีของเพิ่มขึ้นเมื่อ Environment Level ของแต่ละพื้นที่สูงขึ้น เนื้อเรื่องหลัก ของลดราคาประจำวันในร้าน และระลอกคลื่นประกายในน้ำ ซึ่งรีเซ็ตทุกวันและเป็นแหล่งที่ถูกที่สุด แม้จะสุ่มล้วน ๆ ก็ตาม`)),
      b(t('Crafting', 'การคราฟต์'),
        t(`Take the materials to any workbench and craft. You can queue several copies of an item at once if you have the materials. From v2.0.0 the game consumes materials from a storage box placed next to the workbench before it touches your bag — so park a storage box beside every bench.`,
          `เอาวัสดุไปที่โต๊ะช่างตัวไหนก็ได้แล้วคราฟต์ ถ้ามีวัสดุพอ สั่งทำหลายชิ้นพร้อมกันได้ ตั้งแต่เวอร์ชัน 2.0.0 เกมจะดึงวัสดุจากกล่องเก็บของที่วางไว้ข้างโต๊ะช่างก่อนจะแตะกระเป๋าของคุณ ดังนั้นควรวางกล่องเก็บของไว้ข้างโต๊ะช่างทุกตัว`)),
      b(t('3D printing: the duplicate button', 'เครื่องพิมพ์ 3 มิติ: ปุ่มก๊อปปี้ของ'),
        t(`The leftmost counter in a rebuilt Pokémon Center holds a 3D Printer. Photograph almost any object in the game, switch the photo to Reference mode with Y, and bring it to the printer to duplicate the object. Cost is 1–10 PokéMetal Ingot or 1–5 Rare PokéMetal Ingot depending on how intricate the item is.`,
          `เคาน์เตอร์ซ้ายสุดใน Pokémon Center ที่สร้างเสร็จแล้วจะมีเครื่องพิมพ์ 3 มิติ ถ่ายรูปวัตถุอะไรก็ได้เกือบทุกอย่างในเกม แล้วสลับรูปเป็นโหมด Reference ด้วยปุ่ม Y จากนั้นเอาไปที่เครื่องพิมพ์เพื่อทำสำเนา ค่าใช้จ่ายอยู่ที่ 1–10 PokéMetal Ingot หรือ 1–5 Rare PokéMetal Ingot ขึ้นกับความซับซ้อนของชิ้นงาน`),
        t(`This is the intended way to get plant and berry variants you were not given: each save file only grows one random variant of each plant natively, so photograph the rest on a friend's island or a Cloud Island and print them at home. Expansion Pass items cannot be printed without owning the pass.`,
          `นี่คือวิธีที่เกมตั้งใจให้ใช้เก็บพันธุ์พืชและเบอร์รีสายพันธุ์ที่เซฟของคุณไม่มี เพราะแต่ละเซฟจะปลูกได้แค่พันธุ์สุ่มพันธุ์เดียวของพืชแต่ละชนิด ดังนั้นให้ไปถ่ายรูปพันธุ์ที่เหลือบนเกาะเพื่อนหรือ Cloud Island แล้วกลับมาพิมพ์ที่บ้าน ส่วนไอเทมของ Expansion Pass จะพิมพ์ไม่ได้ถ้าไม่ได้ซื้อแพ็ก`)),
    ]),

  g('electricity', 'bolt',
    t('Electricity', 'ระบบไฟฟ้า'),
    t('Generation, transmission and the caps you will eventually hit.', 'การผลิต การส่งไฟ และเพดานที่คุณจะชนในที่สุด'),
    [
      b(t('Generating power', 'การผลิตไฟฟ้า'),
        t(`Introduced in Bleak Beach, where you have to light a town stuck in permanent darkness. One generator can be crafted and placed anywhere; the rest — windmills, waterwheels, furnaces — need kits and helper Pokémon. Most run forever; the Furnace has to be fed burnable items periodically.`,
          `ระบบนี้เริ่มที่ Bleak Beach ซึ่งคุณต้องจุดไฟให้เมืองที่จมอยู่ในความมืดถาวร เครื่องปั่นไฟหนึ่งชนิดคราฟต์เองแล้ววางที่ไหนก็ได้ ส่วนที่เหลืออย่างกังหันลม กังหันน้ำ และเตาหลอม ต้องใช้ชุดก่อสร้างและโปเกมอนช่วย ส่วนใหญ่ผลิตไฟไปเรื่อย ๆ ยกเว้นเตาหลอมที่ต้องคอยเติมของที่เผาได้เป็นระยะ`),
        t(`Almost every powered item draws exactly 1 unit; a few — string lights, surface lights — need power but draw 0. Overload a circuit and it shorts: everything on it dies until you add another generator.`,
          `ของที่ใช้ไฟเกือบทุกชิ้นกินไฟชิ้นละ 1 หน่วยพอดี ยกเว้นบางอย่างเช่นไฟสายและไฟติดพื้นผิว ที่ต้องต่อไฟแต่กิน 0 หน่วย ถ้าโหลดเกินวงจรจะช็อต ทุกอย่างในวงจรนั้นจะดับจนกว่าจะเพิ่มเครื่องปั่นไฟ`)),
      b(t('Transmission', 'การส่งไฟ'),
        t(`Utility Poles come first — effective, but they eat vertical and visual space. After Porygon's request in Sparkling Skylands you can craft Wireless power transmitters: 1×1×1 blocks that carry power a long way and, unlike poles, through objects. A craftable Switch cuts transmission to anything wired directly to it.`,
          `เริ่มจากเสาไฟ ซึ่งใช้งานได้ดีแต่กินพื้นที่แนวตั้งและบดบังทัศนียภาพ หลังทำคำขอของพอริกอนที่ Sparkling Skylands จะคราฟต์เครื่องส่งไฟไร้สายได้ เป็นบล็อกขนาด 1×1×1 ที่ส่งไฟได้ไกลและทะลุวัตถุได้ต่างจากเสาไฟ ส่วนสวิตช์ที่คราฟต์ได้จะใช้ตัดไฟให้กับทุกอย่างที่ต่อตรงกับมัน`),
        t(`Each pole or transmitter feeds up to 20 things and connects to one generator directly, though power from several generators can travel along a shared line. Distance is Manhattan, not diagonal, and power will not climb or drop more than 5 blocks vertically in a single hop.`,
          `เสาไฟหรือเครื่องส่งแต่ละตัวจ่ายไฟได้สูงสุด 20 จุด และต่อตรงกับเครื่องปั่นไฟได้ทีละเครื่อง แต่ไฟจากหลายเครื่องเดินทางร่วมสายเดียวกันได้ ระยะทางคิดแบบแมนฮัตตัน ไม่ใช่แนวทแยง และไฟจะขึ้นหรือลงในแนวดิ่งได้ไม่เกิน 5 บล็อกต่อหนึ่งช่วง`)),
      b(t('Hard caps', 'เพดานของระบบ'),
        t(`Per area: at most 64 generators in any combination of Mini Generators, Windmills, Waterwheels and Furnaces — which works out to between 320 and 1,920 units depending on the mix — and no more than 1,024 powered items at once. Place more than 256 transmitters and any further ones simply stop working.`,
          `ต่อหนึ่งพื้นที่ วางเครื่องปั่นไฟรวมกันได้ไม่เกิน 64 เครื่อง ไม่ว่าจะเป็น Mini Generator กังหันลม กังหันน้ำ หรือเตาหลอม ซึ่งคิดเป็นกำลังผลิต 320–1,920 หน่วยขึ้นกับส่วนผสม และมีของที่ใช้ไฟพร้อมกันได้ไม่เกิน 1,024 ชิ้น ส่วนเครื่องส่งไฟ ถ้าวางเกิน 256 ตัว ตัวที่วางเพิ่มจะไม่ทำงานเลย`),
        t(`A Charging Station shows how much power is stored — up to 40 units, one indicator light per 8 units. Dens and huts are not wired by default, but a Mini Generator placed inside powers everything in them; cottages and houses power their whole interior once connected.`,
          `สถานีชาร์จจะแสดงปริมาณไฟที่เก็บไว้ สูงสุด 40 หน่วย โดยไฟแสดงสถานะหนึ่งดวงเท่ากับ 8 หน่วย โพรงและกระท่อมจะไม่ต่อไฟให้อัตโนมัติ แต่ถ้าวาง Mini Generator ไว้ข้างในจะจ่ายไฟให้ทุกอย่างในนั้น ส่วนกระท่อมใหญ่และบ้านจะจ่ายไฟให้ทั้งภายในเมื่อเชื่อมต่อแล้ว`)),
    ]),

  g('water', 'droplet',
    t('Water & terraforming', 'น้ำ และการปรับภูมิประเทศ'),
    t('Water physics is the deepest system in the game. Here are the numbers.', 'ฟิสิกส์ของน้ำคือระบบที่ลึกที่สุดในเกม นี่คือตัวเลขทั้งหมด'),
    [
      b(t('Five kinds of liquid', 'ของเหลวห้าชนิด'),
        t(`Fresh Water hydrates and is the only kind where sparkling ripples appear. Ocean Water, Muddy Water and Hot Spring Water do not spawn ripples; Muddy Water also does not hydrate. Lava does not hydrate, damages Ditto on contact, and turns into Black Rock when hit with Water Gun. Each is produced from a corresponding vending-machine drink.`,
          `น้ำจืดให้ความชุ่มชื้นและเป็นชนิดเดียวที่มีระลอกคลื่นประกายเกิดขึ้น ส่วนน้ำทะเล น้ำโคลน และน้ำพุร้อนจะไม่มีระลอกคลื่น โดยน้ำโคลนยังไม่ให้ความชุ่มชื้นด้วย ลาวาไม่ให้ความชุ่มชื้น ทำให้ดิตโต้บาดเจ็บเมื่อสัมผัส และจะกลายเป็น Black Rock เมื่อโดน Water Gun ของเหลวแต่ละชนิดผลิตได้จากเครื่องดื่มในตู้กดที่ตรงกัน`),
        t(`After completing Piplup's request with Paldean Wooper in Bleak Beach you can place and remove liquid freely: hold Y to suck in, ZR to release, ZL to set the water level.`,
          `หลังทำคำขอของพิพลัพร่วมกับวูปเปอร์ร่างพัลเดียที่ Bleak Beach เสร็จ คุณจะวางและดูดของเหลวได้อิสระ กด Y ค้างเพื่อดูดเข้า ZR เพื่อปล่อยออก และ ZL เพื่อปรับระดับน้ำ`)),
      b(t('How water spreads', 'น้ำแผ่ตัวอย่างไร'),
        t(`On flat ground with no drops nearby, water spreads into a circular puddle roughly 6 tiles out. Funnelled into a trench it runs about 25 blocks; lava runs about 12 and moves much slower. Water can also slip through diagonal gaps, so it effectively flows in all 8 directions.`,
          `บนพื้นราบที่ไม่มีขอบตกใกล้ ๆ น้ำจะแผ่เป็นแอ่งวงกลมออกไปราว 6 ช่อง ถ้าบังคับให้ไหลในร่องจะไปได้ราว 25 บล็อก ส่วนลาวาไปได้ราว 12 บล็อกและเคลื่อนที่ช้ากว่ามาก น้ำยังลอดช่องแนวทแยงได้ จึงถือว่าไหลได้ครบทั้ง 8 ทิศ`),
        t(`A drop changes everything. Place a source within 4 tiles of any cliff and the water stops spreading and beelines for the edge in a straight two-tile-wide line. If several drops are equidistant it heads for all of them at once. Lava behaves differently: it aims for the drop but starts spreading again from the second tile, so in broken terrain it covers more ground than water despite its shorter reach.`,
          `ขอบตกเปลี่ยนทุกอย่าง ถ้าวางแหล่งน้ำในระยะ 4 ช่องจากหน้าผาหรือขอบตกใด ๆ น้ำจะหยุดแผ่และพุ่งตรงไปที่ขอบเป็นเส้นตรงกว้างสองช่อง ถ้ามีขอบตกหลายจุดที่ระยะเท่ากัน น้ำจะไปทุกจุดพร้อมกัน ส่วนลาวาทำงานต่างออกไป มันจะมุ่งไปที่ขอบตกแต่เริ่มแผ่ตัวอีกครั้งตั้งแต่ช่องที่สอง ดังนั้นในพื้นที่ขรุขระ ลาวาจะครอบคลุมพื้นที่มากกว่าน้ำ ทั้งที่ไปได้ระยะสั้นกว่า`)),
      b(t('Sources and levels', 'แหล่งน้ำและระดับน้ำ'),
        t(`A primary source is where the water begins — remove it and everything downstream vanishes. Where falling water lands it creates a secondary source that behaves exactly like a primary one, except removing it does not permanently kill the flow.`,
          `แหล่งน้ำหลักคือจุดที่น้ำเริ่มต้น ถ้าเอาออก น้ำที่ไหลต่อจากนั้นจะหายไปทั้งหมด ส่วนจุดที่น้ำตกกระทบพื้นจะกลายเป็นแหล่งน้ำรอง ซึ่งทำงานเหมือนแหล่งน้ำหลักทุกอย่าง ต่างกันแค่ว่าถ้าเอาออก การไหลจะไม่หายไปถาวร`),
        t(`Holding ZL switches to a low water level: the puddle shrinks to about 7 tiles wide (5 for lava), trench distance drops to 12 (6 for lava), and — usefully — low-level water never beelines for a cliff. It always spreads in a circle instead, which makes it far easier to control.`,
          `กด ZL ค้างเพื่อสลับไประดับน้ำต่ำ แอ่งจะหดเหลือกว้างราว 7 ช่อง (ลาวา 5 ช่อง) ระยะในร่องลดเหลือ 12 บล็อก (ลาวา 6 บล็อก) และข้อดีคือน้ำระดับต่ำจะไม่พุ่งเข้าหาหน้าผา แต่จะแผ่เป็นวงกลมเสมอ ซึ่งควบคุมง่ายกว่ามาก`)),
    ]),

  g('farming', 'leaf',
    t('Farming & plants', 'การเพาะปลูก'),
    t('Vegetables, berry trees, flowers — and the variant lottery.', 'ผัก ต้นเบอร์รี ดอกไม้ และระบบสุ่มสายพันธุ์'),
    [
      b(t('Growing vegetables', 'การปลูกผัก'),
        t(`Till soil with Rototiller (learned from Drilbur), plant a seed, and keep the ground hydrated — either with water beside the soil or a Sprinkler, which covers a diamond reaching 5 tiles out in each direction, up to about 60 blocks. A plant fully submerged in water will not grow, and lava nearby blocks hydration.`,
          `ไถดินด้วย Rototiller (เรียนจากดริลเบอร์) ปลูกเมล็ด แล้วรักษาความชุ่มชื้นของพื้นไว้ จะใช้น้ำวางข้างดินหรือใช้สปริงเกลอร์ก็ได้ โดยสปริงเกลอร์ครอบคลุมเป็นรูปข้าวหลามตัดยาว 5 ช่องในแต่ละทิศ รวมราว 60 บล็อก ต้นไม้ที่จมน้ำทั้งต้นจะไม่โต และการมีลาวาอยู่ใกล้จะขัดขวางการให้ความชุ่มชื้น`),
        t(`Plants advance one growth stage per in-game day. A Pokémon with the Grow specialty can push a plant forward one stage — or regenerate one vegetable — once per day; the plant sparkles once it has been used. Rototiller or a charged Magnet Rise can pick a plant up and move it.`,
          `พืชจะโตขึ้นหนึ่งขั้นต่อหนึ่งวันในเกม โปเกมอนที่มีความถนัด Grow จะดันให้โตเพิ่มหนึ่งขั้น หรือทำให้ผักงอกใหม่หนึ่งลูก ได้วันละครั้งต่อต้น โดยต้นที่ถูกใช้แล้วจะมีประกายขึ้น ส่วน Rototiller หรือ Magnet Rise แบบชาร์จจะใช้ขุดต้นไม้ขึ้นมาย้ายที่ได้`),
        t(`Vegetables restore PP when eaten and are the ingredients for every meal, so a working farm underpins the whole move-upgrade system.`,
          `ผักช่วยฟื้น PP เมื่อกิน และเป็นวัตถุดิบของทุกเมนู ดังนั้นฟาร์มที่ทำงานได้จริงคือรากฐานของระบบอัปเกรดท่าทั้งหมด`)),
      b(t('The variant lottery', 'ระบบสุ่มสายพันธุ์'),
        t(`Every plant and berry tree has five colour or berry variants. Each save file is given the standard one plus one random variant of each — and those are the only ones that grow natively in your game.`,
          `พืชและต้นเบอร์รีทุกชนิดมีสายพันธุ์ย่อยด้านสีหรือชนิดเบอร์รีอย่างละ 5 แบบ แต่ละไฟล์เซฟจะได้แบบมาตรฐานหนึ่งแบบ บวกกับแบบสุ่มอีกหนึ่งแบบต่อพืชหนึ่งชนิด และมีแค่สองแบบนั้นที่ปลูกได้เองในเกมของคุณ`),
        t(`To collect the rest: photograph them on another player's island or a Cloud Island and 3D print them, trade with a Pokémon that happens to offer one, or watch the PC daily shop. Pokémon will also occasionally gift you variant seeds. Trees take 4 days to grow normally, flowers 1 day — or instantly with a Grow Pokémon.`,
          `วิธีเก็บที่เหลือคือไปถ่ายรูปบนเกาะผู้เล่นคนอื่นหรือ Cloud Island แล้วพิมพ์ด้วยเครื่อง 3 มิติ แลกกับโปเกมอนที่บังเอิญเอามาเสนอ หรือคอยดูของประจำวันในร้าน PC บางครั้งโปเกมอนก็จะให้เมล็ดสายพันธุ์อื่นเป็นของขวัญด้วย ต้นไม้ใช้เวลาโต 4 วันตามปกติ ดอกไม้ 1 วัน หรือทันทีถ้าใช้โปเกมอนที่มีความถนัด Grow`)),
    ]),

  g('cooking', 'chef',
    t('Cooking & Mosslax boosts', 'การทำอาหาร และบัฟจากมอสแลกซ์'),
    t('Meals power up your moves; flavours change what Mosslax gives you.', 'อาหารอัปเกรดท่าของคุณ ส่วนรสชาติเปลี่ยนบัฟที่มอสแลกซ์จะให้'),
    [
      b(t('Powering up moves', 'การอัปเกรดท่า'),
        t(`After freeing Chef Dente in Rocky Ridges you can cook. Each meal type buffs one move for a limited time, on a separate PP meter: Salad → Leafage, Bread → Cut, Steak → Rock Smash, Soup → Water Gun, Smoothie → Surf and Dive. Cooking with Chef Dente as your partner frequently yields a free second portion.`,
          `หลังช่วยเชฟเดนเต้ที่ Rocky Ridges แล้วคุณจะทำอาหารได้ อาหารแต่ละประเภทจะบัฟท่าหนึ่งท่าเป็นเวลาจำกัด โดยมีมิเตอร์ PP แยกต่างหาก ได้แก่ สลัด → Leafage, ขนมปัง → Cut, สเต๊ก → Rock Smash, ซุป → Water Gun, สมูทตี้ → Surf และ Dive และถ้าทำอาหารโดยมีเชฟเดนเต้เป็นคู่หู มักจะได้จานที่สองฟรี`)),
      b(t('Feeding Mosslax', 'การให้อาหารมอสแลกซ์'),
        t(`Once Mosslax is awake and living in its Gourmet's Offering habitat, its Eat specialty converts food you offer into an area-wide buff, and the dominant flavour decides which. Bitter raises rare-item finds, Dry raises the chance of seeing Lugia and Ho-Oh overhead, Sour improves shop stock and adds a 10% discount, Spicy raises the chance of Pokémon appearing in habitats, and Sweet raises Ancient Artefact finds.`,
          `เมื่อมอสแลกซ์ตื่นและอาศัยอยู่ในที่อยู่อาศัย Gourmet's Offering แล้ว ความถนัด Eat ของมันจะเปลี่ยนอาหารที่คุณให้เป็นบัฟที่มีผลทั้งพื้นที่ โดยรสเด่นของอาหารเป็นตัวกำหนดว่าจะได้บัฟอะไร รสขมเพิ่มโอกาสเจอของหายาก รสฝาดเพิ่มโอกาสเห็นลูเกียกับโฮ-โอบินผ่าน รสเปรี้ยวทำให้ของในร้านดีขึ้นและลดราคา 10% รสเผ็ดเพิ่มโอกาสที่โปเกมอนจะปรากฏในที่อยู่อาศัย และรสหวานเพิ่มโอกาสเจอ Ancient Artefact`),
        t(`Strength scales with the dish. Berries, drinks and plain vegetables are the weakest tier; simple salads, soups, bread and hamburgers are standard; and elaborate dishes — bread bowls, crouton salads, explosive hamburger steaks, coffee parfait smoothies — give the strongest version of the effect.`,
          `ความแรงของบัฟขึ้นกับระดับของอาหาร เบอร์รี เครื่องดื่ม และผักเปล่า ๆ เป็นระดับอ่อนที่สุด สลัด ซุป ขนมปัง และแฮมเบอร์เกอร์แบบธรรมดาเป็นระดับกลาง ส่วนเมนูซับซ้อนอย่าง bread bowl, crouton salad, explosive hamburger steak และ coffee parfait smoothie จะให้ผลแรงที่สุด`)),
    ]),

  g('friendship', 'users',
    t('Friendship, favourites & trading', 'มิตรภาพ ของโปรด และการแลกของ'),
    t('Two separate meters, one shared shortcut: give them what they like.', 'มีสองมิเตอร์แยกกัน แต่ใช้ทางลัดเดียวกัน คือให้ของที่มันชอบ'),
    [
      b(t('Friendship', 'ค่าความเป็นเพื่อน'),
        t(`Friendship is tracked separately from Comfy Level, though the two feed each other. Completing a Pokémon's request, giving it a gift, or playing one of its games all raise it. Games include quizzes about a friend of theirs and Look This Way, a three-round guessing match — you gain friendship for playing and more for winning.`,
          `ค่าความเป็นเพื่อนถูกนับแยกจาก Comfy Level แม้ทั้งสองจะส่งผลต่อกัน การทำคำขอของโปเกมอนให้สำเร็จ การให้ของขวัญ หรือการเล่นเกมกับมัน ล้วนเพิ่มค่านี้ เกมที่เล่นได้มีทั้งควิซเกี่ยวกับเพื่อนของมัน และ Look This Way ซึ่งเป็นเกมทายทิศสามยก คุณจะได้ค่าความเป็นเพื่อนจากการเล่น และได้มากขึ้นถ้าชนะ`),
        t(`As friendship climbs, Pokémon start giving you materials unprompted. At maximum they announce that you are Best Friends, start calling you by your name instead of "Ditto", and get a special mark on their Pokédex entry.`,
          `เมื่อค่าความเป็นเพื่อนสูงขึ้น โปเกมอนจะเริ่มให้วัสดุกับคุณเองโดยไม่ต้องขอ และเมื่อถึงระดับสูงสุด มันจะประกาศว่าคุณเป็นเพื่อนซี้ เริ่มเรียกคุณด้วยชื่อจริงแทนที่จะเรียกว่า "ดิตโต้" และจะมีเครื่องหมายพิเศษปรากฏในหน้าโปเกเด็กซ์ของมัน`)),
      b(t('Favourites', 'ของโปรด'),
        t(`Every item in the game belongs to several "favourite" categories — Round stuff, Shiny stuff, Wooden stuff, Ocean vibes, Spooky stuff, and about forty more. Each Pokémon likes a specific set. Giving or placing matching items raises friendship and Comfy Level much faster, and you can spot it working: a matching item lays down with a bigger sparkle.`,
          `ไอเทมทุกชิ้นในเกมจะถูกจัดอยู่ในหมวด "ของโปรด" หลายหมวด เช่น ของกลม ของแวววาว ของไม้ บรรยากาศทะเล ของหลอน และอีกราวสี่สิบหมวด โปเกมอนแต่ละตัวชอบชุดหมวดที่ต่างกัน การให้หรือวางของที่ตรงหมวดจะเพิ่มค่าความเป็นเพื่อนและ Comfy Level ได้เร็วกว่ามาก และสังเกตได้ง่าย ๆ คือของที่ตรงหมวดจะมีประกายใหญ่กว่าตอนวางลงพื้น`)),
      b(t('Trading', 'การแลกของ'),
        t(`A Pokémon with the Trade specialty will set up shop wherever there is a powered cash register and a table — the PokéMart, or the Pokémon Center when no event is running. The bigger the countertop, the more stock appears. Each trader brings a signature item (Lum Berry from Zorua, Rawst Berry from Chansey) alongside materials, crafted goods and even some Lost Relics.`,
          `โปเกมอนที่มีความถนัด Trade จะมาตั้งร้านตรงไหนก็ได้ที่มีเครื่องคิดเงินที่ต่อไฟและมีโต๊ะ เช่น PokéMart หรือ Pokémon Center ตอนที่ไม่มีอีเวนต์ เคาน์เตอร์ยิ่งใหญ่ ของยิ่งวางได้เยอะ พ่อค้าแต่ละตัวจะมีของประจำตัว เช่น โซรัวมี Lum Berry แชนซี่มี Rawst Berry มาพร้อมวัสดุ ของที่คราฟต์แล้ว และ Lost Relic บางชิ้น`),
        t(`Trades are weighed on a scale: match or exceed the asking value using up to four different item types. Here is the trick — if an item matches the trader's favourites, its value goes up 50%, shown in orange. An Eevee Doll worth 1,000 points to most Pokémon is worth 1,500 to Chansey, who likes fluffy and round things. Check the trader's likes before you open the scale.`,
          `การแลกใช้ระบบตาชั่ง คุณต้องจ่ายให้เท่ากับหรือมากกว่ามูลค่าที่มันขอ โดยใช้ไอเทมได้ไม่เกิน 4 ชนิด เคล็ดลับคือถ้าไอเทมตรงกับของโปรดของพ่อค้าตัวนั้น มูลค่าจะเพิ่มขึ้น 50% และจะแสดงเป็นสีส้ม เช่น ตุ๊กตาอีวุยที่มีค่า 1,000 แต้มสำหรับโปเกมอนทั่วไป จะมีค่า 1,500 แต้มสำหรับแชนซี่ที่ชอบของฟูและของกลม ควรเช็กของโปรดของพ่อค้าก่อนเปิดตาชั่งเสมอ`)),
    ]),

  g('legendary', 'star',
    t('Legendary & Mythical Pokémon', 'โปเกมอนในตำนานและโปเกมอนลึกลับ'),
    t('Where each one is, and why they are worth chasing early.', 'แต่ละตัวอยู่ที่ไหน และทำไมควรรีบตามเก็บ'),
    [
      b(t('Why they matter', 'ทำไมถึงสำคัญ'),
        t(`Legendary and Mythical Pokémon live in your towns like anyone else — with their own specialties, homes and desires — but they weigh far more heavily on Environment Level. Raising one Legendary's Comfy Level lifts a whole area's level noticeably faster than raising an ordinary Pokémon's.`,
          `โปเกมอนในตำนานและโปเกมอนลึกลับอาศัยอยู่ในเมืองของคุณเหมือนตัวอื่น ๆ มีความถนัด บ้าน และความต้องการของตัวเอง แต่มีน้ำหนักต่อ Environment Level มากกว่ามาก การดัน Comfy Level ของโปเกมอนในตำนานหนึ่งตัวจะยก Environment Level ของทั้งพื้นที่ได้เร็วกว่าการดันโปเกมอนธรรมดาอย่างเห็นได้ชัด`)),
      b(t('Dream Islands', 'จาก Dream Island'),
        t(`Befriend Drifloon to unlock Dream Islands — a once-a-day trip to a randomised island stocked with rare ore and materials. Starting the trip with a particular doll biases which Legendary can appear: Eevee Doll → Suicune, Pikachu Doll → Raikou, Arcanine Doll → Entei, Dragonite Doll → Mewtwo, Starmie Doll → Phione. It is a bias, not a guarantee.`,
          `ผูกมิตรกับดริฟลูนเพื่อปลดล็อก Dream Island ซึ่งเป็นทริปวันละครั้งไปยังเกาะสุ่มที่เต็มไปด้วยแร่และวัสดุหายาก การเริ่มทริปด้วยตุ๊กตาบางแบบจะเพิ่มโอกาสเจอโปเกมอนในตำนานที่กำหนด ได้แก่ ตุ๊กตาอีวุย → ซุยคูน, ตุ๊กตาพิคาชู → ไรโค, ตุ๊กตาอาร์คาไนน์ → เอนเทย์, ตุ๊กตาดราโกไนต์ → มิวทู, ตุ๊กตาสตาร์มี → ฟิโอเน่ ทั้งนี้เป็นแค่การเพิ่มโอกาส ไม่ใช่การการันตี`)),
      b(t('The rest of the roster', 'ตัวที่เหลือ'),
        t(`Palette Town holds three build kits, each needing 15 Pokémon and a heavy resource cost: Freezing Chambers (Articuno), Abandoned Power Plant (Zapdos) and Altar of the Flame (Moltres).`,
          `Palette Town มีชุดก่อสร้างสามชุด แต่ละชุดต้องใช้โปเกมอน 15 ตัวและทรัพยากรจำนวนมาก ได้แก่ Freezing Chambers (อาร์ทิคูโน), Abandoned Power Plant (แซปดอส) และ Altar of the Flame (โมลเทรส)`),
        t(`Ho-Oh and Lugia fly overhead throughout the game and drop a Rainbow Feather or Silver Feather when they leave. Befriend all three birds to earn the Tidal Bell recipe (5 Rare PokéMetal + 5 Silver Feather); befriend Raikou, Entei and Suicune to earn the Clear Bell (5 Rare PokéMetal + 5 Rainbow Feather). Ring the matching bell as they pass and they will come down.`,
          `โฮ-โอและลูเกียจะบินผ่านเหนือหัวตลอดทั้งเกม และจะทิ้งขนนกสายรุ้งหรือขนนกสีเงินไว้เมื่อบินจากไป ผูกมิตรกับนกในตำนานครบสามตัวเพื่อรับสูตร Tidal Bell (Rare PokéMetal 5 + ขนนกสีเงิน 5) และผูกมิตรกับไรโค เอนเทย์ ซุยคูน เพื่อรับสูตร Clear Bell (Rare PokéMetal 5 + ขนนกสายรุ้ง 5) จากนั้นวางระฆังที่ตรงกันแล้วสั่นตอนที่มันบินผ่าน แล้วมันจะลงมาหา`),
        t(`Kyogre arrives on its own during the Withered Wastelands rain quest. Volcanion joins after Rocky Ridges if you throw a second party — mood back to 100 — and finish it by firing fireworks from a cannon. Mew needs 27 Mysterious Slates, found in shiny ground patches, arranged on the ruins near the Withered Wastelands Pokémon Center to form a Mew picture. Manaphy lives in Bubbly Basin.`,
          `ไคออกร์จะมาเองระหว่างเควสต์เรียกฝนที่ Withered Wastelands โวลคาเนียนจะเข้าร่วมหลังจบ Rocky Ridges ถ้าคุณจัดปาร์ตี้ครั้งที่สองโดยดัน Mood กลับไปที่ 100 แล้วปิดท้ายด้วยการยิงพลุจากปืนใหญ่ ส่วนมิวต้องใช้ Mysterious Slate 27 ชิ้นที่หาได้จากพื้นดินที่เป็นประกาย นำไปวางบนซากปรักหักพังใกล้ Pokémon Center ที่ Withered Wastelands ให้เรียงเป็นรูปมิว และมานาฟีอาศัยอยู่ที่ Bubbly Basin`)),
    ]),

  g('collectibles', 'disc',
    t('Collectibles & photography', 'ของสะสม และการถ่ายภาพ'),
    t('CDs, Lost Relics, Human Records, emotes, Highlight Reel and the Pokédex diploma.', 'ซีดี Lost Relic Human Records อีโมต Highlight Reel และใบประกาศโปเกเด็กซ์'),
    [
      b(t('What hides in glowing blocks', 'สิ่งที่ซ่อนอยู่ในบล็อกเรืองแสง'),
        t(`Glowing blocks rotate to new positions daily. Break them for Lost Relics, Mysterious Slates, fossils and the 43 music CDs — though a few CDs are instead sitting in CD racks in places like the S.S. Anne and the Pewter museum. Lost Relics have to be appraised by Professor Tangrowth before they can be used; from v2.0.0 you can hand over ten at a time.`,
          `บล็อกเรืองแสงจะย้ายตำแหน่งใหม่ทุกวัน ทุบเพื่อรับ Lost Relic, Mysterious Slate, ฟอสซิล และซีดีเพลงทั้ง 43 แผ่น แม้ว่าบางแผ่นจะไปวางอยู่ในชั้นซีดีตามสถานที่อย่างเรือ S.S. Anne และพิพิธภัณฑ์ Pewter แทน ส่วน Lost Relic ต้องให้ศาสตราจารย์ทังโกรว์ธประเมินก่อนถึงจะใช้ได้ และตั้งแต่เวอร์ชัน 2.0.0 ส่งได้ครั้งละ 10 ชิ้น`),
        t(`Human Records — newspapers, notes and journals left by the evacuated humans — are scattered across every area. Beyond filling in the backstory, many of them unlock outfits and emotes.`,
          `Human Records ทั้งหนังสือพิมพ์ บันทึก และไดอารีที่มนุษย์ผู้อพยพทิ้งไว้ กระจายอยู่ทั่วทุกพื้นที่ นอกจากจะเติมเต็มเรื่องราวเบื้องหลังแล้ว หลายชิ้นยังปลดล็อกชุดแต่งตัวและอีโมตด้วย`)),
      b(t('Highlight Reel', 'Highlight Reel'),
        t(`Occasionally the game tells you a photo opportunity is nearby; pull out your camera and a frame appears over a spot. Each opportunity has a condition — a particular Pokémon or group, a particular item that must be active, sometimes a time of day. Completing them fills your Highlight Reel and some award special items or photo frames.`,
          `บางครั้งเกมจะแจ้งว่ามีโอกาสถ่ายภาพอยู่ใกล้ ๆ ให้หยิบกล้องขึ้นมาแล้วจะเห็นกรอบลอยอยู่เหนือจุดนั้น แต่ละโอกาสมีเงื่อนไขของตัวเอง ทั้งโปเกมอนตัวใดตัวหนึ่งหรือกลุ่มใดกลุ่มหนึ่ง ไอเทมบางอย่างที่ต้องกำลังทำงานอยู่ และบางครั้งก็มีเงื่อนไขช่วงเวลาของวัน การถ่ายสำเร็จจะเติมช่องใน Highlight Reel และบางรายการให้ไอเทมหรือกรอบรูปพิเศษเป็นรางวัล`)),
      b(t('Completing the Pokédex', 'การเก็บโปเกเด็กซ์ให้ครบ'),
        t(`The main dex holds 300 Pokémon, all obtained by building the right habitat. Rewards drop at regular registration milestones. Fill it completely and you can craft the Neo Dowsing Machine, then take a Search Pokémon to the north-western island of Sparkling Skylands and dig down to a hidden scanner.`,
          `เด็กซ์หลักมีโปเกมอน 300 ตัว ทั้งหมดได้มาจากการสร้างที่อยู่อาศัยที่ถูกต้อง จะมีรางวัลตกตามจำนวนที่ลงทะเบียนเป็นระยะ ถ้าเก็บครบทั้งหมด คุณจะคราฟต์ Neo Dowsing Machine ได้ จากนั้นพาโปเกมอนที่มีความถนัด Search ไปที่เกาะทางตะวันตกเฉียงเหนือของ Sparkling Skylands แล้วขุดลงไปหาเครื่องสแกนที่ซ่อนอยู่`),
        t(`Scanning a full Pokédex opens the developer room from Celadon City, which hands you recipes for a printer, a shutter and a card reader — enough to build rooms with real locking mechanisms. The printer inside will print your Pokédex diploma to display wherever you like.`,
          `การสแกนด้วยโปเกเด็กซ์ที่ครบสมบูรณ์จะเปิดห้องนักพัฒนาจาก Celadon City ซึ่งจะให้สูตรเครื่องพิมพ์ บานประตูม้วน และเครื่องอ่านการ์ด ซึ่งเพียงพอต่อการสร้างห้องที่มีระบบล็อกจริง ๆ และเครื่องพิมพ์ในนั้นจะพิมพ์ใบประกาศโปเกเด็กซ์ให้คุณเอาไปตั้งโชว์ที่ไหนก็ได้`)),
    ]),

  g('multiplayer', 'globe',
    t('Cloud Islands & multiplayer', 'Cloud Island และการเล่นหลายคน'),
    t('A separate shared world, plus read-only island tours.', 'โลกอีกใบที่สร้างร่วมกัน และการเดินชมเกาะแบบอ่านอย่างเดียว'),
    [
      b(t('How Cloud Islands work', 'Cloud Island ทำงานอย่างไร'),
        t(`A Cloud Island is one giant map, separate from your main save, stocked with materials from every biome in the game. Your main-save items do not travel with you — you start from nothing — but your Pokédex and recipe list do. Every Pokémon can be summoned there, the Pokémon Center has its own Pokédex terminal, and the island keeps its own shop and Environment Level.`,
          `Cloud Island คือแผนที่ผืนใหญ่ผืนเดียว แยกจากเซฟหลักของคุณ และมีวัสดุจากทุกไบโอมในเกมให้ใช้ ไอเทมจากเซฟหลักจะไม่ติดตัวมา คุณจะเริ่มจากศูนย์ แต่โปเกเด็กซ์และลิสต์สูตรคราฟต์จะยังอยู่ เรียกโปเกมอนได้ทุกตัวที่นั่น Pokémon Center มีเครื่องโปเกเด็กซ์ของตัวเอง และเกาะนี้มีร้านค้ากับ Environment Level แยกของตัวเอง`),
        t(`Up to four people can build together, and anything gathered — by you or your visitors — stays on the island. Requires a Nintendo Switch Online subscription.`,
          `สร้างร่วมกันได้สูงสุด 4 คน และของทุกอย่างที่เก็บได้ ไม่ว่าจะโดยคุณหรือแขกที่มาเยือน จะอยู่บนเกาะนั้น ต้องสมัคร Nintendo Switch Online`)),
      b(t('Virtual Islands', 'Virtual Island'),
        t(`Buy Mysterious Goggles from the shop and you can tour other islands in read-only Virtual mode — walk around, look at everything, change nothing, and no interaction with other visitors. You can flag your own island as Virtual when you create it. The Pokémon Company periodically publishes official islands to visit; codes are listed on this site's Cloud Islands section.`,
          `ซื้อ Mysterious Goggles จากร้านแล้วคุณจะเดินชมเกาะคนอื่นในโหมด Virtual แบบอ่านอย่างเดียวได้ เดินดูได้ทุกอย่าง แต่เปลี่ยนแปลงอะไรไม่ได้ และไม่มีปฏิสัมพันธ์กับผู้เยี่ยมชมคนอื่น คุณตั้งเกาะของตัวเองให้เป็น Virtual ตอนสร้างได้เช่นกัน The Pokémon Company จะปล่อยเกาะทางการให้เข้าไปชมเป็นระยะ โดยโค้ดจะอยู่ในหมวด Cloud Island ของเว็บนี้`)),
    ]),
];

export const SOURCES = [
  ['Serebii.net — Pokémon Pokopia section', 'https://www.serebii.net/pokemonpokopia/'],
  ['Bulbapedia — Pokémon Pokopia', 'https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Pokopia'],
  ['Nintendo — Pokémon Pokopia store page', 'https://www.nintendo.com/us/store/products/pokemon-pokopia-switch-2/'],
  ['Pokemon.com — Pokopia news', 'https://www.pokemon.com/us/news/pokemon-pokopia-is-available-now-on-nintendo-switch-2'],
  ['PokéAPI — species names and sprites', 'https://pokeapi.co/'],
];
