import { sampleDirections, timelyConcernSamples, type SampleDirection, type TimelyConcern } from "./data";

const neutralTheme = "No theme selected";
const neutralTone = "No tone selected";

function rotateItems<T>(items: T[], offset: number, count: number) {
  const normalized = items.length ? offset % items.length : 0;
  return [...items.slice(normalized), ...items.slice(0, normalized)].slice(0, count);
}

function withPreviewLabel(direction: SampleDirection): SampleDirection {
  return direction;
}

export function getExploreDirections(theme: string, tone: string, offset: number): SampleDirection[] {
  const themed = theme === neutralTheme ? sampleDirections : sampleDirections.filter((direction) => {
    const haystack = `${direction.title} ${direction.scripture} ${direction.bigIdea} ${direction.angle} ${direction.focus}`.toLowerCase();
    return haystack.includes(theme.toLowerCase().replace(" stress", ""));
  });
  const pool = themed.length >= 5 ? themed : [...themed, ...sampleDirections.filter((item) => !themed.includes(item))];

  return rotateItems(pool, offset, 5).map((direction) => withPreviewLabel({
    ...direction,
    angle: `${theme !== neutralTheme ? `${theme} theme. ` : ""}${tone !== neutralTone ? `${tone} tone. ` : ""}${direction.angle}`,
  }));
}

const topicDirections: Record<string, SampleDirection[]> = {
  forgiveness: [
    { title: "Grace Received, Grace Extended", scripture: "Matthew 18:21-35", bigIdea: "Forgiven people learn to practice mercy with truth and wisdom.", angle: "A forgiveness direction that refuses bitterness without minimizing real wounds.", focus: "Mercy, boundaries, and obedient release." },
    { title: "Leaving the Debt with God", scripture: "Romans 12:17-21", bigIdea: "Trusting God's justice frees believers from personal revenge.", angle: "A practical path for wounded people who need to surrender retaliation to the Lord.", focus: "Trust, justice, and peaceable obedience." },
    { title: "The Cross-Shaped Way of Mercy", scripture: "Ephesians 4:31-32", bigIdea: "Christ's mercy becomes the pattern for how the church handles hurt.", angle: "A church-family message about confession, tenderness, and costly kindness.", focus: "Gospel-shaped relationships." },
    { title: "When Forgiveness Takes Time", scripture: "Colossians 3:12-15", bigIdea: "Forgiveness can be sincere while healing and trust are wisely rebuilt.", angle: "A careful direction for people sorting through repair, safety, and reconciliation.", focus: "Patience, wisdom, and peace." },
    { title: "Father, Forgive Them", scripture: "Luke 23:32-43", bigIdea: "Jesus shows mercy from the place of deepest injustice.", angle: "A Christ-centered call to behold mercy before attempting to extend it.", focus: "Worship, humility, and mercy." },
  ],
  grief: [
    { title: "When Tears Become Prayer", scripture: "Psalm 13", bigIdea: "God gives His people words when loss has taken their words away.", angle: "A lament-shaped message for honest sorrow before the Lord.", focus: "Lament, honesty, and durable hope." },
    { title: "Jesus at the Graveside", scripture: "John 11:32-44", bigIdea: "Christ meets grief with tears, presence, and resurrection hope.", angle: "A comforting direction for people carrying fresh or lingering loss.", focus: "Comfort and resurrection hope." },
    { title: "Near to the Brokenhearted", scripture: "Psalm 34:18", bigIdea: "The Lord does not stand far from crushed people.", angle: "A pastoral message about God's nearness in sorrow.", focus: "Presence and care." },
    { title: "Hope in the House of Mourning", scripture: "1 Thessalonians 4:13-18", bigIdea: "Christian hope grieves honestly without grieving hopelessly.", angle: "A resurrection-focused message for loss and remembrance.", focus: "Hope during loss." },
    { title: "Carrying One Another's Sorrows", scripture: "Galatians 6:2", bigIdea: "The church becomes a place where grief is shared, not hidden.", angle: "A community-care direction for walking with hurting people.", focus: "Compassion and shared burdens." },
  ],
};

topicDirections.restoration = [
  { title: "Failure Is Not the End", scripture: "John 21:15-19", bigIdea: "Jesus can confront real failure without discarding the person who failed.", angle: "A restoration direction that lets Christ name the wound honestly while moving the listener beyond shame.", focus: "Honest failure, gracious confrontation, and renewed hope." },
  { title: "Love Before Assignment", scripture: "John 21:15-19", bigIdea: "Restored service grows from renewed love for Christ, not from an attempt to outrun shame.", angle: "A heart-level message that slows down around Jesus' repeated question and Peter's restored relationship with Him.", focus: "Love for Christ, identity, and service after failure." },
  { title: "Grace Restores Responsibility", scripture: "John 21:15-19", bigIdea: "Jesus' grace gives Peter meaningful responsibility instead of leaving him defined by denial.", angle: "A calling-focused direction about how restoration often includes entrusting wounded people with faithful care for others.", focus: "Grace, responsibility, and caring for Christ's sheep." },
  { title: "Follow Me After Failure", scripture: "John 21:15-19", bigIdea: "The next faithful step after failure is still to follow Jesus.", angle: "A discipleship direction that moves from regret over the past toward obedience in the next step Christ gives.", focus: "Repentance, obedience, and faithful next steps." },
  { title: "From Shame to Shepherding", scripture: "John 21:15-19", bigIdea: "Christ can turn restored people outward in humble care for others.", angle: "A pastoral-care direction that traces how grace moves a person from collapsed shame into concrete love for people.", focus: "Restoration, humility, and serving others with care." },
];

topicDirections.faith = [
  { title: "Trust When Sight Is Limited", scripture: "Hebrews 11:1-6", bigIdea: "Faith receives God's promise before every outcome is visible.", angle: "A direction for people who need to trust without pretending uncertainty is easy.", focus: "Trust, promise, and patient obedience." },
  { title: "Faith That Keeps Walking", scripture: "2 Corinthians 5:7", bigIdea: "God calls His people to walk by faith when the next step is clearer than the full road.", angle: "A practical discipleship direction about obedience in ordinary decisions.", focus: "Daily obedience and spiritual steadiness." },
  { title: "Bring Your Unbelief", scripture: "Mark 9:14-29", bigIdea: "Jesus meets honest weakness with mercy and help.", angle: "A compassionate direction for people who feel ashamed that their faith is not stronger.", focus: "Honesty, prayer, and dependence." },
  { title: "Faith Working Through Love", scripture: "Galatians 5:6", bigIdea: "Living faith becomes visible through love-shaped obedience.", angle: "A church-life direction that connects belief to tangible care for others.", focus: "Love, obedience, and visible discipleship." },
  { title: "Rooted in Christ", scripture: "Colossians 2:6-7", bigIdea: "Faith matures as believers keep receiving and walking in Christ.", angle: "A formation direction about rootedness, gratitude, and steady growth.", focus: "Maturity, gratitude, and endurance." },
];

const topicAliases: Record<string, string[]> = {
  restoration: ["restore", "restores", "restored", "restoring", "restoration", "failure", "failed", "failing", "denial", "shame", "next step"],
  forgiveness: ["forgive", "forgiveness", "forgiven", "mercy", "resentment", "bitterness"],
  grief: ["grief", "grieve", "loss", "mourning", "sorrow", "funeral"],
  faith: ["faith", "belief", "believe", "trusting god"],
};

export function detectDevelopTopic(input: string) {
  const lower = input.toLowerCase();
  return Object.entries(topicAliases).find(([, terms]) => terms.some((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i").test(lower);
  }))?.[0];
}

function genericDevelopDirections(entered: string, passage: string, response: string): SampleDirection[] {
  const refs = ["Isaiah 40:29-31", "Matthew 11:28", "Psalm 46:1", "2 Corinthians 4:16-18", "Galatians 6:9"];
  const subject = entered.trim() || "the message burden you entered";
  const desired = response.trim();
  return [
    {
      title: titleFromSubject(subject, "God's Strength for Weary People"),
      scripture: passage.trim() || refs[0],
      bigIdea: `God meets weary people with strength that human effort cannot manufacture.`,
      angle: `A pastoral direction that names weariness honestly and moves the church toward God's renewing power.`,
      focus: desired || "Weariness, human limits, and renewed trust in the Lord.",
    },
    {
      title: titleFromSubject(subject, "Waiting Without Giving Up"),
      scripture: passage.trim() || refs[1],
      bigIdea: `Waiting on the Lord is active trust when visible strength has run out.`,
      angle: `This direction helps listeners move from self-reliance to patient dependence on God's timing and care.`,
      focus: desired || "Endurance, prayerful waiting, and faithful next steps.",
    },
    {
      title: titleFromSubject(subject, "When God Renews What Life Has Drained"),
      scripture: passage.trim() || refs[2],
      bigIdea: `The Lord can renew what prolonged pressure has drained from the heart.`,
      angle: `A hope-filled direction for people who are not merely tired for a day but worn down by a long season.`,
      focus: desired || "Renewal, hope during pressure, and courage to keep walking.",
    },
    {
      title: titleFromSubject(subject, "Strength Beyond Your Own"),
      scripture: passage.trim() || refs[3],
      bigIdea: `God's people do not have to pretend they are strong; they can receive strength from Him.`,
      angle: `This message contrasts human limitation with the sufficiency of God's sustaining grace.`,
      focus: desired || "Honest weakness, grace, and dependence on the Lord.",
    },
    {
      title: titleFromSubject(subject, "Rising with Enduring Hope"),
      scripture: passage.trim() || refs[4],
      bigIdea: `Hope rises when the church learns to carry present burdens in the strength God supplies.`,
      angle: `A concluding direction that moves from fatigue toward resilient obedience and worship.`,
      focus: desired || "Hope, resilience, and obedient perseverance.",
    },
  ];
}

function titleFromSubject(subject: string, fallback: string) {
  const normalized = subject.replace(/[.!?]+$/g, "").trim();
  if (!normalized) return fallback;
  const lower = normalized.toLowerCase();
  if (lower.includes("strength") || lower.includes("heavy") || lower.includes("weary") || lower.includes("tired")) return fallback;
  return fallback.replace(/Weary People|Life Has Drained|Your Own|Enduring Hope|Giving Up/g, normalized);
}

export function getDevelopDirections(idea: string, passage: string, response: string): SampleDirection[] {
  const entered = idea.trim() || "your entered subject";
  const topic = detectDevelopTopic(idea) ?? detectDevelopTopic(response);
  const base = topic ? topicDirections[topic] : genericDevelopDirections(entered, passage, response);

  return base.map((direction) => withPreviewLabel({
    ...direction,
    scripture: passage.trim() || direction.scripture,
    focus: response.trim() && topic ? `${direction.focus} Desired response: ${response.trim()}` : direction.focus,
  }));
}

export function getVisibleConcerns(offset: number): TimelyConcern[] {
  return rotateItems(timelyConcernSamples, offset, 5);
}

export function getWeeklyConcernDirections(concern: TimelyConcern | null): SampleDirection[] {
  const category = concern?.category ?? "Timely concern";
  const refs = concern?.suggestedRefs.split(";").map((ref) => ref.trim()) ?? ["Psalm 46", "Romans 15:13", "1 Peter 5:6-7"];
  return [
    { title: `${category}: A Faithful First Response`, scripture: refs[0] ?? "Psalm 46", bigIdea: concern?.pastoralTheme ?? "God meets His people in the concerns they carry.", angle: concern?.possibleDirection ?? "A pastoral direction for naming the concern before God.", focus: "Prayerful trust and pastoral clarity." },
    { title: `${category}: Naming What Hurts`, scripture: refs[1] ?? refs[0] ?? "Psalm 13", bigIdea: "The church can tell the truth about pain while remaining anchored in God.", angle: `A message direction connected to ${category.toLowerCase()} that gives language for lament, care, and hope.`, focus: "Lament, honesty, and comfort." },
    { title: `${category}: Practicing Hope Together`, scripture: refs[2] ?? refs[0] ?? "Romans 15:13", bigIdea: "Hope grows stronger when God's people carry burdens together.", angle: `A community-care message shaped by the selected concern: ${concern?.context ?? category}.`, focus: "Community care and shared courage." },
    { title: `${category}: Courage for the Next Faithful Step`, scripture: refs[0] ?? "Joshua 1:9", bigIdea: "God often leads His people through the next obedient step, not the whole map.", angle: `A practical message for faithful action amid ${category.toLowerCase()}.`, focus: "Courage, wisdom, and obedience." },
    { title: `${category}: Peace That Can Be Practiced`, scripture: refs[1] ?? "Philippians 4:4-9", bigIdea: "The peace of God forms habits of prayer, care, and steady witness.", angle: `A pastoral focus that visibly matches ${category.toLowerCase()} rather than a generic direction list.`, focus: "Peace, prayer, and faithful presence." },
  ].map(withPreviewLabel);
}
