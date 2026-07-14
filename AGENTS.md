# AGENTS.md

## What My Pulpit Pro Is

My Pulpit Pro is a text-first sermon preparation and sermon-shaping app for pastors, preachers, youth ministers, Bible study leaders, bivocational pastors, and small-church ministry leaders.

It helps ministry leaders save preparation time, explore fresh message directions, develop an existing topic or Bible passage, shape stronger sermon points, organize Scripture and applications, edit the message in their own voice, print polished pulpit notes, and save and revisit past messages.

My Pulpit Pro must never be positioned as "AI writes sermons for pastors."

Preferred boundary language:

- Built to support sermon preparation, not replace the pastor.
- You bring the calling, conviction, and voice. My Pulpit Pro helps shape the message.

## Target Users

- Senior pastors preparing weekly sermons
- Associate pastors and preachers
- Youth ministers
- Bible study leaders
- Bivocational pastors
- Small-church ministry leaders with limited preparation time

## Product Positioning

My Pulpit Pro is a focused sermon workflow, not a generic blank chat box. The product should feel like a dedicated preparation desk for sermon direction, sermon points, Scripture organization, editing, printing, and message history.

Do not frame the product as replacing sermon study, pastoral care, prayer, calling, conviction, theological discernment, or the preacher's own voice.

## Brand Tone

- Warm, steady, pastoral, and practical
- Confident without hype
- Respectful of Scripture, ministry responsibility, and church leadership
- Clear about limits
- Never manipulative, mystical, or exaggerated

Avoid:

- Fake spiritual claims
- Fabricated ministry outcomes
- Overpromising what AI can do
- Loud technology language
- Cheesy religious clipart or visual cliches

## Visual System

The current Phase 1 visual direction is warm, editorial, restrained, and ministry-focused.

Design tokens:

- Ivory background: `#F7F0E3`
- Light cream: `#FFF9EE`
- Deep teal: `#003D3F`
- Darker teal: `#002F31`
- Muted gold: `#C99532`
- Dark text: `#1E2926`
- Muted text: `#66716D`
- Border: `#E4D8C4`

Typography:

- Fraunces for large headings through `next/font/google`
- Source Sans 3 for clean, readable body copy

Use deep teal in navigation accents, primary buttons, feature icons, section backgrounds, pricing highlights, final CTA, and footer details.

Avoid:

- Glowing crosses
- Cartoon churches
- Generic AI robot imagery
- Fake pastor photographs
- Excessive gradients
- Loud SaaS styling that distracts from the ministry context

## Current Pricing Decisions

### Solo

- `$39 per month`
- One named user
- Eight created message projects per billing month
- Unlimited message-idea browsing
- Three sermon starting paths
- 30, 45, and 60-minute options
- Editable sermon point cards
- Scripture-centered outlines
- Preferred Bible translation
- Printable pulpit notes
- Saved sermon history
- Unlimited editing inside created projects
- Seven-day free trial
- Credit card required

Usage rule: browsing ideas does not use a message project. A project only counts after the user deliberately chooses an idea and creates the full message.

### Ministry Plus

- `$49 per month`
- Coming Soon
- Two named ministry seats
- Sixteen shared message projects per billing month
- Everything in Solo
- Separate login for each user
- Private saved history for each user
- Youth message mode
- Bible study mode
- Lesson-based Bible word searches
- Lesson-based hidden-message word scrambles
- Printable youth activity sheets
- Shared monthly project allowance

Future hidden-message word scrambles should use 8 to 12 lesson-related scrambled words, highlight one letter from every solved word, use the highlighted letters to reveal an 8-to-12-letter hidden message ignoring spaces, optionally include a separate final phrase scramble, and include a leader answer key.

## MVP Boundaries

Phase 1 includes only the public landing page, project foundation, design system, and `/signup` placeholder.

Do not add in this phase:

- Supabase
- Stripe
- OpenAI API calls
- Paid billing
- Authentication
- Bible API integrations
- Sermon generation
- Authenticated dashboard
- Real customer testimonials
- Customer statistics

## Features Planned For Later

- Guided sermon project creation
- Explore Message Ideas
- Develop My Message
- Speak to This Week
- 30, 45, and 60-minute message options
- Editable sermon point cards
- Bible translation preference
- Printable pulpit notes
- Saved sermon history
- Scripture and Theology Review
- Youth message mode
- Bible study mode
- Lesson-based word searches
- Lesson-based hidden-message word scrambles
- Printable youth activity sheets

## Future Youth Message Mode

Youth Message mode must be a distinct Ministry Plus workflow, not a normal adult sermon outline with the audience label swapped.

Planned inputs:

- Age group: Preteen, Middle school, High school, or Mixed youth group
- Approximate lesson length
- Topic, passage, or blank-page exploration
- Desired tone
- Optional printable activity choice

Planned output should include age-appropriate lesson points, concrete language, relatable situations around school, friendships, family, peer pressure, identity, choices, doubt, and social life, a memory verse reference, 2 to 3 discussion questions, a short closing challenge, optional word search, optional hidden-message word scramble, and a leader answer key.

Avoid forced slang, fake teen speech, manipulative spiritual claims, or pretending the app knows a youth group's exact context.

## Future Bible Study Mode

Bible Study mode must be a distinct Ministry Plus workflow, not the normal sermon outline reused with a different label.

Planned output should include:

- Main passage
- Background and context
- Observation questions
- Interpretation prompts
- Discussion questions
- Personal application
- Leader notes
- Closing prayer or reflection

Bible Study mode must keep the leader in control and should not claim to replace study, prayer, teaching judgment, theological discernment, or proper Scripture-context review.

## Development Rules

- Use Next.js App Router, TypeScript, and Tailwind CSS.
- Keep components clean, reusable, and accessible.
- Use semantic HTML.
- Maintain responsive layouts for desktop, tablet, and mobile.
- Avoid horizontal scrolling.
- Add visible keyboard focus states.
- Respect reduced-motion preferences.
- Do not add unnecessary dependencies.
- Do not import or copy code from Lovable or other inspiration pages.
- Keep TODO comments limited to clear backend integration points.
- Do not expose API keys or secrets in frontend code.
- Keep `.env.example` aligned with documented environment variables.

## Pastoral And Theological Guardrails

The pastor must remain in control.

The app supports sermon preparation and does not replace:

- Scripture study
- Prayer
- Pastoral judgment
- Conviction
- Calling
- Personality
- Voice
- Theological discernment
- Knowledge of the local congregation

Never make fake spiritual claims.

Never invent customer statistics or testimonials.

Never present AI-generated Bible quotations as exact Scripture text.

When exact Scripture text appears in the product, it must come from a properly licensed or public-domain source and must respect all license requirements.

Scripture and Theology Review must be described as a future review aid that flags possible concerns. It must not claim to universally determine correct theology or replace pastoral judgment.
