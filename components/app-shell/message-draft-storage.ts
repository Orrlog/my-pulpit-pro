import type { StartPathId } from "./data";

export const MESSAGE_DRAFT_STORAGE_KEY = "my-pulpit-pro.local-message-draft.v3";
export const PREVIOUS_MESSAGE_DRAFT_STORAGE_KEY = "my-pulpit-pro.local-message-draft.v2";
export const LEGACY_MESSAGE_DRAFT_STORAGE_KEY = "my-pulpit-pro.local-message-draft.v1";
export const MISSING_VERSE_TEXT = "Verse text is not available in this local preview.";

export type ScriptureBankItem = {
  id: string;
  reference: string;
  text: string;
};

export type MessageDraftIntroduction = {
  hook: string;
  pastoralTension: string;
  passageConnection: string;
  bigIdeaBridge: string;
  firstMovementTransition: string;
};

export type MessageDraftClosing = {
  recap: string;
  callToResponse: string;
  closingApplication: string;
  prayer: string;
};

export type MessageDraftPoint = {
  id: string;
  title: string;
  summary: string;
  scripture: string;
  scriptureText: string;
  bullets: string[];
  explanation: string;
  application: string;
  illustration: string;
  transition: string;
  status?: "kept" | "rewritten";
};

export type MessageDraft = {
  id: string;
  createdAt: string;
  updatedAt: string;
  startingPath: StartPathId;
  startingPathLabel: string;
  messageMode: string;
  messageModeLabel: string;
  directionTitle: string;
  mainScripture: string;
  mainScriptureText: string;
  bigIdea: string;
  angle: string;
  pastoralFocus: string;
  length: string;
  lengthLabel: string;
  translation: string;
  developIdea?: string;
  developPassage?: string;
  desiredResponse?: string;
  weeklyConcern?: string;
  title: string;
  scriptureBank: ScriptureBankItem[];
  introduction: MessageDraftIntroduction;
  points: MessageDraftPoint[];
  closing: MessageDraftClosing;
};

type LegacyDraft = Partial<Omit<MessageDraft, "introduction" | "points" | "closing" | "scriptureBank">> & {
  scriptureBank?: Array<string | Partial<ScriptureBankItem>>;
  introduction?: string | Partial<MessageDraftIntroduction>;
  points?: Array<Partial<MessageDraftPoint> & { mainVerse?: string }>;
  application?: string;
  closingPrayer?: string;
  closing?: Partial<MessageDraftClosing>;
};

const kjvLookup: Record<string, string> = {
  "Psalm 13:5": "But I have trusted in thy mercy; my heart shall rejoice in thy salvation.",
  "Psalm 23:4": "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
  "Psalm 27:1": "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
  "Psalm 34:18": "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.",
  "Psalm 42:11": "Why art thou cast down, O my soul? and why art thou disquieted within me? hope thou in God: for I shall yet praise him, who is the health of my countenance, and my God.",
  "Psalm 46:1": "God is our refuge and strength, a very present help in trouble.",
  "Psalm 103:12": "As far as the east is from the west, so far hath he removed our transgressions from us.",
  "Psalm 119:105": "Thy word is a lamp unto my feet, and a light unto my path.",
  "Psalm 126:5": "They that sow in tears shall reap in joy.",
  "Proverbs 3:5": "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
  "Proverbs 19:11": "The discretion of a man deferreth his anger; and it is his glory to pass over a transgression.",
  "Isaiah 26:3": "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
  "Isaiah 40:31": "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
  "Joshua 1:9": "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
  "Isaiah 41:10": "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
  "Lamentations 3:22": "It is of the LORD'S mercies that we are not consumed, because his compassions fail not.",
  "Micah 6:8": "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
  "Matthew 5:4": "Blessed are they that mourn: for they shall be comforted.",
  "Matthew 6:33": "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
  "Matthew 11:28": "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
  "Matthew 18:22": "Jesus saith unto him, I say not unto thee, Until seven times: but, Until seventy times seven.",
  "Matthew 25:21": "His lord said unto him, Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things: enter thou into the joy of thy lord.",
  "Luke 23:34": "Then said Jesus, Father, forgive them; for they know not what they do. And they parted his raiment, and cast lots.",
  "John 11:35": "Jesus wept.",
  "John 14:27": "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.",
  "John 15:5": "I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.",
  "Acts 4:29": "And now, Lord, behold their threatenings: and grant unto thy servants, that with all boldness they may speak thy word,",
  "Romans 5:3": "And not only so, but we glory in tribulations also: knowing that tribulation worketh patience;",
  "Romans 8:28": "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
  "Romans 8:31": "What shall we then say to these things? If God be for us, who can be against us?",
  "Romans 12:2": "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
  "Romans 12:21": "Be not overcome of evil, but overcome evil with good.",
  "Romans 15:13": "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
  "1 Corinthians 15:58": "Therefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord, forasmuch as ye know that your labour is not in vain in the Lord.",
  "1 Corinthians 16:13": "Watch ye, stand fast in the faith, quit you like men, be strong.",
  "2 Corinthians 1:4": "Who comforteth us in all our tribulation, that we may be able to comfort them which are in any trouble, by the comfort wherewith we ourselves are comforted of God.",
  "2 Corinthians 4:17": "For our light affliction, which is but for a moment, worketh for us a far more exceeding and eternal weight of glory;",
  "2 Corinthians 5:18": "And all things are of God, who hath reconciled us to himself by Jesus Christ, and hath given to us the ministry of reconciliation;",
  "Galatians 6:2": "Bear ye one another's burdens, and so fulfil the law of Christ.",
  "Galatians 6:9": "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
  "Galatians 6:10": "As we have therefore opportunity, let us do good unto all men, especially unto them who are of the household of faith.",
  "Ephesians 4:32": "And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.",
  "Ephesians 6:10": "Finally, my brethren, be strong in the Lord, and in the power of his might.",
  "Philippians 4:6": "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
  "Philippians 4:7": "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
  "Philippians 4:8": "Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.",
  "Colossians 3:13": "Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye.",
  "Colossians 3:15": "And let the peace of God rule in your hearts, to the which also ye are called in one body; and be ye thankful.",
  "Colossians 3:17": "And whatsoever ye do in word or deed, do all in the name of the Lord Jesus, giving thanks to God and the Father by him.",
  "Colossians 3:23": "And whatsoever ye do, do it heartily, as to the Lord, and not unto men;",
  "1 Thessalonians 4:13": "But I would not have you to be ignorant, brethren, concerning them which are asleep, that ye sorrow not, even as others which have no hope.",
  "2 Thessalonians 3:13": "But ye, brethren, be not weary in well doing.",
  "1 Timothy 4:12": "Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity.",
  "2 Timothy 1:7": "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
  "Hebrews 6:19": "Which hope we have as an anchor of the soul, both sure and stedfast, and which entereth into that within the veil;",
  "Hebrews 10:24": "And let us consider one another to provoke unto love and to good works:",
  "Hebrews 12:1": "Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us,",
  "Hebrews 12:2": "Looking unto Jesus the author and finisher of our faith; who for the joy that was set before him endured the cross, despising the shame, and is set down at the right hand of the throne of God.",
  "James 1:5": "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",
  "James 1:22": "But be ye doers of the word, and not hearers only, deceiving your own selves.",
  "1 Peter 1:3": "Blessed be the God and Father of our Lord Jesus Christ, which according to his abundant mercy hath begotten us again unto a lively hope by the resurrection of Jesus Christ from the dead,",
  "1 Peter 5:7": "Casting all your care upon him; for he careth for you.",
  "1 Peter 5:10": "But the God of all grace, who hath called us unto his eternal glory by Christ Jesus, after that ye have suffered a while, make you perfect, stablish, strengthen, settle you.",
  "Revelation 21:4": "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.",
};

const scripturePools: Record<string, string[]> = {
  grief: ["Psalm 34:18", "John 11:35", "Matthew 5:4", "2 Corinthians 1:4", "1 Thessalonians 4:13", "Revelation 21:4", "Psalm 13:5", "1 Peter 5:10", "Romans 8:28", "Psalm 23:4"],
  forgiveness: ["Ephesians 4:32", "Colossians 3:13", "Matthew 18:22", "Romans 12:21", "Luke 23:34", "Psalm 103:12", "Micah 6:8", "2 Corinthians 5:18", "Proverbs 19:11", "Matthew 5:4"],
  anxiety: ["Philippians 4:6", "Philippians 4:7", "1 Peter 5:7", "Psalm 46:1", "Isaiah 26:3", "John 14:27", "Romans 8:31", "Psalm 23:4", "2 Timothy 1:7", "Matthew 6:33"],
  courage: ["Joshua 1:9", "Psalm 27:1", "Isaiah 41:10", "2 Timothy 1:7", "Acts 4:29", "Hebrews 12:1", "1 Corinthians 16:13", "Ephesians 6:10", "Romans 15:13", "James 1:5"],
  faithfulness: ["Galatians 6:9", "1 Corinthians 15:58", "Colossians 3:23", "Psalm 126:5", "Matthew 25:21", "2 Thessalonians 3:13", "Hebrews 10:24", "James 1:22", "John 15:5", "Micah 6:8"],
  hope: ["Romans 15:13", "Psalm 42:11", "1 Peter 1:3", "Isaiah 40:31", "Lamentations 3:22", "Hebrews 6:19", "Romans 5:3", "2 Corinthians 4:17", "John 14:27", "Revelation 21:4"],
  default: ["Psalm 46:1", "Proverbs 3:5", "Matthew 11:28", "John 15:5", "Romans 12:2", "Romans 15:13", "Galatians 6:9", "Philippians 4:6", "Colossians 3:17", "Hebrews 12:2", "James 1:22", "1 Peter 5:7"],
};

const movementStages = [
  {
    label: "Name the honest tension",
    summary: "Begin where the congregation actually feels the pressure.",
    focus: "weariness, fear, grief, resistance, or uncertainty people may be carrying",
    action: "tell the truth before God instead of hiding behind religious language",
  },
  {
    label: "Let the passage set the frame",
    summary: "Move from lived experience into the authority and comfort of Scripture.",
    focus: "the main passage as the anchor rather than a decorative reference",
    action: "listen carefully to what the text says before deciding what we want it to say",
  },
  {
    label: "Hold up the central truth",
    summary: "Clarify the truth the sermon will keep returning to.",
    focus: "the main idea as a steady center for the whole message",
    action: "bring scattered thoughts under one Scripture-shaped conviction",
  },
  {
    label: "Search the heart beneath the behavior",
    summary: "Address motives, fears, loves, and loyalties underneath outward responses.",
    focus: "what the issue reveals about trust, desire, control, bitterness, or hope",
    action: "invite honest repentance, surrender, or renewed trust",
  },
  {
    label: "Choose a faithful first response",
    summary: "Give listeners a concrete next step instead of a vague ideal.",
    focus: "ordinary obedience in conversations, decisions, habits, or prayer",
    action: "take one step that matches the truth already heard from Scripture",
  },
  {
    label: "Encourage the weary to continue",
    summary: "Strengthen people who are tired but still trying to be faithful.",
    focus: "God's nearness when progress feels slow or unseen",
    action: "receive courage without pretending the struggle is small",
  },
  {
    label: "Practice faith in public and private",
    summary: "Show how the message becomes visible in daily life.",
    focus: "the difference between agreement and embodied obedience",
    action: "carry the sermon into home, work, church, and hidden places",
  },
  {
    label: "Invite the church to carry this together",
    summary: "Turn private application into shared congregational care.",
    focus: "the church as a people who help one another obey and endure",
    action: "encourage, confess, forgive, pray, or serve as a body",
  },
  {
    label: "Clarify the next obedient step",
    summary: "Make the closing challenge specific enough to act on this week.",
    focus: "a response listeners can name before leaving the room",
    action: "identify one step of obedience, mercy, courage, or trust",
  },
  {
    label: "Send them out with hope",
    summary: "End with confidence in God's character, not confidence in willpower.",
    focus: "God's sustaining grace beyond the sermon moment",
    action: "leave with prayerful dependence and durable hope",
  },
];

export function getPointCount(length: string) {
  if (length === "30") return 6;
  if (length === "60") return 10;
  return 8;
}

function cleanSentence(value: string) {
  return value.replace(/^Preview sample:\s*/i, "").replace(/\s+/g, " ").replace(/\.\.+/g, ".").trim();
}

function topicFrom(input: { directionTitle: string; bigIdea: string; pastoralFocus: string; angle: string; mainScripture: string }) {
  const haystack = `${input.directionTitle} ${input.bigIdea} ${input.pastoralFocus} ${input.angle} ${input.mainScripture}`.toLowerCase();
  return Object.keys(scripturePools).find((key) => key !== "default" && haystack.includes(key)) ?? "default";
}

export function getVerseText(reference: string) {
  return kjvLookup[reference.trim()] ?? MISSING_VERSE_TEXT;
}

function makeScriptureItem(reference: string, index: number): ScriptureBankItem {
  return {
    id: `scripture-${Date.now()}-${index}`,
    reference,
    text: getVerseText(reference),
  };
}

export function buildScriptureBank(input: {
  length: string;
  mainScripture: string;
  directionTitle: string;
  bigIdea: string;
  pastoralFocus: string;
  angle: string;
}): ScriptureBankItem[] {
  const needed = getPointCount(input.length);
  const pool = [...scripturePools[topicFrom(input)], ...scripturePools.default];
  const unique = pool.filter((ref, index, list) => list.indexOf(ref) === index && ref !== input.mainScripture);
  return unique.slice(0, Math.max(needed, 6)).map(makeScriptureItem);
}

export function buildIntroduction(input: {
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  angle: string;
  pastoralFocus: string;
}): MessageDraftIntroduction {
  const angle = cleanSentence(input.angle);
  return {
    hook: `Open with a familiar moment connected to ${input.directionTitle}: the point where people know faithfulness matters, but the next step still feels costly.`,
    pastoralTension: `${angle} Give people permission to admit the real pressure before asking them to respond faithfully.`,
    passageConnection: `Turn to ${input.mainScripture} as the anchor passage and show how the text speaks into that pressure with clarity, comfort, and authority.`,
    bigIdeaBridge: `State the central truth in plain language: ${cleanSentence(input.bigIdea)}`,
    firstMovementTransition: `Move from the pressure people feel into the first movement by naming the tension the passage is going to answer.`,
  };
}

export function buildClosing(input: {
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  pastoralFocus: string;
}): MessageDraftClosing {
  return {
    recap: `Gather the sermon around ${input.mainScripture}: ${cleanSentence(input.bigIdea)}`,
    callToResponse: `Ask each listener to name one faithful response that fits ${cleanSentence(input.pastoralFocus)} before the day is over.`,
    closingApplication: `Send the church toward one concrete act of obedience, mercy, courage, prayer, or reconciliation this week.`,
    prayer: `Lord, let Your Word take root in us. Give us humility to receive it, courage to obey it, tenderness toward one another, and hope that rests in Your faithful care. Amen.`,
  };
}

function movementTitle(stageLabel: string, input: { directionTitle: string; bigIdea: string; pastoralFocus: string }, index: number) {
  const subject = input.directionTitle.replace(/^The\s+/i, "");
  if (index === 0) return `${stageLabel}: ${subject}`;
  if (index === 2) return `${stageLabel}: ${cleanSentence(input.bigIdea)}`;
  if (index === 5) return `${stageLabel}: Grace for ${cleanSentence(input.pastoralFocus).toLowerCase()}`;
  return `${stageLabel}`;
}

export function buildInitialPoints(input: {
  length: string;
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  angle: string;
  pastoralFocus: string;
  scriptureBank?: ScriptureBankItem[];
}): MessageDraftPoint[] {
  const count = getPointCount(input.length);
  const bank = input.scriptureBank?.length ? input.scriptureBank : buildScriptureBank(input);
  const bigIdea = cleanSentence(input.bigIdea);
  const pastoralFocus = cleanSentence(input.pastoralFocus);
  const angle = cleanSentence(input.angle);

  return Array.from({ length: count }, (_, index) => {
    const stage = movementStages[index] ?? movementStages[movementStages.length - 1];
    const scripture = bank[index % bank.length] ?? makeScriptureItem(input.mainScripture, index);
    const next = movementStages[index + 1];
    const title = movementTitle(stage.label, { ...input, bigIdea, pastoralFocus }, index);
    return {
      id: `movement-${Date.now()}-${index + 1}`,
      title,
      summary: stage.summary,
      scripture: scripture.reference,
      scriptureText: scripture.text,
      bullets: [
        index === 0
          ? `Name the specific pressure behind ${input.directionTitle} so listeners feel seen rather than scolded.`
          : `Return to the sermon thread: ${bigIdea}`,
        `Use ${scripture.reference} to give this movement biblical weight without turning it into a separate sermon.`,
        `Press toward ${stage.action} in language that fits ordinary church life.`,
      ],
      explanation: `${stage.label} gives this part of the message a distinct purpose. It connects ${angle.toLowerCase()} with the promise, correction, or comfort of ${scripture.reference}, helping the pastor address ${stage.focus} while keeping ${input.mainScripture} as the anchor passage.`,
      application: `Invite listeners to ${stage.action}. Make the response concrete enough to practice in a conversation, habit, prayer, act of service, or decision this week.`,
      illustration: `Use a ministry-facing example: a hospital room, a family table, a quiet act of service, a difficult apology, a weary volunteer, or a hidden decision where ${pastoralFocus.toLowerCase()} becomes visible.`,
      transition: next
        ? `After this, move naturally toward ${next.label.toLowerCase()} by showing why the previous response needs the next truth.`
        : `Move into the closing by reminding the church that the final confidence rests in God's faithfulness, not human resolve.`,
    };
  });
}

function isIntroduction(value: unknown): value is MessageDraftIntroduction {
  return Boolean(value && typeof value === "object" && "hook" in value);
}

function isClosing(value: unknown): value is MessageDraftClosing {
  return Boolean(value && typeof value === "object" && "recap" in value);
}

function normalizeScriptureBank(value: LegacyDraft["scriptureBank"], base: Parameters<typeof buildScriptureBank>[0]) {
  if (!Array.isArray(value) || value.length === 0) return buildScriptureBank(base);
  return value.map((item, index) => {
    if (typeof item === "string") return makeScriptureItem(item, index);
    const reference = item.reference ?? "";
    return {
      id: item.id ?? `scripture-${Date.now()}-${index}`,
      reference,
      text: item.text ?? getVerseText(reference),
    };
  });
}

export function normalizeMessageDraft(raw: unknown): MessageDraft | null {
  if (!raw || typeof raw !== "object") return null;

  const legacy = raw as LegacyDraft;
  const mainScripture = legacy.mainScripture ?? "Selected main passage";
  const directionTitle = legacy.directionTitle ?? legacy.title ?? "Untitled message";
  const bigIdea = legacy.bigIdea ?? "God's Word invites a faithful response in ordinary life.";
  const pastoralFocus = cleanSentence(legacy.pastoralFocus ?? "Pastoral care, faithful response, and congregational encouragement.");
  const angle = legacy.angle ?? "A Scripture-centered message direction for the congregation.";
  const length = legacy.length ?? "45";
  const base = { length, mainScripture, directionTitle, bigIdea, pastoralFocus, angle };
  const scriptureBank = normalizeScriptureBank(legacy.scriptureBank, base);
  const introduction = isIntroduction(legacy.introduction)
    ? { ...buildIntroduction(base), ...legacy.introduction }
    : { ...buildIntroduction(base), hook: typeof legacy.introduction === "string" ? legacy.introduction : buildIntroduction(base).hook };
  const closing = isClosing(legacy.closing)
    ? { ...buildClosing(base), ...legacy.closing }
    : { ...buildClosing(base), closingApplication: legacy.application ?? buildClosing(base).closingApplication, prayer: legacy.closingPrayer ?? buildClosing(base).prayer };
  const generated = buildInitialPoints({ ...base, scriptureBank });
  const points = Array.isArray(legacy.points) && legacy.points.length
    ? legacy.points.map((point, index) => {
        const fallback = generated[index % generated.length];
        const scripture = point.scripture ?? point.mainVerse ?? fallback.scripture;
        return {
          ...fallback,
          id: point.id ?? `upgraded-${Date.now()}-${index}`,
          title: point.title ?? fallback.title,
          summary: point.summary ?? fallback.summary,
          scripture,
          scriptureText: point.scriptureText ?? getVerseText(scripture),
          bullets: Array.isArray(point.bullets) && point.bullets.length ? point.bullets : fallback.bullets,
          explanation: point.explanation ?? fallback.explanation,
          application: point.application ?? fallback.application,
          illustration: point.illustration ?? fallback.illustration,
          transition: point.transition ?? fallback.transition,
          status: point.status,
        };
      })
    : generated;

  return {
    id: legacy.id ?? `local-${Date.now()}`,
    createdAt: legacy.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startingPath: legacy.startingPath ?? "explore",
    startingPathLabel: legacy.startingPathLabel ?? "Explore Message Ideas",
    messageMode: legacy.messageMode ?? "sunday",
    messageModeLabel: legacy.messageModeLabel ?? "Sunday Sermon",
    directionTitle,
    mainScripture,
    mainScriptureText: legacy.mainScriptureText ?? getVerseText(mainScripture),
    bigIdea,
    angle,
    pastoralFocus,
    length,
    lengthLabel: legacy.lengthLabel ?? `${length} minutes`,
    translation: legacy.translation ?? "King James Version, KJV",
    developIdea: legacy.developIdea,
    developPassage: legacy.developPassage,
    desiredResponse: legacy.desiredResponse,
    weeklyConcern: legacy.weeklyConcern,
    title: legacy.title ?? directionTitle,
    scriptureBank,
    introduction,
    points,
    closing,
  };
}
