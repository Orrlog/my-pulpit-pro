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
  anxiety: ["Psalm 46:1", "Isaiah 26:3", "Matthew 6:33", "John 14:27", "1 Peter 5:7", "Romans 12:2", "Philippians 4:6", "2 Timothy 1:7", "Psalm 23:4", "James 1:5"],
  courage: ["Joshua 1:9", "Psalm 27:1", "Isaiah 41:10", "2 Timothy 1:7", "Acts 4:29", "Hebrews 12:1", "1 Corinthians 16:13", "Ephesians 6:10", "Romans 15:13", "James 1:5"],
  faithfulness: ["Galatians 6:9", "1 Corinthians 15:58", "Colossians 3:23", "Psalm 126:5", "Matthew 25:21", "2 Thessalonians 3:13", "Hebrews 10:24", "James 1:22", "John 15:5", "Micah 6:8"],
  hope: ["Romans 15:13", "Psalm 42:11", "1 Peter 1:3", "Isaiah 40:31", "Lamentations 3:22", "Hebrews 6:19", "Romans 5:3", "2 Corinthians 4:17", "John 14:27", "Revelation 21:4"],
  default: ["Psalm 46:1", "Proverbs 3:5", "Matthew 11:28", "John 15:5", "Romans 12:2", "Romans 15:13", "Galatians 6:9", "Philippians 4:6", "Colossians 3:17", "Hebrews 12:2", "James 1:22", "1 Peter 5:7"],
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

function cleanSentence(value: string) {
  return value
    .replace(/^Preview sample:\s*/i, "")
    .replace(/selected direction/gi, "message")
    .replace(/pastoral focus/gi, "main concern")
    .replace(/\bgod\b/g, "God")
    .replace(/\s+/g, " ")
    .replace(/\.\.+/g, ".")
    .trim();
}

function bookOf(reference: string) {
  return reference.replace(/^\d\s+/, "").split(/\s+/)[0];
}

function topicFrom(input: { directionTitle: string; bigIdea: string; pastoralFocus: string; angle: string; mainScripture: string }) {
  const haystack = `${input.directionTitle} ${input.bigIdea} ${input.pastoralFocus} ${input.angle} ${input.mainScripture}`.toLowerCase();
  return Object.keys(scripturePools).find((key) => key !== "default" && haystack.includes(key)) ?? "default";
}

function movementSeedsFor(input: { mainScripture: string; directionTitle: string; bigIdea: string; pastoralFocus: string; angle: string }) {
  const passage = input.mainScripture.toLowerCase();
  if (passage.includes("philippians 4")) return philippiansFourSeeds;
  if (passage.includes("galatians 6")) return galatiansSixSeeds;
  return defaultSeeds;
}

export function getVerseText(reference: string) {
  return kjvLookup[reference.trim()] ?? MISSING_VERSE_TEXT;
}

function supportNoteFor(reference: string, input: { directionTitle: string; bigIdea: string }) {
  const noteByRef: Record<string, string> = {
    "Isaiah 26:3": "Shows the link between a stayed mind and God's keeping peace.",
    "John 14:27": "Strengthens the message with Jesus' promise of peace that is different from the world's peace.",
    "1 Peter 5:7": "Gives anxious people a plain invitation to cast care on the Lord.",
    "Romans 12:2": "Connects the sermon to renewed thinking and practiced discernment.",
    "Galatians 6:9": "Names weariness directly and promises that faithful sowing is not forgotten.",
    "1 Corinthians 15:58": "Reminds the church that labor in the Lord is not vain.",
    "Colossians 3:23": "Frames hidden work as service offered to the Lord.",
    "Psalm 126:5": "Adds the image of sowing with tears and reaping with joy.",
    "Matthew 25:21": "Highlights faithfulness in small things before visible reward.",
  };
  return noteByRef[reference] ?? `Supports ${input.directionTitle} by giving another biblical angle on ${cleanSentence(input.bigIdea).toLowerCase()}.`;
}

function fullContextFor(reference: string, mainScripture: string) {
  const contexts: Record<string, string> = {
    "Philippians 4:6": "See the full context: Philippians 4:4-9.",
    "Philippians 4:7": "See the full context: Philippians 4:4-9.",
    "Philippians 4:8": "See the full context: Philippians 4:4-9.",
    "Galatians 6:9": "See the full context: Galatians 6:7-10.",
    "Galatians 6:10": "See the full context: Galatians 6:7-10.",
  };
  return contexts[reference] ?? (mainScripture.includes(":") ? `Main passage context: ${mainScripture}.` : undefined);
}

function makeScriptureItem(reference: string, index: number, input?: { directionTitle: string; bigIdea: string; mainScripture: string }): ScriptureBankItem {
  return {
    id: `scripture-${Date.now()}-${index}`,
    reference,
    text: getVerseText(reference),
    supportNote: input ? supportNoteFor(reference, input) : "Explain how this reference supports the main passage.",
    fullContext: input ? fullContextFor(reference, input.mainScripture) : undefined,
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
  const pool = [...scripturePools[topicFrom(input)], ...scripturePools.default];
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
  return chooseReferences(input).map((reference, index) => makeScriptureItem(reference, index, input));
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

export function buildIntroduction(input: {
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  angle: string;
  pastoralFocus: string;
}): MessageDraftIntroduction {
  const angle = cleanSentence(input.angle);
  return {
    hook: `${input.directionTitle} starts where people feel the pressure of ordinary life and need a steady word from Scripture.`,
    pastoralTension: `${angle} The sermon should name that pressure honestly and then let the passage answer it with grace and truth.`,
    passageConnection: `${input.mainScripture} gives the sermon its path. Let the main text lead before any supporting passage speaks.`,
    bigIdeaBridge: cleanSentence(input.bigIdea),
    firstMovementTransition: "From that tension, move into the first truth the passage puts in front of us.",
    bullets: [
      `${input.directionTitle} touches a place people already recognize from the week they just lived.`,
      `${input.mainScripture} does not rush past the pressure. It gives the church a faithful way to see it.`,
      cleanSentence(input.bigIdea),
    ],
    scripture: undefined,
    scriptureText: undefined,
    notes: "",
  };
}

export function buildClosing(input: {
  directionTitle: string;
  mainScripture: string;
  bigIdea: string;
  pastoralFocus: string;
}): MessageDraftClosing {
  return {
    recap: `Return to ${input.mainScripture} and gather the sermon around this truth: ${cleanSentence(input.bigIdea)}`,
    callToResponse: "Take one honest next step that fits the Word you have heard today.",
    closingApplication: "Carry this passage into one ordinary place this week: a conversation, a worry, a decision, a habit, or a quiet act of obedience.",
    prayer: "Ask the Lord to let His Word take root, give courage to obey, and keep the church steady in His faithful care.",
    bullets: [
      `${input.mainScripture} gives the final word, not fear, hurry, or pressure.`,
      cleanSentence(input.bigIdea),
      "A faithful response can begin in one ordinary place before the week is over.",
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

function illustrationOptions(seed: MovementSeed, topic: string) {
  if (topic === "anxiety") {
    return ["Lying awake while every possible outcome keeps replaying.", "Checking a phone, account, medical portal, or test result because bad news feels close.", "Carrying a worry into prayer and mentally picking it back up before saying amen."];
  }
  if (topic === "grief") {
    return ["An empty chair at the table that makes loss feel fresh again.", "A person doing ordinary errands while grief comes in waves.", "A church member who needs presence more than quick explanations."];
  }
  return seed.illustrationOptions;
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
  const topic = topicFrom(input);

  return Array.from({ length: count }, (_, index) => {
    const seed = seeds[index % seeds.length];
    const scripture = bank[index % bank.length] ?? makeScriptureItem(input.mainScripture, index, input);
    return {
      id: `movement-${Date.now()}-${index + 1}`,
      title: qualityText(seed.title, 6),
      summary: qualityText(seed.summary),
      scripture: scripture.reference,
      scriptureText: scripture.text,
      bullets: Array.from(new Set(seed.bullets.map((bullet) => qualityText(bullet)))).slice(0, 3),
      explanation: qualityText(seed.explanation),
      application: qualityText(seed.application),
      illustrationOptions: illustrationOptions(seed, topic).map((option) => qualityText(option)),
      transition: qualityText(seed.transition),
      optionalResponseMoment: index === 2 ? "Optional response moment: pause and let people silently name the burden they need to bring to God." : undefined,
      includeOptionalResponse: false,
      notes: "",
    };
  });
}

export function cleanMessageDraft(draft: MessageDraft): MessageDraft {
  const seenApplications = new Set<string>();
  return {
    ...draft,
    title: qualityText(draft.title, 8),
    contextNotes: Array.from(new Set(draft.contextNotes.map((note) => qualityText(note)).filter(Boolean))),
    introduction: {
      hook: qualityText(draft.introduction.hook),
      pastoralTension: qualityText(draft.introduction.pastoralTension),
      passageConnection: qualityText(draft.introduction.passageConnection),
      bigIdeaBridge: qualityText(draft.introduction.bigIdeaBridge),
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
        title: qualityText(point.title, 6),
        summary: qualityText(point.summary),
        bullets: Array.from(new Set(point.bullets.map((bullet) => qualityText(bullet)).filter(Boolean))),
        explanation: qualityText(point.explanation),
        application: uniqueApplication,
        illustrationOptions: Array.from(new Set(point.illustrationOptions.map((option) => qualityText(option)).filter(Boolean))),
        transition: qualityText(point.transition),
        optionalResponseMoment: point.optionalResponseMoment ? qualityText(point.optionalResponseMoment) : undefined,
        notes: qualityText(point.notes ?? ""),
      };
    }),
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
      supportNote: item.supportNote ?? supportNoteFor(reference, base),
      fullContext: item.fullContext ?? fullContextFor(reference, base.mainScripture),
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
    contextNotes: legacy.contextNotes?.length ? legacy.contextNotes : buildContextNotes(base),
    pastoralCareNote: legacy.pastoralCareNote ?? buildPastoralCareNote(base),
    scriptureBank,
    introduction,
    points,
    closing,
  };

  return cleanMessageDraft(draft);
}
