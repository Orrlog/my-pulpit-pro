import type { StartPathId } from "./data";

export const MESSAGE_DRAFT_STORAGE_KEY = "my-pulpit-pro.local-message-draft.v3";
export const PREVIOUS_MESSAGE_DRAFT_STORAGE_KEY = "my-pulpit-pro.local-message-draft.v2";
export const LEGACY_MESSAGE_DRAFT_STORAGE_KEY = "my-pulpit-pro.local-message-draft.v1";
export const MISSING_VERSE_TEXT = "Verse text is not available in this local preview.";

export type ScriptureBankItem = {
  id: string;
  reference: string;
  text: string;
  supportNote: string;
  fullContext?: string;
};

export type PastoralCareNote = {
  text: string;
  includeInPulpit: boolean;
};

export type MessageDraftIntroduction = {
  hook: string;
  pastoralTension: string;
  passageConnection: string;
  bigIdeaBridge: string;
  explanation: string;
  firstMovementTransition: string;
  bullets: string[];
  scripture?: string;
  scriptureText?: string;
  notes: string;
};

export type MessageDraftClosing = {
  recap: string;
  callToResponse: string;
  closingApplication: string;
  prayer: string;
  bullets: string[];
  scripture?: string;
  scriptureText?: string;
  notes: string;
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
  illustrationOptions: string[];
  transition: string;
  optionalResponseMoment?: string;
  includeOptionalResponse?: boolean;
  notes: string;
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
  contextNotes: string[];
  pastoralCareNote?: PastoralCareNote;
  scriptureBank: ScriptureBankItem[];
  introduction: MessageDraftIntroduction;
  points: MessageDraftPoint[];
  closing: MessageDraftClosing;
};

type LegacyDraft = Partial<Omit<MessageDraft, "introduction" | "points" | "closing" | "scriptureBank">> & {
  scriptureBank?: Array<string | Partial<ScriptureBankItem>>;
  introduction?: string | Partial<MessageDraftIntroduction>;
  points?: Array<Partial<MessageDraftPoint> & { mainVerse?: string; illustration?: string }>;
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
  "Isaiah 40:29": "He giveth power to the faint; and to them that have no might he increaseth strength.",
  "Isaiah 40:30": "Even the youths shall faint and be weary, and the young men shall utterly fall:",
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

const kjvPassageLookup: Record<string, string> = {
  "Philippians 4:4-9": "4 Rejoice in the Lord alway: and again I say, Rejoice.\n5 Let your moderation be known unto all men. The Lord is at hand.\n6 Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.\n7 And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.\n8 Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.\n9 Those things, which ye have both learned, and received, and heard, and seen in me, do: and the God of peace shall be with you.",
  "Joshua 1:1-9": "1 Now after the death of Moses the servant of the LORD it came to pass, that the LORD spake unto Joshua the son of Nun, Moses' minister, saying,\n2 Moses my servant is dead; now therefore arise, go over this Jordan, thou, and all this people, unto the land which I do give to them, even to the children of Israel.\n3 Every place that the sole of your foot shall tread upon, that have I given unto you, as I said unto Moses.\n4 From the wilderness and this Lebanon even unto the great river, the river Euphrates, all the land of the Hittites, and unto the great sea toward the going down of the sun, shall be your coast.\n5 There shall not any man be able to stand before thee all the days of thy life: as I was with Moses, so I will be with thee: I will not fail thee, nor forsake thee.\n6 Be strong and of a good courage: for unto this people shalt thou divide for an inheritance the land, which I sware unto their fathers to give them.\n7 Only be thou strong and very courageous, that thou mayest observe to do according to all the law, which Moses my servant commanded thee: turn not from it to the right hand or to the left, that thou mayest prosper whithersoever thou goest.\n8 This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night, that thou mayest observe to do according to all that is written therein: for then thou shalt make thy way prosperous, and then thou shalt have good success.\n9 Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
  "Galatians 6:7-10": "7 Be not deceived; God is not mocked: for whatsoever a man soweth, that shall he also reap.\n8 For he that soweth to his flesh shall of the flesh reap corruption; but he that soweth to the Spirit shall of the Spirit reap life everlasting.\n9 And let us not be weary in well doing: for in due season we shall reap, if we faint not.\n10 As we have therefore opportunity, let us do good unto all men, especially unto them who are of the household of faith.",
  "Psalm 23": "1 The LORD is my shepherd; I shall not want.\n2 He maketh me to lie down in green pastures: he leadeth me beside the still waters.\n3 He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.\n4 Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.\n5 Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.\n6 Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.",
};

const scriptureFallbacks: Record<string, string> = {
  "Philippians 4:4-9": "Philippians 4:6",
  "Joshua 1:1-9": "Joshua 1:9",
  "Galatians 6:7-10": "Galatians 6:9",
  "Psalm 23": "Psalm 23:4",
};

export type ScriptureTextResult = {
  reference: string;
  text: string;
  available: boolean;
  translation: "KJV" | "unavailable";
};

const scripturePools: Record<string, string[]> = {
  grief: ["Psalm 34:18", "John 11:35", "Matthew 5:4", "2 Corinthians 1:4", "1 Thessalonians 4:13", "Revelation 21:4", "Psalm 13:5", "1 Peter 5:10", "Romans 8:28", "Psalm 23:4"],
  forgiveness: ["Ephesians 4:32", "Colossians 3:13", "Matthew 18:22", "Romans 12:21", "Luke 23:34", "Psalm 103:12", "Micah 6:8", "2 Corinthians 5:18", "Proverbs 19:11", "Matthew 5:4"],
  anxiety: ["Psalm 46:1", "Isaiah 26:3", "Matthew 6:33", "John 14:27", "1 Peter 5:7", "Romans 12:2", "Philippians 4:6", "2 Timothy 1:7", "Psalm 23:4", "James 1:5"],
  courage: ["Joshua 1:9", "Psalm 27:1", "Isaiah 41:10", "2 Timothy 1:7", "Acts 4:29", "Hebrews 12:1", "1 Corinthians 16:13", "Ephesians 6:10", "Romans 15:13", "James 1:5"],
  faithfulness: ["Galatians 6:9", "1 Corinthians 15:58", "Colossians 3:23", "Psalm 126:5", "Matthew 25:21", "2 Thessalonians 3:13", "Hebrews 10:24", "James 1:22", "John 15:5", "Micah 6:8"],
  hope: ["Romans 15:13", "Psalm 42:11", "1 Peter 1:3", "Isaiah 40:31", "Lamentations 3:22", "Hebrews 6:19", "Romans 5:3", "2 Corinthians 4:17", "John 14:27", "Revelation 21:4"],
  default: ["Isaiah 40:31", "Psalm 46:1", "Proverbs 3:5", "Matthew 11:28", "John 15:5", "Romans 12:2", "Romans 15:13", "Galatians 6:9", "Philippians 4:6", "Colossians 3:17", "Hebrews 12:2", "James 1:22", "1 Peter 5:7"],
};

type MovementSeed = {
  title: string;
  summary: string;
  bullets: string[];
  explanation: string;
  application: string;
  illustrationOptions: string[];
  transition: string;
  optionalResponseMoment?: string;
};

const defaultSeeds: MovementSeed[] = [
  {
    title: "Hear the Passage",
    summary: "Let the passage name the real need before the sermon offers a response.",
    bullets: ["The first word belongs to Scripture, not to our assumptions.", "People often need help seeing the tension that the passage is already addressing.", "A careful beginning keeps the sermon from becoming a collection of good advice."],
    explanation: "Begin with the pressure named in the passage. Let the congregation feel why this Word matters today before moving to application.",
    application: "Ordinary life is full of moments when people react before they listen. The church can slow down and hear what God has actually said.",
    illustrationOptions: ["A person opening a message before reading the whole conversation.", "Someone reacting to a headline before learning the story.", "A family conversation that changes once everyone finally listens."],
    transition: "Once the need is clear, move into the central truth that carries the passage.",
  },
  {
    title: "Hold the Main Word",
    summary: "Hold the passage’s central claim in front of the whole message.",
    bullets: ["The passage is not trying to say everything at once.", "A clear big idea gives the sermon a path the listener can follow.", "The supporting Scriptures should strengthen this truth, not replace it."],
    explanation: "Name the truth the passage presses on the church. Keep the language simple enough for someone to carry it into Monday morning.",
    application: "When life feels scattered, a clear word from Scripture gives the heart something steady to return to.",
    illustrationOptions: ["A compass helping someone walk through unfamiliar woods.", "A parent repeating one steady phrase to a frightened child.", "A worker returning to the main task after too many interruptions."],
    transition: "With the main truth stated, let the passage begin to press on the heart.",
  },
  {
    title: "Bring the Heart into Light",
    summary: "The passage reaches beneath behavior to what people trust, fear, or love.",
    bullets: ["Most outward responses begin with something happening in the heart.", "Scripture often comforts and confronts at the same time.", "The goal is not shame; it is honest surrender before God."],
    explanation: "Show how the passage speaks to motives and fears beneath the surface. Keep the tone pastoral, not accusatory.",
    application: "A faithful response often begins by admitting what has been driving us: fear, pride, grief, hurry, resentment, or the need to control.",
    illustrationOptions: ["Someone apologizing for sharp words after realizing fear was underneath them.", "A person overworking because they are afraid of being forgotten.", "A quiet moment when prayer reveals what worry has been protecting."],
    transition: "After the heart is named, the sermon can offer a concrete step of faith.",
  },
  {
    title: "Practice One Faithful Step",
    summary: "Faith becomes visible in one concrete act of obedience.",
    bullets: ["Obedience usually begins smaller than we imagine.", "The next faithful step may be hidden from everyone but God.", "Small steps matter when they are rooted in trust."],
    explanation: "Move from hearing the truth to practicing it. Give a faithful path without pretending every struggle disappears quickly.",
    application: "Choose one place where this passage should shape a decision, conversation, habit, prayer, or act of service this week.",
    illustrationOptions: ["A believer sending the apology they have delayed.", "Someone praying before answering a tense message.", "A volunteer doing unseen work with a steady heart."],
    transition: "The next step matters because God works in the slow places too.",
  },
  {
    title: "Keep Going with Hope",
    summary: "God’s faithfulness gives strength when results are slow.",
    bullets: ["Not seeing results is not the same as God not working.", "The Lord sees faithfulness that no one else notices.", "Hope gives tired people a reason to keep doing good."],
    explanation: "Encourage the weary without minimizing the cost of obedience. The passage gives hope because God remains faithful beyond what can be seen.",
    application: "This truth meets the person who is tired of doing the right thing with little encouragement. The work is not wasted when it is offered to the Lord.",
    illustrationOptions: ["A caregiver serving when no one is watching.", "A teacher repeating the same lesson until it finally takes root.", "A farmer trusting the season before the field shows fruit."],
    transition: "Bring the message toward a response grounded in God’s character.",
  },
  {
    title: "Leave with Courage",
    summary: "The sermon ends with trust in God and a faithful way forward.",
    bullets: ["A good ending gathers the whole passage into one clear call.", "The response should be specific enough to practice.", "The final confidence rests in God, not willpower."],
    explanation: "Close by returning to the main passage and naming the response it calls for. Keep the ending hopeful and concrete.",
    application: "Carry one clear response into the week: a prayer, a conversation, a habit, a step of courage, or a renewed act of mercy.",
    illustrationOptions: ["Someone leaving worship with one decision already in mind.", "A family choosing a different tone at home after hearing the Word.", "A believer placing a recurring worry into a daily prayer rhythm."],
    transition: "Move from the final challenge into prayer.",
  },
];

const philippiansFourSeeds: MovementSeed[] = [
  { title: "Rejoice in the Lord", summary: "Joy begins in the Lord, not in circumstances finally becoming easy.", bullets: ["Paul says rejoice while writing to people who knew pressure.", "Christian joy is not denial. It is a deeper anchor.", "The Lord is near before the situation is solved."], explanation: "Philippians 4 starts with joy because the heart needs a stronger center than changing circumstances. Rejoicing in the Lord does not erase pain, but it reminds the church where hope lives.", application: "When anxiety narrows the room, worship opens a window. A faithful response may begin by naming what is hard and still turning the heart toward the Lord.", illustrationOptions: ["Singing a hymn softly in a hospital room.", "Choosing gratitude during a week that still feels unresolved.", "A believer remembering one true thing about God before checking the news again."], transition: "Joy in the Lord prepares the heart for a gentler way of living." },
  { title: "Let Gentleness Be Seen", summary: "Gentleness replaces the need to control every outcome.", bullets: ["Pressure often makes people sharp.", "Paul connects gentleness with the nearness of the Lord.", "A gentle spirit can be strong without being harsh."], explanation: "The passage does not call the church to panic or force its way through life. Because the Lord is near, believers can speak and act with a steadiness that does not have to control everything.", application: "This truth meets the tense conversation, the rushed decision, and the moment when fear wants to become harshness.", illustrationOptions: ["Answering a difficult text after taking time to pray.", "A parent lowering their voice instead of winning the argument.", "A leader choosing patience when plans change at the last minute."], transition: "Gentleness opens the way to bring worry honestly to God." },
  { title: "Turn Worry into Prayer", summary: "Specific worries can become specific prayers before God.", bullets: ["Paul does not say believers have no burdens.", "He gives the burden somewhere to go.", "Prayer names the concern instead of letting it spin in silence."], explanation: "The command is not a scolding. It is an invitation. Anxiety keeps turning the same fear over and over; prayer carries that fear to the Father.", application: "Choose one worry that keeps replaying in your mind and bring that exact concern to God in prayer.", illustrationOptions: ["Lying awake while the same fear loops again and again.", "Checking a phone, bank account, or medical portal because bad news feels possible.", "Praying about a concern and then realizing you picked it back up before saying amen."], transition: "Prayer is joined with thanksgiving because memory strengthens trust." },
  { title: "Bring Thanksgiving with the Request", summary: "Thanksgiving remembers God’s care while the need is still real.", bullets: ["Thanksgiving does not pretend the problem is small.", "It remembers that God has carried His people before.", "Gratitude helps fear loosen its grip."], explanation: "Paul places thanksgiving in the middle of requests. The need is still named, but it is named before the God who has already shown mercy.", application: "When the request feels heavy, remember one clear mercy God has already given. Gratitude does not remove the burden, but it changes how it is carried.", illustrationOptions: ["Writing down one mercy beside a hard prayer request.", "Remembering a past provision before facing a new bill.", "Thanking God for one steady friendship during a lonely season."], transition: "As prayer and thanksgiving rise, the passage speaks about peace guarding the heart." },
  { title: "Peace Stands Guard", summary: "God’s peace protects the heart and mind when answers are not yet visible.", bullets: ["The peace of God is not the same as easy circumstances.", "Paul says peace guards both heart and mind.", "Christ is the place where that peace holds."], explanation: "God’s peace is pictured like a guard standing watch. The situation may still need wisdom and action, but the heart is not left defenseless.", application: "This truth meets the mind that will not stop rehearsing every possible outcome. God can guard what anxiety keeps trying to occupy.", illustrationOptions: ["A security guard watching an entrance while others sleep.", "A person breathing slowly before a hard appointment because they know they are not alone.", "A worried parent praying before the child comes home."], transition: "Peace guards the heart, and then Paul turns to the mind’s daily diet." },
  { title: "Train the Mind", summary: "The mind needs truth to dwell on, not just fears to avoid.", bullets: ["Paul gives the mind a place to go.", "What we dwell on shapes what we practice.", "Truth, purity, and praise are not escapes; they are training."], explanation: "Philippians 4 does not only tell believers what to stop. It gives the mind a better home. The church learns to dwell on what is true and then practice what has been received.", application: "Notice what your mind keeps feeding on. Replace one anxious loop with one true thought from Scripture and one faithful action.", illustrationOptions: ["Changing the channel because a story keeps feeding fear.", "Repeating a verse while walking into a difficult meeting.", "Practicing one learned habit until it becomes a new reflex."], transition: "Close by gathering prayer, peace, and practiced obedience under the promise that God is near." },
];

const galatiansSixSeeds: MovementSeed[] = [
  { title: "Weariness Is Not Failure", summary: "Tired obedience can still be faithful obedience.", bullets: ["Paul names weariness because faithful people really do get tired.", "Feeling worn down does not mean the work is worthless.", "God meets tired servants with a call to keep going."], explanation: "Galatians 6 speaks to people tempted to give up. The passage is honest about weariness without treating it as defeat.", application: "This meets the person who has kept serving, forgiving, praying, or showing up with little visible change.", illustrationOptions: ["A volunteer setting up chairs after a long week.", "A parent praying for the same child year after year.", "A caregiver doing quiet work no one posts about."], transition: "If weariness is not failure, then hidden work can still matter deeply." },
  { title: "God Sees Hidden Work", summary: "The Lord notices faithful labor that people overlook.", bullets: ["Human applause is a poor measure of faithfulness.", "Much of the good work in a church happens quietly.", "God sees the seed before anyone sees the harvest."], explanation: "Paul’s farming image reminds the church that unseen does not mean unimportant. Seeds disappear into soil before fruit appears.", application: "Do not measure obedience only by quick results or public thanks. Some of the holiest work is done quietly.", illustrationOptions: ["A nursery worker comforting a child during the sermon.", "A deacon making a repair no one notices.", "A widow praying through the church directory at home."], transition: "Because hidden work matters, the timing of results belongs to God." },
  { title: "Results Have a Season", summary: "Reaping comes in due season, not always on our schedule.", bullets: ["Paul does not promise instant fruit.", "The phrase due season teaches patience.", "God’s timing is not proof that God is absent."], explanation: "The passage teaches hope without hurry. Faithfulness plants and waters, but God governs the season of harvest.", application: "When results are slow, keep doing the good you know to do. The delay is not proof that obedience failed.", illustrationOptions: ["A farmer waiting through weeks when the field looks unchanged.", "A teacher repeating truth before a student understands.", "A church praying long before reconciliation begins."], transition: "Patience in the season shapes the heart of the one who keeps sowing." },
  { title: "Small Obedience Shapes Us", summary: "Repeated acts of faithfulness form the heart over time.", bullets: ["We become shaped by what we keep practicing.", "Small choices are not small when they train love.", "Doing good is both a gift to others and a work in us."], explanation: "Galatians 6 does not treat obedience as a dramatic moment only. The steady pattern of doing good forms a people who look more like Christ.", application: "Look for one small act of good that love requires today: a call, a meal, a confession, a visit, a gift, or a prayer.", illustrationOptions: ["A path through grass formed by repeated steps.", "A musician practicing scales when no audience is present.", "A child learning kindness through small repeated corrections."], transition: "That kind of formed faithfulness becomes visible in how the church treats people." },
  { title: "Do Good While There Is Opportunity", summary: "The passage turns patience into active love.", bullets: ["Waiting on God is not passive.", "Opportunity gives faithfulness a place to act.", "The household of faith needs practical care, not vague concern."], explanation: "Paul moves from not giving up to doing good as opportunity comes. The church is called to notice real needs and respond with love.", application: "Faithfulness may look like meeting a need that is right in front of you instead of waiting for a grander assignment.", illustrationOptions: ["Taking a meal to a tired family.", "Sending a quiet note to someone who feels forgotten.", "Choosing generosity when it would be easier to look away."], transition: "The final word is hope: the work is not wasted in the Lord." },
  { title: "The Work Is Not Wasted", summary: "The Lord gives meaning to faithful labor, even before fruit is seen.", bullets: ["The passage ends with endurance, not despair.", "God is not careless with the good His people sow.", "Faithfulness rests on God’s promise, not visible success."], explanation: "The promise of reaping gives weary believers a reason to continue. The Lord is faithful with what is entrusted to Him.", application: "Keep doing good because the Lord sees the seed, the soil, the tears, and the harvest that is still hidden from view.", illustrationOptions: ["A gardener watering soil before anything breaks the surface.", "A pastor visiting faithfully when attendance is small.", "A believer choosing honesty when no one would know otherwise."], transition: "Close by praying for endurance that rests in God’s faithfulness." },
];

export function getPointCount(length: string) {
  if (length === "30") return 6;
  if (length === "60") return 10;
  return 8;
}

export function stripPreviewDirectionLabel(value: string) {
  return value
    .replace(/\s*:\s*Preview Direction\s*\d+\s*$/i, "")
    .replace(/\s*[-–—]\s*Preview Direction\s*\d+\s*$/i, "")
    .replace(/\bPreview Direction\s*\d+\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanSentence(value: string) {
  return stripPreviewDirectionLabel(value)
    .replace(/^Preview sample:\s*/i, "")
    .replace(/\blocal preview\b/gi, "message direction")
    .replace(/\bpreview direction\b/gi, "message direction")
    .replace(/selected direction/gi, "message")
    .replace(/Let [1-3]? ?[A-Za-z]+ ?[0-9:.-]+ shape the practical response\.?/gi, "")
    .replace(/Let this Scripture shape one real decision before the day is over\.?/gi, "")
    .replace(/pastoral focus/gi, "main concern")
    .replace(/A Scripture-centered message can help the church respond faithfully to\s*/gi, "God meets people in ")
    .replace(/\bgod\b/g, "God")
    .replace(/\s+/g, " ")
    .replace(/\.\.+/g, ".")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

function bookOf(reference: string) {
  return reference.replace(/^\d\s+/, "").split(/\s+/)[0];
}

function topicFrom(input: { directionTitle: string; bigIdea: string; pastoralFocus: string; angle: string; mainScripture: string }) {
  if (input.mainScripture.toLowerCase().includes("isaiah 40")) return "default";
  const haystack = `${input.directionTitle} ${input.bigIdea} ${input.pastoralFocus} ${input.angle} ${input.mainScripture}`.toLowerCase();
  return Object.keys(scripturePools).find((key) => key !== "default" && haystack.includes(key)) ?? "default";
}

function movementSeedsFor(input: { mainScripture: string; directionTitle: string; bigIdea: string; pastoralFocus: string; angle: string }) {
  const passage = input.mainScripture.toLowerCase();
  if (passage.includes("philippians 4")) return philippiansFourSeeds;
  if (passage.includes("galatians 6")) return galatiansSixSeeds;
  return defaultSeeds;
}

type ScriptureProfile = {
  title: string;
  summary: string;
  bullets: string[];
  explanation: string;
  application: string;
  illustrationOptions: string[];
  transition: string;
};

const scriptureProfiles: Record<string, ScriptureProfile> = {
  "Isaiah 40:31": {
    title: "God Renews the Waiting Heart",
    summary: "Waiting on the Lord is trust that receives strength instead of manufacturing it.",
    bullets: ["The promise is given to people who have reached the end of themselves.", "Waiting on the Lord is active dependence, not passive resignation.", "Renewed strength shows up as endurance for the road still ahead."],
    explanation: "Isaiah 40:31 gives weary people more than encouragement to try harder. It points them to the Lord who renews strength as His people wait on Him.",
    application: "Name the place where waiting has become resentment, and bring that place honestly before the Lord instead of carrying it alone.",
    illustrationOptions: ["A runner slowing down long enough to receive water before continuing.", "A caregiver admitting exhaustion and asking for help.", "A believer praying before taking the next faithful step."],
    transition: "Renewed strength leads us to the refuge God gives in the middle of trouble.",
  },
  "Psalm 46:1": {
    title: "God Is Present in Trouble",
    summary: "The Lord is not distant from trouble; He is refuge and strength within it.",
    bullets: ["The verse does not deny trouble.", "God gives both shelter and strength.", "His help is present, not theoretical."],
    explanation: "Psalm 46:1 anchors the point in God's nearness. The church can face trouble without pretending it is small because God is present and strong.",
    application: "Name the trouble plainly in prayer, then identify one way to take refuge in God before reacting out of fear.",
    illustrationOptions: ["A storm shelter that matters because it is nearby.", "A family gathering in one safe room during severe weather.", "A church member finding steadiness in prayer before a hard appointment."],
    transition: "Because God is refuge, the next truth calls us away from leaning only on ourselves.",
  },
  "Proverbs 3:5": {
    title: "Trust Beyond Your Own Understanding",
    summary: "Faith trusts the Lord when personal understanding cannot carry the whole weight.",
    bullets: ["The verse commands whole-hearted trust.", "It names the limit of leaning on our own understanding.", "Trust is concrete when answers remain incomplete."],
    explanation: "Proverbs 3:5 develops the point by confronting self-reliance. The heart wants enough information to feel safe, but wisdom begins by trusting the Lord.",
    application: "Identify one place where you are demanding control before obedience, and choose one act of trust that does not require every answer first.",
    illustrationOptions: ["Following a guide through unfamiliar terrain.", "A child holding a parent's hand in a crowded place.", "A driver trusting a bridge before seeing the far side."],
    transition: "Trust opens the way to bring weariness and burdens to Christ.",
  },
  "Matthew 11:28": {
    title: "Bring the Burden to Christ",
    summary: "Jesus invites weary people to come to Him instead of carrying burdens alone.",
    bullets: ["The invitation is addressed to laboring and heavy-laden people.", "Christ does not shame weariness.", "Rest begins by coming to Him."],
    explanation: "Matthew 11:28 makes the point personal and Christ-centered. The Lord who knows our burdens invites us to come near and receive rest from Him.",
    application: "Turn one burden into a specific prayer of coming to Christ rather than simply rehearsing it internally.",
    illustrationOptions: ["Taking off a heavy pack after a long walk.", "Finally telling a trusted friend the truth about exhaustion.", "A child coming home after trying to be strong all day."],
    transition: "The rest Christ gives also teaches us where true fruitfulness comes from.",
  },
  "John 15:5": {
    title: "Fruit Comes from Abiding",
    summary: "Lasting fruit grows from dependence on Christ, not spiritual self-sufficiency.",
    bullets: ["Jesus names Himself as the vine.", "Branches bear fruit by abiding, not striving apart from Him.", "Without Him, effort cannot produce spiritual life."],
    explanation: "John 15:5 turns the point toward dependence. The sermon can show that strength is received through abiding relationship with Christ.",
    application: "Choose one daily rhythm of abiding—prayer, Scripture, confession, or worship—before measuring your worth by productivity.",
    illustrationOptions: ["A branch drying out when cut from the vine.", "A phone that looks useful but has no power source.", "A ministry worker learning to pray before planning."],
    transition: "Abiding in Christ also reshapes the mind and its patterns.",
  },
  "Romans 12:2": {
    title: "Let God Renew the Mind",
    summary: "God renews the mind so believers can discern and practice His will.",
    bullets: ["The world presses people into anxious patterns.", "Renewal happens as God reshapes the mind.", "Discernment leads to faithful practice."],
    explanation: "Romans 12:2 develops renewal at the level of thought and desire. God does not merely change circumstances; He forms a people who can think and live differently.",
    application: "Replace one repeated fear or resentment with a specific truth from Scripture and one obedient practice.",
    illustrationOptions: ["Changing a worn path by walking a better one repeatedly.", "Replacing a harmful soundtrack with a truer song.", "Learning a new reflex through repeated practice."],
    transition: "As the mind is renewed, hope becomes more than optimism.",
  },
  "Romans 15:13": {
    title: "Hope Overflows by God's Power",
    summary: "The God of hope fills His people with joy and peace through believing.",
    bullets: ["Hope begins with God's character.", "Joy and peace are gifts received through trust.", "The Holy Ghost gives power for hope to abound."],
    explanation: "Romans 15:13 gives the point a hopeful horizon. The church does not have to manufacture hope; God fills and strengthens His people by His Spirit.",
    application: "Ask God for hope where your heart has settled for survival, and look for one joy-giving sign of His faithfulness.",
    illustrationOptions: ["A cup filled until it overflows.", "A lamp brightening a dark room from a steady power source.", "A weary person encouraged by a promise they can pray back to God."],
    transition: "Hope strengthens the church to continue doing good.",
  },
  "Galatians 6:9": {
    title: "Do Not Grow Weary in Good",
    summary: "God gives endurance when doing good feels slow and costly.",
    bullets: ["Paul assumes faithful people can grow weary.", "The harvest has a season.", "The command is hopeful, not harsh."],
    explanation: "Galatians 6:9 speaks directly to tired obedience. It encourages perseverance because God sees the seed before anyone sees the harvest.",
    application: "Choose one good work you are tempted to abandon and take the next faithful step without demanding instant results.",
    illustrationOptions: ["A farmer watering ground before anything breaks the surface.", "A parent repeating truth before change is visible.", "A volunteer serving when no one notices."],
    transition: "Endurance becomes worship when every action is offered to the Lord.",
  },
  "Psalm 42:11": {
    title: "Speak Hope to the Downcast Soul",
    summary: "Hope sometimes begins by preaching truth to a discouraged heart.",
    bullets: ["The psalmist names the soul's heaviness without pretending it away.", "Hope is directed toward God, not toward improved circumstances alone.", "Praise can be anticipated before the feeling has returned."],
    explanation: "Psalm 42:11 teaches weary believers to address despair with Godward hope. The verse does not shame sorrow; it turns sorrow toward the Lord who remains worthy of trust.",
    application: "Name the discouragement honestly, then answer it with one true promise about God instead of letting the discouragement have the only voice.",
    illustrationOptions: ["A believer repeating a hymn line in a hospital waiting room.", "Someone writing a promise of God on a card beside a medication bottle.", "A tired parent praying aloud before the day feels any easier."],
    transition: "Hope grows stronger when it rests on resurrection mercy.",
  },
  "1 Peter 1:3": {
    title: "Hope Is Born from Mercy",
    summary: "Living hope rises from God's mercy and Christ's resurrection.",
    bullets: ["Peter grounds hope in God's abundant mercy.", "The resurrection gives hope a living foundation.", "This hope is received before every hardship is resolved."],
    explanation: "1 Peter 1:3 gives weary people a hope deeper than mood or circumstance. The resurrection of Jesus means God's mercy has already opened a future that suffering cannot erase.",
    application: "When the week feels drained of hope, begin prayer with God's mercy and Christ's resurrection before listing everything that is wrong.",
    illustrationOptions: ["A dawn that arrives after a long night without asking permission from the darkness.", "A family clinging to resurrection hope at a graveside.", "A church singing Easter truth during an ordinary hard Sunday."],
    transition: "Mercy-given hope is joined by daily compassion that does not run out.",
  },
  "Lamentations 3:22": {
    title: "Mercies Remain When Strength Runs Low",
    summary: "God's compassion does not fail when His people feel spent.",
    bullets: ["The verse rises from a book filled with sorrow.", "God's mercies are not fragile.", "Compassion becomes a reason to keep looking toward the Lord."],
    explanation: "Lamentations 3:22 places hope inside grief, not outside it. The weary can keep going because the Lord's compassion outlasts the season that has drained them.",
    application: "Look for one concrete mercy God has provided today, and let gratitude interrupt the assumption that nothing good remains.",
    illustrationOptions: ["A small light left on in a house during a storm.", "A meal delivered to a tired family at the right time.", "A journal page listing mercies during a difficult month."],
    transition: "Those mercies become an anchor for the soul.",
  },
  "Hebrews 6:19": {
    title: "Hope Anchors the Soul",
    summary: "God gives hope sturdy enough to hold when emotions are moving.",
    bullets: ["An anchor matters because waters move.", "Biblical hope is sure and steadfast.", "The soul can be held even before circumstances settle."],
    explanation: "Hebrews 6:19 pictures hope as an anchor. The point is not that believers never feel tossed, but that God's promise holds them when they do.",
    application: "Identify the thought that keeps drifting, then anchor it to a promise of God before making the next decision.",
    illustrationOptions: ["A boat held steady by an anchor while waves keep moving.", "A worker tying off a safety line before climbing.", "A family returning to one promise during a long uncertainty."],
    transition: "Anchored hope changes how we endure pressure.",
  },
  "Romans 5:3": {
    title: "Pressure Can Produce Endurance",
    summary: "God can use tribulation to form perseverance rather than despair.",
    bullets: ["Paul does not call pressure easy.", "Tribulation can become the place where endurance grows.", "Endurance is formed over time, not demanded instantly."],
    explanation: "Romans 5:3 helps the church see that suffering is not wasted in God's hands. The Lord can form endurance through pressure that would otherwise only drain the heart.",
    application: "Ask what endurance God may be forming in this season, and choose one sustainable practice that helps you remain faithful under pressure.",
    illustrationOptions: ["Physical therapy that strengthens slowly through repeated resistance.", "A runner training with measured strain instead of a reckless sprint.", "A caregiver learning pacing because the road is long."],
    transition: "Endurance is strengthened by an eternal perspective.",
  },
  "2 Corinthians 4:17": {
    title: "Affliction Is Not the Final Weight",
    summary: "Present suffering is real, but glory has the greater weight.",
    bullets: ["Paul does not deny affliction.", "He sets suffering beside eternal glory.", "The comparison gives weary people perspective without minimizing pain."],
    explanation: "2 Corinthians 4:17 develops hope by lifting the congregation's eyes beyond the immediate burden. The present affliction is not meaningless, and it is not the final measure of the story.",
    application: "Hold one painful circumstance before the Lord and ask Him to help you interpret it in light of eternal glory rather than only today's exhaustion.",
    illustrationOptions: ["A traveler enduring a difficult road because home is real.", "A patient enduring treatment because healing is the goal.", "A family measuring a long season by more than one hard week."],
    transition: "This eternal hope is joined by Christ's present peace.",
  },
  "John 14:27": {
    title: "Christ Gives Peace the World Cannot",
    summary: "Jesus gives peace that is not dependent on trouble disappearing.",
    bullets: ["Christ gives His own peace.", "His peace differs from what the world offers.", "Troubled hearts are invited away from fear."],
    explanation: "John 14:27 brings the sermon to the peace of Christ. The weary are not merely told to calm down; they are offered the peace Jesus Himself gives.",
    application: "Before trying to solve every pressure, pause and receive Christ's peace through prayer, Scripture, and surrender of the fear that has been ruling the moment.",
    illustrationOptions: ["A child calmed by a parent's presence before the problem is fixed.", "A hospital room becoming quieter when someone prays.", "A tense meeting approached with settled trust instead of panic."],
    transition: "Christ's peace points toward the day when weariness itself will end.",
  },
  "Revelation 21:4": {
    title: "God Will Wipe Away Every Tear",
    summary: "The final hope of God's people is a world where sorrow and pain are gone.",
    bullets: ["The promise is tender and personal.", "God Himself wipes away tears.", "Pain does not get the final word."],
    explanation: "Revelation 21:4 gives weary people the horizon of Christian hope. The sermon can acknowledge tears while pointing to the Lord who will finally remove sorrow, death, and pain.",
    application: "Let future hope give courage for present faithfulness, especially when today's burden cannot be fully repaired yet.",
    illustrationOptions: ["A parent wiping a child's tears after a frightening moment.", "A church holding hope during a funeral meal.", "A family enduring treatment while longing for restoration."],
    transition: "Until that day, the Lord strengthens His people for the battle at hand.",
  },
  "Ephesians 6:10": {
    title: "Be Strong in the Lord",
    summary: "Christian strength is received from the Lord and His mighty power.",
    bullets: ["The command is not to be strong in ourselves.", "Strength is located in the Lord.", "His power equips believers for the struggle before them."],
    explanation: "Ephesians 6:10 directs weary people away from self-generated strength. The church stands by receiving strength from the Lord and relying on His power.",
    application: "Replace the private claim 'I just have to be stronger' with a specific prayer for the Lord's strength before facing the next responsibility.",
    illustrationOptions: ["A worker plugging a tool into power before using it.", "A soldier relying on supplied armor rather than bare hands.", "A pastor praying before entering a difficult conversation."],
    transition: "The Lord's strength is also personal reassurance in fear.",
  },
  "Isaiah 41:10": {
    title: "God Upholds the Fearful",
    summary: "The Lord strengthens and upholds His people with His righteous hand.",
    bullets: ["The command not to fear is grounded in God's presence.", "God promises help, not distant observation.", "His upholding hand steadies people who feel weak."],
    explanation: "Isaiah 41:10 gives weary believers the comfort of God's personal presence and help. The Lord does not merely send strength; He upholds His people.",
    application: "Name the fear that has been shaping your reactions, and answer it with God's promise: He is with you, He will help you, and He will uphold you.",
    illustrationOptions: ["A person being steadied by another hand on icy steps.", "A child learning to walk while a parent holds close.", "A church member facing bad news with someone praying beside them."],
    transition: "The message can now call the church to walk forward in received strength.",
  },
};

function profileFor(reference: string): ScriptureProfile {
  return scriptureProfiles[reference] ?? {
    title: "Trust the Truth God Gives",
    summary: `${reference} gives this movement a distinct biblical truth for the congregation to carry.`,
    bullets: [`Let ${reference} speak before application is rushed.`, "Name the truth this verse reveals about God and His people.", "Move from that truth toward one faithful response."],
    explanation: `${reference} should shape this point directly. Explain what the verse teaches, then connect that truth back to the main passage and sermon direction.`,
    application: "Choose one concrete response that follows from this Scripture rather than a general intention to do better.",
    illustrationOptions: ["A person pausing long enough to listen before responding.", "A congregation carrying one clear truth into the week.", "A quiet act of obedience shaped by Scripture."],
    transition: "This truth prepares the next step in the message.",
  };
}

function hasSpecificProfile(reference: string) {
  return Boolean(scriptureProfiles[reference]);
}

function parseSingleChapterRange(reference: string) {
  const match = reference.trim().match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
  if (!match) return null;
  const [, book, chapter, start, end] = match;
  return { book, chapter, start: Number(start), end: Number(end) };
}

function assembleVerseRange(reference: string) {
  const parsed = parseSingleChapterRange(reference);
  if (!parsed || parsed.end < parsed.start) return null;
  const verses: string[] = [];
  for (let verse = parsed.start; verse <= parsed.end; verse += 1) {
    const verseReference = `${parsed.book} ${parsed.chapter}:${verse}`;
    const text = kjvLookup[verseReference];
    if (!text) return null;
    verses.push(`${verse} ${text}`);
  }
  return verses.join("\n");
}

export function resolveScriptureText(reference: string): ScriptureTextResult {
  const normalized = reference.trim();
  const storedPassage = kjvPassageLookup[normalized];
  if (storedPassage) return { reference: normalized, text: storedPassage, available: true, translation: "KJV" };

  const exactVerse = kjvLookup[normalized];
  if (exactVerse) return { reference: normalized, text: exactVerse, available: true, translation: "KJV" };

  const assembledRange = assembleVerseRange(normalized);
  if (assembledRange) return { reference: normalized, text: assembledRange, available: true, translation: "KJV" };

  const fallbackReference = scriptureFallbacks[normalized];
  if (fallbackReference) {
    const fallback = resolveScriptureText(fallbackReference);
    if (fallback.available) return fallback;
  }

  return { reference: normalized, text: MISSING_VERSE_TEXT, available: false, translation: "unavailable" };
}

export function getVerseText(reference: string) {
  return resolveScriptureText(reference).text;
}

function makeScriptureItem(reference: string, index: number, input?: { directionTitle: string; bigIdea: string; mainScripture: string }): ScriptureBankItem {
  return {
    id: `scripture-${Date.now()}-${index}`,
    reference,
    text: getVerseText(reference),
    supportNote: "",
    fullContext: undefined,
  };
}

function chooseReferences(input: {
  length: string;
  mainScripture: string;
  directionTitle: string;
  bigIdea: string;
  pastoralFocus: string;
  angle: string;
}) {
  const needed = getPointCount(input.length);
  const pool = [...scripturePools[topicFrom(input)], ...scripturePools.default].filter(hasSpecificProfile);
  const mainBook = bookOf(input.mainScripture);
  const seenBooks = new Set<string>();
  const chosen: string[] = [];

  for (const ref of pool) {
    const book = bookOf(ref);
    if (ref === input.mainScripture || book === mainBook || seenBooks.has(book)) continue;
    chosen.push(ref);
    seenBooks.add(book);
    if (chosen.length >= needed) break;
  }

  if (chosen.length < needed) {
    for (const ref of pool) {
      if (ref !== input.mainScripture && !chosen.includes(ref)) chosen.push(ref);
      if (chosen.length >= needed) break;
    }
  }

  return chosen;
}

export function buildScriptureBank(input: {
  length: string;
  mainScripture: string;
  directionTitle: string;
  bigIdea: string;
  pastoralFocus: string;
  angle: string;
}): ScriptureBankItem[] {
  const references = Array.from(new Set([input.mainScripture, ...chooseReferences(input)]));
  return references.map((reference, index) => makeScriptureItem(reference, index, input));
}

export function buildContextNotes(input: { mainScripture: string; directionTitle: string; bigIdea: string }) {
  const passage = input.mainScripture.toLowerCase();
  if (passage.includes("philippians 4")) {
    return [
      "Philippians 4:4-9 moves from rejoicing, to gentleness, to prayer, to peace, to disciplined thinking and practice.",
      "Paul does not treat anxiety as a reason for shame. He gives worried believers a place to bring their distress before God.",
    ];
  }
  if (passage.includes("galatians 6")) {
    return [
      "Galatians 6:7-10 uses the image of sowing and reaping to encourage patient faithfulness.",
      "The passage speaks to weary believers who may be tempted to stop doing good before fruit is visible.",
    ];
  }
  return [`Keep ${input.mainScripture} as the anchor. Let supporting passages serve the main text instead of taking over the sermon.`];
}

export function buildPastoralCareNote(input: { directionTitle: string; bigIdea: string; pastoralFocus: string; angle: string }) {
  const haystack = `${input.directionTitle} ${input.bigIdea} ${input.pastoralFocus} ${input.angle}`.toLowerCase();
  const sensitive = ["anxiety", "grief", "trauma", "depression", "illness", "addiction", "abuse", "family", "guilt", "suicide", "financial"];
  if (!sensitive.some((word) => haystack.includes(word))) return undefined;
  return {
    includeInPulpit: false,
    text: "Handle this subject with care. Do not shame people who are carrying chronic anxiety, grief, trauma, illness, or heavy family burdens. Prayer and Scripture matter deeply, and wise pastoral care can also include trusted counselors, doctors, or other appropriate support.",
  };
}

function introductionExplanationFor(input: { directionTitle: string; mainScripture: string; bigIdea: string; angle: string; pastoralFocus: string }) {
  if (input.mainScripture.toLowerCase().includes("isaiah 40")) {
    return "Isaiah 40 speaks to people who know the limits of human strength. Even the young and capable become weary, but the Lord gives power to those who have none left. Waiting on Him is not passive resignation; it is dependent trust that receives renewal for rising, running, and continuing to walk without giving up.";
  }
  return `${cleanSentence(input.mainScripture)} anchors the sermon in God's Word by naming the congregation's need, revealing the Lord's character, and preparing the church to receive the supporting truths that follow. ${cleanSentence(input.bigIdea)}`;
}

export function buildIntroduction(input: {
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  angle: string;
  pastoralFocus: string;
}): MessageDraftIntroduction {
  const angle = cleanSentence(input.angle);
  const title = cleanSentence(input.directionTitle);
  const introScripture = resolveScriptureText(input.mainScripture);
  const tension = input.mainScripture.toLowerCase().includes("isaiah 40")
    ? "Weariness can make faithful people feel as though strength has run out and hope has been delayed."
    : `${title} names a real pressure people bring into worship, not an abstract religious idea.`;
  return {
    hook: tension,
    pastoralTension: `${angle} Name the burden honestly before calling the church toward trust and obedience.`,
    passageConnection: `${input.mainScripture} should be read in the introduction so the message begins under the authority and comfort of the main text.`,
    bigIdeaBridge: cleanSentence(input.bigIdea),
    explanation: introductionExplanationFor(input),
    firstMovementTransition: "With the main passage before us, move from the burden people carry into the first biblical truth God gives.",
    bullets: [
      tension,
      `${input.mainScripture} speaks to that need by revealing God's character and calling for a faithful response.`,
      cleanSentence(input.bigIdea),
    ],
    scripture: introScripture.available ? introScripture.reference : input.mainScripture,
    scriptureText: introScripture.text,
    notes: "",
  };
}

export function buildClosing(input: {
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  pastoralFocus: string;
}): MessageDraftClosing {
  const title = cleanSentence(input.directionTitle);
  const bigIdea = cleanSentence(input.bigIdea);
  return {
    recap: `${input.mainScripture} has carried the sermon from the real burden into the sustaining truth of God’s care.`,
    callToResponse: `Call the listener to respond to ${title.toLowerCase()} with one honest act of trust, prayer, endurance, or obedience.`,
    closingApplication: `${bigIdea} Bring that truth into the specific place where the week ahead feels heavy, uncertain, or costly.`,
    prayer: "Ask the Lord to renew tired hearts, deepen trust in His Word, and make the next faithful step clear.",
    bullets: [
      `${input.mainScripture} gives the final word to God’s strength rather than to the weight people carried in.`,
      bigIdea,
      "The response should be concrete enough to practice before the week is over.",
    ],
    scripture: undefined,
    scriptureText: undefined,
    notes: "",
  };
}

function qualityText(value: string, maxTitleWords?: number) {
  let next = cleanSentence(value)
    .replace(/Ask each listener to/gi, "Choose one way to")
    .replace(/Invite listeners to/gi, "A faithful response is to")
    .replace(/Use a ministry-facing example:?/gi, "For example:")
    .replace(/This section gives this part of the message a distinct purpose\.\s*/gi, "")
    .replace(/selected Scripture/gi, "supporting Scripture");
  if (maxTitleWords) {
    const words = next.split(" ");
    if (words.length > maxTitleWords) next = words.slice(0, maxTitleWords).join(" ");
  }
  return next;
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
  const seeds = movementSeedsFor(input);
  const supportBank = bank.filter((item) => item.reference !== input.mainScripture);
  const usedTitles = new Set<string>();
  const usedScriptures = new Set<string>();
  const points: MessageDraftPoint[] = [];

  for (let index = 0; index < count; index += 1) {
    const point = buildPointForIndex(input, supportBank, seeds, index, usedTitles, usedScriptures);
    usedTitles.add(point.title);
    usedScriptures.add(point.scripture);
    points.push(point);
  }

  return points;
}

function buildPointForIndex(input: { directionTitle: string; mainScripture: string; bigIdea: string; pastoralFocus: string; angle: string }, supportBank: ScriptureBankItem[], seeds: MovementSeed[], index: number, usedTitles = new Set<string>(), usedScriptures = new Set<string>()): MessageDraftPoint {
  const available = supportBank.find((item) => !usedScriptures.has(item.reference)) ?? supportBank[index % Math.max(supportBank.length, 1)] ?? makeScriptureItem(input.mainScripture, index, input);
  const profile = profileFor(available.reference);
  const seed = seeds[index % seeds.length];
  const baseTitle = profile.title || seed.title;
  const title = usedTitles.has(baseTitle) ? `${baseTitle} Again in Daily Life` : baseTitle;
  return {
    id: `movement-${Date.now()}-${index + 1}-${Math.random().toString(36).slice(2, 7)}`,
    title: qualityText(title, 9),
    summary: qualityText(`${profile.summary} This remains tied to ${input.mainScripture} and ${cleanSentence(input.directionTitle).toLowerCase()}.`),
    scripture: available.reference,
    scriptureText: available.text,
    bullets: Array.from(new Set(profile.bullets.map((bullet) => qualityText(bullet)))).slice(0, 3),
    explanation: qualityText(`${profile.explanation} Connect it back to ${input.mainScripture} by showing how this supporting truth serves the sermon’s central burden: ${cleanSentence(input.bigIdea).toLowerCase()}`),
    application: qualityText(profile.application),
    illustrationOptions: profile.illustrationOptions.map((option) => qualityText(option)),
    transition: qualityText(profile.transition),
    optionalResponseMoment: index === 2 ? "Optional response moment: pause and let people silently name the burden they need to bring to God." : undefined,
    includeOptionalResponse: false,
    notes: "",
  };
}

export function buildAdditionalPoint(draft: MessageDraft): MessageDraftPoint {
  const usedTitles = new Set(draft.points.map((point) => point.title));
  const usedScriptures = new Set(draft.points.map((point) => point.scripture));
  const supportBank = draft.scriptureBank.filter((item) => item.reference !== draft.mainScripture);
  return buildPointForIndex(draft, supportBank, movementSeedsFor(draft), draft.points.length, usedTitles, usedScriptures);
}

export function rewriteMessagePoint(draft: MessageDraft, point: MessageDraftPoint): MessageDraftPoint {
  const usedScriptures = new Set(draft.points.filter((item) => item.id !== point.id).map((item) => item.scripture));
  const supportBank = draft.scriptureBank.filter((item) => item.reference !== draft.mainScripture);
  const alternate = supportBank.find((item) => !usedScriptures.has(item.reference) && item.reference !== point.scripture) ?? supportBank.find((item) => item.reference === point.scripture) ?? makeScriptureItem(point.scripture, 0, draft);
  const profile = profileFor(alternate.reference);
  return {
    ...point,
    title: qualityText(profile.title, 9),
    summary: qualityText(`${profile.summary} This rewritten movement keeps the sermon connected to ${draft.mainScripture}.`),
    scripture: alternate.reference,
    scriptureText: alternate.text,
    bullets: profile.bullets.map((bullet) => qualityText(bullet)),
    explanation: qualityText(profile.explanation),
    application: qualityText(profile.application),
    illustrationOptions: profile.illustrationOptions.map((option) => qualityText(option)),
    transition: qualityText(profile.transition),
    status: "rewritten",
    notes: point.notes,
  };
}

export function cleanMessageDraft(draft: MessageDraft): MessageDraft {
  const seenApplications = new Set<string>();
  return {
    ...draft,
    title: qualityText(stripPreviewDirectionLabel(draft.title), 8),
    contextNotes: Array.from(new Set(draft.contextNotes.map((note) => qualityText(note)).filter(Boolean))),
    introduction: {
      hook: qualityText(draft.introduction.hook),
      pastoralTension: qualityText(draft.introduction.pastoralTension),
      passageConnection: qualityText(draft.introduction.passageConnection),
      bigIdeaBridge: qualityText(draft.introduction.bigIdeaBridge),
      explanation: qualityText(draft.introduction.explanation ?? introductionExplanationFor(draft)),
      firstMovementTransition: qualityText(draft.introduction.firstMovementTransition),
      bullets: Array.from(new Set((draft.introduction.bullets ?? []).map((bullet) => qualityText(bullet)).filter(Boolean))).slice(0, 4),
      scripture: draft.introduction.scripture ? qualityText(draft.introduction.scripture) : undefined,
      scriptureText: draft.introduction.scriptureText ? qualityText(draft.introduction.scriptureText) : undefined,
      notes: qualityText(draft.introduction.notes ?? ""),
    },
    points: draft.points.map((point) => {
      const application = qualityText(point.application);
      const uniqueApplication = seenApplications.has(application) ? `${application} Bring it into one concrete place this week.` : application;
      seenApplications.add(application);
      return {
        ...point,
        title: qualityText(stripPreviewDirectionLabel(point.title), 6),
        summary: qualityText(point.summary),
        bullets: Array.from(new Set(point.bullets.map((bullet) => qualityText(bullet)).filter(Boolean))),
        explanation: qualityText(point.explanation),
        application: uniqueApplication,
        illustrationOptions: Array.from(new Set(point.illustrationOptions.map((option) => qualityText(option)).filter(Boolean))),
        transition: qualityText(point.transition),
        optionalResponseMoment: point.optionalResponseMoment ? qualityText(point.optionalResponseMoment) : undefined,
        scripture: qualityText(point.scripture),
        scriptureText: point.scriptureText ? qualityText(point.scriptureText) : getVerseText(point.scripture),
        notes: qualityText(point.notes ?? ""),
      };
    }),
    scriptureBank: Array.from(new Map(draft.scriptureBank.map((item) => [item.reference, { ...item, supportNote: "", fullContext: undefined }])).values()),
    closing: {
      recap: qualityText(draft.closing.recap),
      callToResponse: qualityText(draft.closing.callToResponse),
      closingApplication: qualityText(draft.closing.closingApplication),
      prayer: qualityText(draft.closing.prayer),
      bullets: Array.from(new Set((draft.closing.bullets ?? []).map((bullet) => qualityText(bullet)).filter(Boolean))).slice(0, 4),
      scripture: draft.closing.scripture ? qualityText(draft.closing.scripture) : undefined,
      scriptureText: draft.closing.scriptureText ? qualityText(draft.closing.scriptureText) : undefined,
      notes: qualityText(draft.closing.notes ?? ""),
    },
  };
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
      supportNote: "",
      fullContext: undefined,
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
  const resolvedIntroductionScripture = resolveScriptureText(introduction.scripture || mainScripture);
  if (!introduction.scripture || !introduction.scriptureText || introduction.scriptureText === MISSING_VERSE_TEXT) {
    introduction.scripture = resolvedIntroductionScripture.available ? resolvedIntroductionScripture.reference : undefined;
    introduction.scriptureText = resolvedIntroductionScripture.available ? resolvedIntroductionScripture.text : undefined;
  }
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
          illustrationOptions: point.illustrationOptions ?? (point.illustration ? [point.illustration] : fallback.illustrationOptions),
          transition: point.transition ?? fallback.transition,
          optionalResponseMoment: point.optionalResponseMoment ?? fallback.optionalResponseMoment,
          includeOptionalResponse: point.includeOptionalResponse ?? fallback.includeOptionalResponse,
          notes: point.notes ?? "",
          status: point.status,
        };
      })
    : generated;

  const draft: MessageDraft = {
    id: legacy.id ?? `local-${Date.now()}`,
    createdAt: legacy.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startingPath: legacy.startingPath ?? "explore",
    startingPathLabel: legacy.startingPathLabel ?? "Explore Message Ideas",
    messageMode: legacy.messageMode ?? "sunday",
    messageModeLabel: legacy.messageModeLabel ?? "Sunday Sermon",
    directionTitle,
    mainScripture,
    mainScriptureText: legacy.mainScriptureText && legacy.mainScriptureText !== MISSING_VERSE_TEXT ? legacy.mainScriptureText : resolveScriptureText(mainScripture).text,
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
    contextNotes: legacy.contextNotes?.length ? legacy.contextNotes : buildContextNotes(base),
    pastoralCareNote: legacy.pastoralCareNote ?? buildPastoralCareNote(base),
    scriptureBank: Array.from(new Map(scriptureBank.map((item) => [item.reference, { ...item, supportNote: "", fullContext: undefined }])).values()),
    introduction,
    points,
    closing,
  };

  return cleanMessageDraft(draft);
}
