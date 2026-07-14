export type StartPathId = "explore" | "develop" | "week";

export type StartPath = {
  id: StartPathId;
  label: string;
  icon: string;
  description: string;
};

export type MessageMode = {
  id: "sunday" | "special" | "youth" | "bible-study";
  label: string;
  description: string;
  locked: boolean;
  badge?: string;
};

export type SampleDirection = {
  title: string;
  scripture: string;
  bigIdea: string;
  angle: string;
  focus: string;
};

export type TimelyConcern = {
  category: string;
  context: string;
  pastoralTheme: string;
  possibleDirection: string;
  suggestedRefs: string;
};

export const startPaths: StartPath[] = [
  {
    id: "explore",
    label: "Explore Message Ideas",
    icon: "I",
    description:
      "Discover fresh sermon directions, themes, passages, and angles when you are starting with a blank page.",
  },
  {
    id: "develop",
    label: "Develop My Message",
    icon: "D",
    description:
      "Build around an idea already tugging at your heart, a topic, a concern, or a Scripture passage.",
  },
  {
    id: "week",
    label: "Speak to This Week",
    icon: "W",
    description:
      "Shape a Scripture-centered message around the questions, burdens, fears, hopes, and pressures people are carrying right now.",
  },
];

export const sampleProjects = [
  {
    title: "When the Wind Keeps You Waiting",
    passage: "Ecclesiastes 11:1-6",
    length: "45 minutes",
    edited: "Edited today",
    status: "Ready to Print",
  },
  {
    title: "Faith When the Answer Has Not Come",
    passage: "Psalm 13",
    length: "30 minutes",
    edited: "Edited yesterday",
    status: "Draft",
  },
  {
    title: "The Courage to Take the Next Step",
    passage: "Joshua 1:1-9",
    length: "60 minutes",
    edited: "Edited 3 days ago",
    status: "Draft",
  },
];

export const messageModes: MessageMode[] = [
  {
    id: "sunday",
    label: "Sunday Sermon",
    description: "A regular congregational message for weekly preaching.",
    locked: false,
  },
  {
    id: "special",
    label: "Special Service",
    description: "A focused message for a special gathering, emphasis, or service.",
    locked: false,
  },
  {
    id: "youth",
    label: "Youth Message",
    badge: "Ministry Plus",
    description:
      "Age-aware lessons, memory verses, discussion prompts, and printable activities designed specifically for youth ministry.",
    locked: true,
  },
  {
    id: "bible-study",
    label: "Bible Study",
    badge: "Ministry Plus",
    description:
      "Passage context, observation questions, discussion prompts, application, and a leader-focused guide.",
    locked: true,
  },
];

export const messageLengths = [
  {
    value: "30",
    label: "30 minutes",
    description: "Usually 3 main points with focused application and a concise closing.",
  },
  {
    value: "45",
    label: "45 minutes",
    description:
      "Usually 3 to 4 main points with supporting Scripture, stronger development, and fuller application.",
  },
  {
    value: "60",
    label: "60 minutes",
    description:
      "Usually 4 to 6 main points with deeper Scripture support, subpoints, reflection, and expanded application.",
  },
];

export const translations = [
  "King James Version, KJV",
  "New King James Version, NKJV",
  "New International Version, NIV",
  "New Living Translation, NLT",
];

export const themes = [
  "No theme selected",
  "Hope",
  "Fear",
  "Grief",
  "Forgiveness",
  "Courage",
  "Family stress",
  "Faithfulness",
  "Anxiety",
  "Uncertainty",
  "Renewal",
  "Prayer",
  "Perseverance",
  "Relationships",
  "Purpose",
];

export const tones = [
  "No tone selected",
  "Encouraging",
  "Reflective",
  "Challenging",
  "Comforting",
  "Hopeful",
  "Practical",
];

export const sampleDirections: SampleDirection[] = [
  {
    title: "When the Wind Keeps You Waiting",
    scripture: "Ecclesiastes 11:1-6",
    bigIdea: "Faithful people do not wait for perfect conditions before they obey God.",
    angle: "A message about moving forward with wisdom when uncertainty keeps people frozen.",
    focus: "Practical courage for delayed obedience.",
  },
  {
    title: "Hope When the Answer Has Not Come",
    scripture: "Psalm 13",
    bigIdea: "Lament can become a faithful bridge between honest pain and steady trust.",
    angle:
      "A message for people carrying unanswered prayers, grief, and questions they rarely say aloud.",
    focus: "Comfort for weary faith.",
  },
  {
    title: "The Courage to Take the Next Step",
    scripture: "Joshua 1:1-9",
    bigIdea: "God's presence gives courage for the next faithful step.",
    angle: "A message about obedience when people are standing at the edge of change.",
    focus: "Confidence rooted in God's presence.",
  },
  {
    title: "Faithfulness in the Middle",
    scripture: "Galatians 6:9",
    bigIdea: "The unseen season still matters to God.",
    angle: "A message for people tired of doing right without seeing immediate results.",
    focus: "Endurance and renewed resolve.",
  },
  {
    title: "Peace for a Divided Heart",
    scripture: "Philippians 4:4-9",
    bigIdea: "The peace of God guards what anxiety tries to occupy.",
    angle: "A message that gives practical spiritual shape to prayer, thought, and trust.",
    focus: "Calm, practice, and renewed attention.",
  },
  {
    title: "The God Who Meets Us in the Wilderness",
    scripture: "Exodus 16:1-18",
    bigIdea: "God provides enough grace for today's obedience.",
    angle: "A message for people who feel depleted, displaced, or unsure of the next step.",
    focus: "Daily dependence and trust.",
  },
  {
    title: "A Table in the Valley",
    scripture: "Psalm 23",
    bigIdea: "God's care is present even when the path runs through shadow.",
    angle: "A message of steady comfort for people navigating grief or fear.",
    focus: "Shepherding, presence, and assurance.",
  },
  {
    title: "Forgiven People Learn to Forgive",
    scripture: "Matthew 18:21-35",
    bigIdea: "Grace received becomes grace extended.",
    angle: "A message that handles forgiveness with honesty, boundaries, and gospel clarity.",
    focus: "Mercy, repair, and obedience.",
  },
  {
    title: "Built on the Rock",
    scripture: "Matthew 7:24-27",
    bigIdea: "A life that hears and obeys Christ can stand when pressure comes.",
    angle: "A practical message about spiritual foundations under real-life stress.",
    focus: "Obedience that holds.",
  },
  {
    title: "The Gift of a Steady Spirit",
    scripture: "2 Timothy 1:6-7",
    bigIdea: "God does not leave His people ruled by fear.",
    angle: "A message about courage, love, and self-control in anxious moments.",
    focus: "Renewed courage for faithful service.",
  },
  {
    title: "Remembering What God Has Done",
    scripture: "Joshua 4:1-9",
    bigIdea: "Remembered grace strengthens present obedience.",
    angle: "A message about spiritual memory, testimony, and renewed confidence.",
    focus: "Gratitude and witness.",
  },
  {
    title: "Learning to Pray When Words Are Thin",
    scripture: "Romans 8:26-28",
    bigIdea: "God meets His people even in weakness and wordless prayer.",
    angle: "A message for people who feel spiritually tired but still want to seek God.",
    focus: "Prayer, weakness, and hope.",
  },
  {
    title: "The Narrow Way of Faithfulness",
    scripture: "Micah 6:8",
    bigIdea: "God calls His people to humble, steady faithfulness.",
    angle: "A message about justice, mercy, humility, and ordinary obedience.",
    focus: "Plain obedience in complicated times.",
  },
  {
    title: "When Love Has to Be Patient",
    scripture: "1 Corinthians 13:4-7",
    bigIdea: "Biblical love grows visible through patient, costly faithfulness.",
    angle: "A message for families, friendships, and churches under strain.",
    focus: "Relational endurance shaped by Christ.",
  },
];

export const timelyConcernSamples: TimelyConcern[] = [
  {
    category: "Community Tragedy",
    context: "A community is carrying shock, grief, and questions after painful loss.",
    pastoralTheme: "God meets His people in grief and calls the church to tender care.",
    possibleDirection: "Give language for lament, comfort, community care, and hope during loss.",
    suggestedRefs: "Psalm 34:18; John 11:33-36; Romans 12:15",
  },
  {
    category: "War and International Instability",
    context: "Global conflict and uncertainty are stirring fear, anger, and helplessness.",
    pastoralTheme: "The Lord forms His people in peace, prayer, courage, and faithful witness.",
    possibleDirection: "Lead the church toward prayerful trust and courage during uncertainty.",
    suggestedRefs: "Psalm 46; Matthew 5:9; Philippians 4:4-9",
  },
  {
    category: "Economic Pressure",
    context: "Families are feeling strain from bills, work pressure, and uncertain provision.",
    pastoralTheme: "God teaches trust, contentment, generosity, and family care during hardship.",
    possibleDirection: "Speak to provision, contentment, generosity, family strain, and trust during hardship.",
    suggestedRefs: "Matthew 6:25-34; Philippians 4:10-13; 2 Corinthians 9:6-8",
  },
  {
    category: "Fear",
    context: "People feel unsettled by what they cannot control.",
    pastoralTheme: "God's presence steadies His people.",
    possibleDirection: "Invite the church to practice faithful trust instead of anxious control.",
    suggestedRefs: "Psalm 46; Isaiah 41:10; 2 Timothy 1:7",
  },
  {
    category: "Grief",
    context: "Some are carrying losses that do not fit neatly into Sunday small talk.",
    pastoralTheme: "The Lord is near to the brokenhearted.",
    possibleDirection: "Give language for lament while pointing toward durable hope.",
    suggestedRefs: "Psalm 34:18; John 11:33-36; Revelation 21:1-5",
  },
  {
    category: "Hope",
    context: "People need more than optimism when life feels heavy.",
    pastoralTheme: "Christian hope is anchored in God's character and promises.",
    possibleDirection: "Show how hope can endure without denying present pain.",
    suggestedRefs: "Romans 5:1-5; Hebrews 6:17-20; 1 Peter 1:3-9",
  },
  {
    category: "Anxiety",
    context: "Many are mentally crowded, distracted, and tired.",
    pastoralTheme: "Prayer and trust reorient the heart before God.",
    possibleDirection: "Teach a practical way to bring anxious thoughts into God's care.",
    suggestedRefs: "Philippians 4:4-9; Matthew 6:25-34; 1 Peter 5:6-7",
  },
  {
    category: "Family Stress",
    context: "Homes are carrying pressure from schedules, conflict, finances, and fatigue.",
    pastoralTheme: "Christlike patience and humility reshape relationships.",
    possibleDirection: "Call families toward gentleness, confession, forgiveness, and wise rhythms.",
    suggestedRefs: "Colossians 3:12-17; James 1:19-20; Ephesians 4:25-32",
  },
  {
    category: "Division",
    context: "People are weary of suspicion, argument, and relational distance.",
    pastoralTheme: "The peace of Christ forms a different kind of people.",
    possibleDirection: "Lead the church toward humility, truth, and costly unity.",
    suggestedRefs: "Ephesians 4:1-6; John 17:20-23; Romans 12:9-18",
  },
  {
    category: "Forgiveness",
    context: "Some are stuck between real wounds and the call to mercy.",
    pastoralTheme: "Forgiveness is rooted in God's grace and practiced with wisdom.",
    possibleDirection: "Handle forgiveness carefully without minimizing harm or bypassing truth.",
    suggestedRefs: "Matthew 18:21-35; Colossians 3:13; Luke 23:34",
  },
  {
    category: "Uncertainty",
    context: "Decisions feel unclear and the future feels hard to read.",
    pastoralTheme: "God guides His people one faithful step at a time.",
    possibleDirection: "Help listeners obey with wisdom when they cannot see the whole road.",
    suggestedRefs: "Proverbs 3:5-6; James 1:5; Psalm 119:105",
  },
  {
    category: "Faithfulness",
    context: "People are tired of doing right when progress feels slow.",
    pastoralTheme: "God sees the hidden places of obedience.",
    possibleDirection: "Encourage steady service, patient sowing, and hope in God's timing.",
    suggestedRefs: "Galatians 6:9; 1 Corinthians 15:58; Hebrews 12:1-3",
  },
  {
    category: "Weariness",
    context: "Many are functioning, but inwardly depleted.",
    pastoralTheme: "Christ invites the burdened to receive rest.",
    possibleDirection: "Contrast exhaustion from self-reliance with rest in Christ's care.",
    suggestedRefs: "Matthew 11:28-30; Isaiah 40:28-31; Mark 6:30-32",
  },
  {
    category: "Purpose",
    context: "Some wonder whether ordinary work and unseen service matter.",
    pastoralTheme: "God gives meaning to faithful obedience in ordinary places.",
    possibleDirection: "Connect daily calling, love of neighbor, and worshipful service.",
    suggestedRefs: "Colossians 3:17; Ephesians 2:10; 1 Corinthians 10:31",
  },
  {
    category: "Doubt",
    context: "Questions often sit beneath the surface of faithful attendance.",
    pastoralTheme: "God can meet honest questions with mercy and truth.",
    possibleDirection: "Make room for honest wrestling while pointing people toward Christ.",
    suggestedRefs: "Mark 9:24; John 20:24-29; Jude 22",
  },
];
