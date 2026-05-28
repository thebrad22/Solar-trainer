import { useState, useRef, useEffect } from "react";

const MARKET_DATA = {
  utilities: [
    { name: "National Grid", territory: "Buffalo, Albany, Syracuse, Capital District", rateIncrease: "28% over 3 years (approved Aug 2025), +7.3% delivery Apr 2026", rate: "~$0.20–0.24/kWh" },
    { name: "NYSEG", territory: "Binghamton, Ithaca, Catskills region", rateIncrease: "9.9% May 2025 + 23.6% more pending (May 2026)", rate: "~$0.18–0.22/kWh" },
    { name: "RG&E", territory: "Rochester, Finger Lakes", rateIncrease: "9.9% (3rd consecutive year, combined 18%+ over 2 yrs)", rate: "~$0.19–0.23/kWh" },
  ],
  incentives: [
    { name: "NY State Solar Tax Credit", detail: "25% of system cost, up to $5,000. Non-refundable, carry-forward 5 yrs. Applies to leases 10+ yrs.", status: "✅ ACTIVE" },
    { name: "Federal ITC (Section 25D)", detail: "Expired Dec 31, 2025 for homeowner-purchased systems. Still available via lease/PPA (Section 48E commercial).", status: "❌ EXPIRED (owned)" },
    { name: "NY-Sun Megawatt Block (Upstate)", detail: "Standard residential block CLOSED Dec 17, 2025. Low-income (≤80% AMI) still eligible: $0.80/watt.", status: "⚠️ LMI ONLY" },
    { name: "Sales Tax Exemption", detail: "100% exemption on solar equipment from NY state 4% + local taxes. Saves $700–$1,500 on avg system.", status: "✅ ACTIVE" },
    { name: "Property Tax Exemption", detail: "15-year exemption on added home value under RPT §487. Most municipalities opt-in.", status: "✅ ACTIVE" },
    { name: "NYSERDA Battery Rebate", detail: "$200/kWh usable capacity upstate. Requires BYOB enrollment as of Apr 1, 2026.", status: "✅ ACTIVE" },
  ],
  netMetering: [
    { point: "1-to-1 retail rate credit", detail: "Every kWh you export = full retail credit on your bill (e.g., 22¢ exported = 22¢ credit)" },
    { point: "20-year rate lock", detail: "Homeowners who interconnect in 2026 lock in net metering for 20 years — massive urgency tool" },
    { point: "Customer Benefit Contribution (CBC)", detail: "$0.30–$1.33/kW installed monthly. Avg system: $25–$120/year — small cost vs. savings" },
    { point: "VDER alternative", detail: "Value Stack tariff available — more complex, generally lower savings. Most reps recommend NEM" },
    { point: "Credits roll month-to-month", detail: "Summer surplus credits offset winter bills. Annual reconciliation — excess paid at avoided-cost rate" },
    { point: "System size limit", detail: "Up to 25 kW for most upstate utilities (residential)" },
  ],
};

const PERSONAS = [
  {
    id: "easy-convert",
    name: "Beth, 38",
    location: "Guilderland, NY",
    utility: "National Grid",
    difficulty: 1,
    hasSpouse: false,
    avatar: "😊",
    curbAppeal: [
      "Neat cape cod, solar-ready south-facing roof, no obstructions",
      "\"I ❤️ Clean Energy\" bumper sticker on a Prius in the driveway",
      "Yard sign: \"This home runs on 100% renewable energy\" — from her electricity supplier",
      "Composting bin visible by the side of the house",
      "No soliciting sign — none",
    ],
    background: "Middle school science teacher, single, rents half her duplex. Just signed up for a green energy plan and has been actively researching solar for 3 months. Roof is 4 years old — replaced right after she bought the house. Bills average $160/month. Credit score ~760.",
    personality: "Enthusiastic, informed, zero sales resistance. Asks smart questions but wants to say yes. Will sign up for an appointment almost immediately if you seem credible.",
    primaryObjections: [
      "I've been looking into this — what company are you with?",
      "Is this a lease or can I own it outright?",
      "How long does the installation actually take?",
    ],
    secondaryObjections: [
      "Do I need to do anything to prepare my roof first?",
    ],
    openingMood: "Opens door with a big smile. 'Oh perfect timing — I was literally just reading about solar!'",
    warmupTriggers: ["ownership option", "NY 25% tax credit", "installation timeline", "custom proposal"],
  },
  {
    id: "friendly-curious",
    name: "Darnell, 44",
    location: "Latham, NY",
    utility: "National Grid",
    difficulty: 2,
    hasSpouse: false,
    avatar: "🙂",
    curbAppeal: [
      "Well-kept ranch, freshly mowed lawn",
      "No soliciting sign — none",
      "Newer Hyundai Sonata in the driveway",
      "Roof looks solid — architectural shingles, maybe 8–10 years old",
      "A few potted plants on the front porch, friendly vibe",
    ],
    background: "Logistics coordinator, divorced, owns the home outright. Has seen solar ads but never engaged. Bills run $185/month in summer. Roof is 9 years old, good condition. Credit score ~720. Easygoing, just needs a reason to take the next step.",
    personality: "Friendly and open, low skepticism. Main hesitation is inertia — no one has made it feel easy or urgent before. Responds well to a clear simple explanation.",
    primaryObjections: [
      "I've thought about it but never really looked into it.",
      "Is it a big hassle to get set up?",
      "How do I know how much I'd actually save?",
    ],
    secondaryObjections: [
      "Do I have to do anything with my current electric company?",
    ],
    openingMood: "Opens door, friendly. 'Hey, what's going on?'",
    warmupTriggers: ["simplicity of process", "rate hike impact on his bill", "no upfront cost framing", "neighbor installs in the area"],
  },
  {
    id: "eco-curious",
    name: "Priya, 35",
    location: "Saratoga Springs, NY",
    utility: "National Grid",
    difficulty: 3,
    hasSpouse: false,
    avatar: "🧑",
    curbAppeal: [
      "Craftsman-style home, freshly painted, well-kept landscaping",
      "Chevy Bolt EV in the driveway with a Level 2 charger on the exterior wall",
      "Recycling bins neatly sorted at the curb",
      "\"Support Local\" and farmers market sticker on the car",
      "Roof is clean metal standing seam — clearly newer, great solar candidate",
      "Neighbor two doors down has solar panels visible from the street",
    ],
    background: "Marketing director, environmentally conscious, already has an EV. Mentioned to a neighbor she was 'thinking about solar.' High earner, can qualify for tax credit. Roof is only 5 years old — full replacement done when she bought the house, metal standing seam.",
    personality: "Curious and friendly, but wants to do her own research first. Doesn't like being rushed. Might bring up competing quotes or online tools.",
    primaryObjections: [
      "I want to do more research before committing to anything.",
      "I was going to use EnergySage to compare quotes myself.",
      "I heard the federal tax credit expired — is it still worth it?",
      "Can I see actual numbers for my specific house, not just averages?",
    ],
    secondaryObjections: [
      "Will the panels work with my EV charging setup?",
      "How does the process actually work — how long does it take?",
    ],
    openingMood: "Opens door fully, curious. 'Oh hey — are you with a solar company?'",
    warmupTriggers: ["EV charging synergy", "NY state 25% credit", "20-year net metering lock", "custom roof proposal"],
  },
  {
    id: "almost-sold",
    name: "A House in Malta",
    location: "Malta, NY",
    utility: "National Grid",
    difficulty: 4,
    hasSpouse: true,
    avatar: "👫",
    curbAppeal: [
      "Comfortable split-level, established neighborhood — been here a while",
      "Two cars in the driveway: a Honda Pilot and a Subaru Outback",
      "Neighbor directly across the street has a visible rooftop solar array",
      "Above-ground pool in the backyard visible from the driveway",
      "No soliciting sign — none",
      "Roof shows age — slightly weathered, a couple of darker patches near a valley",
      "\"Malta Little League\" bumper sticker — family with kids",
    ],
    background: "Linda and Tom, both working, kids are in college. Have talked about solar for 2 years but never pulled the trigger. Neighbor just installed. High bills in summer due to AC + pool pump. Roof is 16 years old — they know it'll need replacing in the next few years and have been using that as a reason to wait on solar. Credit score ~690.",
    personality: "Friendly, genuinely interested, but classic 'let me think about it' couple. Will defer to each other. Tom is the skeptic, Linda is more enthusiastic.",
    primaryObjections: [
      "We've been meaning to look into this — just haven't gotten around to it.",
      "Tom, should we just hear what they have to say? [Tom: I don't know, we're busy...]",
      "What exactly is the net metering thing we keep hearing about?",
      "Will we really still have a bill? Our neighbor said she still pays something.",
      "We don't want to sign anything today.",
    ],
    secondaryObjections: [
      "We're thinking about an addition on the house next year — does that affect anything?",
      "What if the program changes and they stop crediting us?",
    ],
    openingMood: "Linda opens the door. 'Hi there! Tom, come here — it's someone about solar!'",
    warmupTriggers: ["neighbor social proof", "net metering explained clearly", "20-year rate lock urgency", "no-pressure appointment only"],
  },
  {
    id: "busy-dad",
    name: "A House in Clifton Park",
    location: "Clifton Park, NY",
    utility: "National Grid",
    difficulty: 5,
    hasSpouse: true,
    avatar: "👨",
    curbAppeal: [
      "Two-story colonial, newer construction subdivision",
      "Tesla Model 3 in the driveway with a home charger visible on the garage wall",
      "Kids' bikes and a basketball hoop in the driveway",
      "No soliciting sign — none visible",
      "Roof looks relatively new, clean architectural shingles, south-facing pitch",
      "Ring doorbell camera above the door",
    ],
    background: "Marcus, IT manager, two kids, recently bought the house 3 years ago. Has thought about solar before. High electricity bills — $230/month avg. Just refinanced. Wife works remote. Roof was replaced by the previous owner about 7 years ago — architectural shingles, good condition. Credit score ~700.",
    personality: "Busy, analytical, not hostile but time-crunched. Wants data, not fluff. Suspicious of high-pressure tactics but open to the right deal.",
    primaryObjections: [
      "I literally have 5 minutes, so make it quick.",
      "We just refinanced — I'm not taking on another loan right now.",
      "I already got a quote from another company last year and didn't pull the trigger.",
      "I need to talk to my wife before making any decisions.",
      "What's the catch? Everything sounds too good to be true.",
    ],
    secondaryObjections: [
      "I'm not sure my roof faces the right direction.",
      "What happens when I sell the house?",
      "Does this affect my homeowner's insurance?",
    ],
    openingMood: "Opens the door distracted, holding his phone. 'Yeah? What's up?'",
    warmupTriggers: ["specific savings numbers", "no new loan / lease option", "rate lock before next increase", "transferable to buyer"],
  },
  {
    id: "cautious-couple",
    name: "A House in Troy",
    location: "Troy, NY",
    utility: "National Grid",
    difficulty: 6,
    hasSpouse: true,
    avatar: "👴",
    curbAppeal: [
      "Older two-story colonial, lived-in feel, American flag on the porch",
      "Two cars — a Ford F-150 and a Honda CR-V",
      "No soliciting sign — present but small",
      "Roof looks original — dark 3-tab shingles, some moss visible near the north edge",
      "Vegetable garden on the side of the house",
      "Retired feel — no kids toys, daytime weekday activity visible inside",
    ],
    background: "Gary and Carol, both 64, recently retired. Fixed income from pensions and early Social Security. Had a solar rep at the door last year who felt pushy and they've been wary since. Roof is 18 years old, some moss but no leaks. Bills average $200/month. Credit score ~650 — some medical debt from 2023.",
    personality: "Cautious, deliberate decision-makers. Carol is more open; Gary had the bad experience and is the blocker. They won't be rushed. Respond well to honesty and patience. Hate feeling like they're being sold to.",
    primaryObjections: [
      "We had someone out here last year and we didn't like how he handled it.",
      "We're on a fixed income — we can't afford to make a mistake.",
      "Gary, should we even be listening to this? [Gary: I don't know, last time...]",
      "How do we know the savings are real and not just on paper?",
      "We'd need a lot of time to think about this.",
    ],
    secondaryObjections: [
      "Our roof isn't new — would that be a problem?",
      "What happens if one of us passes and the other is left with this contract?",
    ],
    openingMood: "Carol opens the door partway. 'Can I help you?' Gary visible in the background looking skeptical.",
    warmupTriggers: ["acknowledging their bad experience", "patience / no pressure", "lease so no ownership risk", "fixed monthly payment clarity"],
  },
  {
    id: "mid-skeptic",
    name: "A House in Schenectady",
    location: "Schenectady, NY",
    utility: "National Grid",
    difficulty: 7,
    hasSpouse: false,
    avatar: "🤨",
    curbAppeal: [
      "Brick two-story, older neighborhood, well maintained",
      "One car — a Dodge Ram pickup",
      "Small \"No Soliciting\" sign beside the door",
      "Roof is visibly older — original 3-tab shingles, a few lifted corners near the chimney",
      "Political yard sign from the last election cycle still up",
      "No EV, no green indicators",
    ],
    background: "Ray, 51, electrician who owns his home outright and has strong opinions about contractors. Has done a lot of his own home work. Heard conflicting things about solar from coworkers — one loves it, one regrets it. Bills average $210/month. Roof is 17 years old. Credit score ~680.",
    personality: "Skeptical but not hostile. Will test your knowledge — if you get a technical detail wrong, he'll call it out. Respects straight talk and people who know their trade. Dislikes slick salespeople. Warms up if you treat him like an equal.",
    primaryObjections: [
      "I've heard mixed things — my buddy says his bill went up after going solar.",
      "I know enough about electrical work to know when someone's blowing smoke.",
      "What's the real markup you guys make on these installs?",
      "Why would I pay someone else to put something on my roof that they own?",
      "I've been thinking about doing this myself — there are DIY kits online.",
    ],
    secondaryObjections: [
      "What happens if there's a problem — who actually comes out to fix it?",
      "Does this void my homeowner's insurance?",
    ],
    openingMood: "Opens door, arms loosely crossed. 'Yeah. What're you selling.'",
    warmupTriggers: ["technical accuracy", "ownership / purchase option", "honest markup conversation", "respect for his trade knowledge"],
  },
  {
    id: "skeptic-retiree",
    name: "A House in Ballston Spa",
    location: "Ballston Spa, NY",
    utility: "National Grid",
    difficulty: 8,
    hasSpouse: false,
    avatar: "👵",
    curbAppeal: [
      "Small ranch home, well-maintained garden beds",
      "\"No Soliciting\" sign on the door — small, faded, easy to miss",
      "AARP bumper sticker on a 2018 Buick in the driveway",
      "Single-occupant feel — one car, one set of outdoor furniture",
      "Roof looks older, a couple shingles slightly uneven near the ridge",
    ],
    background: "Doris, 68, retired schoolteacher. Fixed income. Been approached 3x by solar reps this year. Husband passed 2 years ago, handles finances alone now. Roof is 14 years old — asphalt shingles, had a small repair done 2 years ago but no full replacement. Credit score ~710.",
    personality: "Skeptical, protective of her money, dislikes pressure, worried about scams, has a neighbor who had a 'bad experience' with solar. Warm but guarded.",
    primaryObjections: [
      "I've already had too many solar companies come to my door and I'm not interested.",
      "I'm on a fixed income and can't afford a big investment right now.",
      "My neighbor got solar and says her bills didn't go down like they promised.",
      "I don't want anything on my roof — what if it causes leaks?",
      "I'm too old to worry about recouping an investment over 20 years.",
    ],
    secondaryObjections: [
      "How do I know your company will still be around in 5 years?",
      "I don't want anyone coming in my house.",
      "My son handles these big decisions and he's not here.",
    ],
    openingMood: "Cracks the door slightly. 'I have a no-soliciting sign, you know.'",
    warmupTriggers: ["fixed income / no upfront cost", "lease options", "neighbor referral check", "utility rate increases she's paying"],
  },
  {
    id: "hard-close",
    name: "A House in Glens Falls",
    location: "Glens Falls, NY",
    utility: "NYSEG",
    difficulty: 9,
    hasSpouse: true,
    avatar: "😠",
    curbAppeal: [
      "Large colonial, detached garage, privacy fence",
      "Two cars — a Cadillac Escalade and a Mercedes sedan",
      "Bold \"No Soliciting\" sign AND a second sign: \"We are not interested in solar\"",
      "Roof is in decent shape — looks maybe 10 years old, but north-facing sections visible",
      "Ring camera AND a visible security system panel through the window",
      "No recycling bin, no EV, manicured but impersonal landscaping",
    ],
    background: "Frank and Diane, both 58. Frank is a lawyer, Diane runs a boutique. High income but extremely protective of their time and money. Frank has researched solar and decided against it twice — once due to aesthetics, once due to a lease he found unfavorable. Bills average $380/month. Roof is 11 years old. Credit score ~800. Frank will probe every claim legally.",
    personality: "Sophisticated, dismissive, time-intolerant. Frank does the talking. Has specific objections based on real research — not myths. Will pick apart contract terms if you get that far. Diane is quietly curious but defers to Frank publicly.",
    primaryObjections: [
      "We have a sign for a reason.",
      "I've looked into this twice and it didn't make sense for us.",
      "I'm not interested in a lease — I'm not putting a lien on my home.",
      "What's your inverter warranty and who backs it if your company folds?",
      "I don't want panels on the front of the house. Period.",
    ],
    secondaryObjections: [
      "What's the actual IRR on a cash purchase at today's rates?",
      "My accountant told me the tax credit situation changed — walk me through it.",
      "Diane, we've been through this. [Diane: I know, but Frank, our bill last month...]",
    ],
    openingMood: "Frank opens the door. 'There's a no-soliciting sign. And a solar sign. What exactly are you doing here?'",
    warmupTriggers: ["cash purchase / ownership path", "inverter and manufacturer warranty specifics", "Diane as internal champion", "NYSEG rate hike dollar impact on their $380 bill"],
  },
  {
    id: "hostile-henry",
    name: "A House in Glens Falls",
    location: "Glens Falls, NY",
    utility: "NYSEG",
    difficulty: 10,
    hasSpouse: false,
    avatar: "😤",
    curbAppeal: [
      "Large two-story home, owned feel — no rental signs, personalized mailbox",
      "Bold \"No Soliciting\" sign at eye level on the door frame",
      "\"Don't Tread On Me\" flag on a pole by the garage",
      "NRA sticker and a \"Proud American\" decal on the pickup truck",
      "Roof is clearly aging — 3-tab shingles with visible curling on the lower edge",
      "No EV, no recycling bin visible, gas-powered lawn equipment by the garage",
    ],
    background: "Henry, 55, small business owner, conservative-leaning, deeply distrusts solar industry. Has a 'No Soliciting' sign. Had a bad experience with a contractor on a different home project. Owns his home outright. Roof is 22 years old — original 3-tab shingles, has some curling at the edges but Henry insists it's 'perfectly fine and not leaking.' Credit score ~640 — took a hit from a business dispute.",
    personality: "Blunt, confrontational, doesn't believe climate change is real, thinks solar is 'government subsidized garbage.' Will challenge every claim. Has time but zero patience for spin.",
    primaryObjections: [
      "I have a no-soliciting sign. Can you read?",
      "Solar is a scam propped up by government handouts.",
      "I don't believe my bills will actually go down.",
      "You people keep coming back and I keep saying no.",
      "I own my home outright. Why would I put something on MY roof that a company owns?",
      "The panels look terrible and will hurt my property value.",
    ],
    secondaryObjections: [
      "What happens to those panels after 25 years — where does all that waste go?",
      "My roof is fine the way it is.",
      "I've heard you guys file for bankruptcy and the panels become someone else's problem.",
    ],
    openingMood: "Opens door arms crossed. 'What do you want.'",
    warmupTriggers: ["ownership / purchase path (not lease)", "property value data", "NYSEG rate hike specifics", "zero pressure / leave materials"],
  },
];

const SYSTEM_PROMPT = (persona) => `You are roleplaying as ${persona.name}, a homeowner in upstate New York being approached door-to-door by a solar salesperson.

BACKGROUND: ${persona.background}
PERSONALITY: ${persona.personality}
OPENING MOOD: ${persona.openingMood}
DIFFICULTY: ${persona.difficulty}/10

YOUR PRIMARY OBJECTIONS (rotate through these naturally):
${persona.primaryObjections.map((o, i) => `${i + 1}. "${o}"`).join("\n")}

SECONDARY OBJECTIONS (use if conversation continues):
${persona.secondaryObjections.map((o, i) => `${i + 1}. "${o}"`).join("\n")}

WARMUP TRIGGERS (things that soften you if the rep addresses them well):
${persona.warmupTriggers.map((t) => `- ${t}`).join("\n")}

CONTEXT YOU KNOW:
- Your utility is ${persona.utility} in upstate New York
- Your roof: ${persona.background.match(/[Rr]oof[^.]+\./)?.[0] || "asphalt shingles, age unknown"}
- Net metering gives 1-to-1 retail credits for excess solar sent to grid
- NY state has a 25% solar tax credit up to $5,000 (federal 30% expired end of 2025)
- National Grid/NYSEG rates have been rising significantly
- You've heard about door-to-door solar scams
- If asked for a power bill or credit score, you are cautious but can say your bill averages what fits your character — you will NOT hand over documents at the door; you'd need to be convinced first

RULES:
- Stay in character. Be realistic to your personality.
- Start with your opening mood. Don't immediately launch into objections — let the rep speak first.
- Raise objections naturally as the conversation flows.
- If the rep gives a VERY good answer to an objection, you can soften slightly — but don't cave easily.
- If the rep is pushy or uses high-pressure tactics, become more resistant.
- If the rep is respectful, honest, and knowledgeable, you can warm up.
- Keep responses to 2-4 sentences. Be conversational, not robotic.
- Never break character.
- Occasionally reference real upstate NY details (weather, towns, your utility name, the fact that winters are long).

ENDING THE CONVERSATION — CRITICAL:
- Only end the session in one of two ways:
  1. APPOINTMENT SET: The rep has successfully asked for and you have agreed to a specific time to meet with a solar expert/consultant. End your reply in character, then on a NEW LINE append exactly: [[APPOINTMENT SET]]
  2. HARD REJECTION: You are definitively done and closing the door — no more chances. End your reply in character, then on a NEW LINE append exactly: [[CONVERSATION OVER]]
- Do NOT append either tag just because the rep is asking questions or you said "tell me more" or "come inside." Only use [[APPOINTMENT SET]] when a specific meeting time has been agreed upon. Keep the conversation going through all other stages.`;

export default function SolarSalesTrainer() {
  const [activeTab, setActiveTab] = useState("research");
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionOver, setSessionOver] = useState(false);
  const [score, setScore] = useState(null);
  const messagesEndRef = useRef(null);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRoleplay = (persona) => {
    setSelectedPersona(persona);
    setMessages([]);
    setSessionOver(false);
    setScore(null);
    setInput("");
    setActiveTab("roleplay");
    // Initial greeting from persona
    const opening = { role: "assistant", content: persona.openingMood };
    setMessages([opening]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-calls": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT(selectedPersona),
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const text = data.content?.map((c) => c.text || "").join("") || "...";
      const assistantMsg = { role: "assistant", content: text };
      setMessages((prev) => [...prev, assistantMsg]);

      // Only end on explicit signal tokens — no message count limit
      const lower = text.toLowerCase();
      const appointmentSet = lower.includes("[[appointment set]]");
      const hardRejection = lower.includes("[[conversation over]]");
      if (appointmentSet || hardRejection) {
        setTimeout(() => scoreSession(newMessages, text, appointmentSet), 500);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "(Connection error — try again)" }]);
    }
    setLoading(false);
  };

  const scoreSession = async (msgs, lastReply, appointmentSet = false) => {
    setSessionOver(true);
    setLoading(true);
    try {
      const transcript = msgs.map((m) => `${m.role === "user" ? "REP" : "CUSTOMER"}: ${m.content}`).join("\n");
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-calls": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: `You are a rigorous solar sales trainer evaluating a door-to-door sales roleplay transcript. Respond ONLY in raw JSON — no markdown, no backticks, no preamble.`,
          messages: [
            {
              role: "user",
              content: `Evaluate this solar sales roleplay transcript. Customer persona: ${selectedPersona.name} (difficulty ${selectedPersona.difficulty}/10). Spouse present in household: ${selectedPersona.hasSpouse ? "YES" : "NO"}.

TRANSCRIPT:
${transcript}

LAST CUSTOMER REPLY: ${lastReply}

SCORING RULES:
- Maximum possible score is 10.
- A score of 9 or 10 requires ALL FOUR qualification gates to be met (see below).
- A score of 7-8 means appointment was set but 1-2 gates were missed.
- A score of 5-6 means appointment was set but 3+ gates were missed, OR appointment not set but strong technique shown.
- A score below 5 means no appointment and poor technique.
- If the appointment was NOT set, the max score is 5 regardless of technique.

THE FOUR QUALIFICATION GATES — scan the REP's lines carefully:
1. CREDIT CHECK: Did the rep ask about the homeowner's credit score or mention that credit is checked for financing? (yes/no)
2. ROOF AGE: Did the rep ask how old the roof is or confirm the roof condition? (yes/no)  
3. UTILITY BILL: Did the rep ask to see the utility bill (NYSEG/National Grid bill) or ask about their monthly electric cost in a way that led to them sharing it? (yes/no)
4. SPOUSE/DECISION MAKER: If a spouse or co-owner is present in this household, did the rep ask to include them in the appointment or confirm both decision-makers will be present? If no spouse in household, mark this true automatically. (yes/no)

Respond ONLY with this exact JSON structure:
{
  "outcome": "success" or "failure" or "partial",
  "score": 1-10,
  "summary": "2-3 sentence overall assessment referencing what was done well and what was missed",
  "strengths": ["up to 3 specific things the rep did well, with examples from the transcript"],
  "improvements": ["up to 3 specific actionable things to improve"],
  "gates": {
    "creditCheck": true or false,
    "roofAge": true or false,
    "utilityBill": true or false,
    "spouseIncluded": true or false
  },
  "netMeteringUsed": true or false,
  "rateHikeUsed": true or false,
  "urgencyUsed": true or false
}`,
            },
          ],
        }),
      });
      const data = await response.json();
      const raw = data.content?.map((c) => c.text || "").join("") || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setScore(parsed);
    } catch (e) {
      setScore({ outcome: "partial", score: 5, summary: "Session ended. Review your transcript above.", strengths: [], improvements: [], gates: {} });
    }
    setLoading(false);
  };

  const difficultyColor = (d) => {
    if (d <= 4) return "#22c55e";
    if (d <= 7) return "#f59e0b";
    return "#ef4444";
  };

  const difficultyLabel = (d) => {
    if (d <= 3) return "Easy";
    if (d <= 5) return "Medium";
    if (d <= 7) return "Hard";
    if (d <= 9) return "Very Hard";
    return "Expert";
  };

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#0f1923", minHeight: "100vh", color: "#e8dcc8" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a2d1a 0%, #0f1923 50%, #1a1a2d 100%)", borderBottom: "2px solid #2a5c2a", padding: "20px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>☀️</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "0.05em", color: "#f0e68c" }}>
              UPSTATE NY SOLAR SALES TRAINER
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#8aab8a", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            NATIONAL GRID · NYSEG · RG&E · NET METERING 2026 · DOOR-TO-DOOR ROLEPLAY
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#111c11", borderBottom: "1px solid #2a3a2a", padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 0 }}>
          {[
            { id: "research", label: "📊 Market Intel" },
            { id: "objections", label: "🛡️ Objections" },
            { id: "personas", label: "🎭 Choose Customer" },
            { id: "roleplay", label: "🚪 Roleplay" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.id ? "3px solid #f0e68c" : "3px solid transparent",
                color: activeTab === tab.id ? "#f0e68c" : "#6b8a6b",
                padding: "14px 18px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 400,
                fontFamily: "monospace",
                letterSpacing: "0.05em",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>

        {/* ===== MARKET INTEL TAB ===== */}
        {activeTab === "research" && (
          <div>
            <SectionHeader icon="⚡" title="Upstate NY Utilities — Rate Environment" />
            <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
              {MARKET_DATA.utilities.map((u, i) => (
                <Card key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#f0e68c", fontSize: 16 }}>{u.name}</div>
                      <div style={{ color: "#8aab8a", fontSize: 12, marginTop: 2 }}>{u.territory}</div>
                    </div>
                    <Tag color="#ef4444">{u.rate}</Tag>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: "#c8b89a", borderTop: "1px solid #2a3a2a", paddingTop: 10 }}>
                    📈 <strong>Rate increases:</strong> {u.rateIncrease}
                  </div>
                </Card>
              ))}
            </div>

            <SectionHeader icon="💰" title="2026 Incentive Stack — Know Before You Knock" />
            <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
              {MARKET_DATA.incentives.map((inc, i) => (
                <Card key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 700, color: "#e8dcc8", fontSize: 14 }}>{inc.name}</div>
                    <span style={{
                      fontSize: 11, fontFamily: "monospace", padding: "3px 8px", borderRadius: 4,
                      background: inc.status.includes("✅") ? "#1a3a1a" : inc.status.includes("❌") ? "#3a1a1a" : "#3a2a0a",
                      color: inc.status.includes("✅") ? "#6dff6d" : inc.status.includes("❌") ? "#ff6d6d" : "#ffcc00",
                      border: `1px solid ${inc.status.includes("✅") ? "#2a5a2a" : inc.status.includes("❌") ? "#5a2a2a" : "#5a4a1a"}`,
                      whiteSpace: "nowrap",
                    }}>{inc.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#a89878", marginTop: 6 }}>{inc.detail}</div>
                </Card>
              ))}
            </div>

            <SectionHeader icon="🔄" title="Net Metering — Your Core Value Prop" />
            <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
              {MARKET_DATA.netMetering.map((nm, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: 700, color: "#f0e68c", fontSize: 14 }}>⚡ {nm.point}</div>
                  <div style={{ fontSize: 13, color: "#a89878", marginTop: 6 }}>{nm.detail}</div>
                </Card>
              ))}
            </div>

            <Card style={{ background: "#1a2d0a", border: "1px solid #3a6a1a" }}>
              <div style={{ fontWeight: 700, color: "#6dff6d", marginBottom: 8 }}>🎯 KEY TALKING POINTS FOR UPSTATE NY</div>
              <div style={{ display: "grid", gap: 6, fontSize: 13, color: "#c8e8a8" }}>
                {[
                  "NY-Sun standard upstate block CLOSED Dec 2025 — urgency is real, not manufactured",
                  "20-year net metering rate lock: interconnect now, guaranteed rates through 2046",
                  "No federal ITC for owned systems — leases/PPAs capture Section 48E (commercial credit passed through)",
                  "NY 25% state tax credit up to $5,000 still alive — works on leases 10+ years",
                  "NYSEG pending 23.6% hike — every month of delay = more money to the utility",
                  "National Grid 28% hike approved over 3 years — April 2026 step already hit",
                  "Upstate gets MORE sun than most homeowners think — panels work on light, not heat",
                  "Winter credits from summer surplus — 'virtual battery' concept",
                  "Property value increases exempt from tax assessment for 15 years (RPT §487)",
                  "Typical upstate payback: 6–9 years; 25-year savings avg $34,000–$54,000+"
                ].map((pt, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "#6dff6d", flexShrink: 0 }}>▸</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ===== OBJECTIONS TAB ===== */}
        {activeTab === "objections" && (
          <div>
            <SectionHeader icon="🛡️" title="Common Objections & Rebuttals" />
            <p style={{ color: "#8aab8a", fontSize: 13, marginBottom: 20 }}>
              Click any objection to expand the rebuttal framework. Master these before roleplaying.
            </p>
            {OBJECTIONS.map((obj, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <button
                  onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                  style={{
                    width: "100%", textAlign: "left", background: expandedSection === i ? "#1a2d0a" : "#131f13",
                    border: `1px solid ${expandedSection === i ? "#3a6a1a" : "#2a3a2a"}`,
                    borderRadius: 8, padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between",
                    alignItems: "center", transition: "all 0.2s",
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "#8aab8a", marginRight: 8 }}>
                      {obj.category}
                    </span>
                    <span style={{ color: "#e8dcc8", fontWeight: 600, fontSize: 14 }}>{obj.objection}</span>
                  </div>
                  <span style={{ color: "#6dff6d", fontSize: 18 }}>{expandedSection === i ? "−" : "+"}</span>
                </button>
                {expandedSection === i && (
                  <div style={{ background: "#0d1a0d", border: "1px solid #2a3a2a", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 16 }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "#8aab8a", fontFamily: "monospace", marginBottom: 6 }}>WHY THEY SAY IT</div>
                      <div style={{ fontSize: 13, color: "#a89878" }}>{obj.psychology}</div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "#6dff6d", fontFamily: "monospace", marginBottom: 6 }}>REBUTTAL APPROACH</div>
                      <div style={{ fontSize: 13, color: "#c8e8a8" }}>{obj.rebuttal}</div>
                    </div>
                    {obj.nySpin && (
                      <div style={{ background: "#1a2d0a", border: "1px solid #3a5a1a", borderRadius: 6, padding: 10 }}>
                        <div style={{ fontSize: 11, color: "#f0e68c", fontFamily: "monospace", marginBottom: 4 }}>🗽 UPSTATE NY SPECIFIC</div>
                        <div style={{ fontSize: 13, color: "#e8d878" }}>{obj.nySpin}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== PERSONAS TAB ===== */}
        {activeTab === "personas" && (
          <div>
            <SectionHeader icon="🎭" title="Choose Your Customer" />
            <p style={{ color: "#8aab8a", fontSize: 13, marginBottom: 20 }}>
              You only see what you'd notice walking up. Names, ages, utility info — earn it in the conversation.
            </p>
            <div style={{ display: "grid", gap: 14 }}>
              {[...PERSONAS].sort((a, b) => a.difficulty - b.difficulty).map((p) => (
                <Card key={p.id}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    {/* Difficulty badge — prominent left column */}
                    <div style={{
                      flexShrink: 0, width: 52, height: 52, borderRadius: 10,
                      background: p.difficulty <= 3 ? "#0d2a0d" : p.difficulty <= 6 ? "#2a1a00" : p.difficulty <= 8 ? "#2a0d00" : "#2a0000",
                      border: `2px solid ${difficultyColor(p.difficulty)}`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace", color: difficultyColor(p.difficulty), lineHeight: 1 }}>
                        {p.difficulty}
                      </div>
                      <div style={{ fontSize: 9, color: difficultyColor(p.difficulty), fontFamily: "monospace", letterSpacing: "0.05em" }}>
                        /10
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: "#f0e68c", fontSize: 14 }}>
                            {p.location} — {difficultyLabel(p.difficulty)}
                          </div>
                          <div style={{ fontSize: 11, color: "#6a8a6a", fontFamily: "monospace" }}>
                            {p.utility} territory{p.hasSpouse ? " · Multiple occupants visible" : ""}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "#6a8a6a", fontFamily: "monospace", marginBottom: 6, letterSpacing: "0.04em" }}>
                        APPROACHING:
                      </div>
                      <div style={{ display: "grid", gap: 4 }}>
                        {p.curbAppeal.map((clue, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#c8d8a8" }}>
                            <span style={{ color: "#6daa6d", flexShrink: 0 }}>👁</span>
                            <span>{clue}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => startRoleplay(p)}
                        style={{
                          marginTop: 12, background: "linear-gradient(135deg, #2a5c2a, #1a3c1a)",
                          border: "1px solid #4a8c4a", color: "#c8f0c8", padding: "8px 18px",
                          borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700,
                          letterSpacing: "0.05em", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => e.target.style.background = "linear-gradient(135deg, #3a7c3a, #2a5c2a)"}
                        onMouseLeave={e => e.target.style.background = "linear-gradient(135deg, #2a5c2a, #1a3c1a)"}
                      >
                        🚪 KNOCK →
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ===== ROLEPLAY TAB ===== */}
        {activeTab === "roleplay" && (
          <div>
            {!selectedPersona ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b8a6b" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚪</div>
                <div style={{ fontSize: 18, marginBottom: 8 }}>No customer selected</div>
                <button
                  onClick={() => setActiveTab("personas")}
                  style={{ background: "#2a5c2a", border: "1px solid #4a8c4a", color: "#c8f0c8", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 14 }}
                >
                  Choose a Customer →
                </button>
              </div>
            ) : (
              <div>
                {/* Approach Banner — curb-visible info only */}
                <div style={{ background: "#1a2d0a", border: "1px solid #3a5a1a", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#f0e68c", fontSize: 14 }}>📍 {selectedPersona.location} · {selectedPersona.utility} territory</div>
                      <div style={{ fontSize: 11, color: "#6a8a6a", fontFamily: "monospace", marginTop: 2 }}>APPROACHING THE DOOR</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                        background: selectedPersona.difficulty <= 3 ? "#0d2a0d" : selectedPersona.difficulty <= 6 ? "#2a1a00" : selectedPersona.difficulty <= 8 ? "#2a0d00" : "#2a0000",
                        border: `2px solid ${difficultyColor(selectedPersona.difficulty)}`,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: difficultyColor(selectedPersona.difficulty), lineHeight: 1 }}>
                          {selectedPersona.difficulty}
                        </div>
                        <div style={{ fontSize: 8, color: difficultyColor(selectedPersona.difficulty), fontFamily: "monospace" }}>/10</div>
                      </div>
                      <button
                        onClick={() => setActiveTab("personas")}
                        style={{ background: "none", border: "1px solid #4a6a4a", color: "#8aab8a", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                      >
                        Different Door →
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 4 }}>
                    {selectedPersona.curbAppeal.map((clue, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#a8c898" }}>
                        <span style={{ flexShrink: 0 }}>👁</span>
                        <span>{clue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat window */}
                <div style={{ background: "#0d150d", border: "1px solid #2a3a2a", borderRadius: 10, padding: 16, minHeight: 360, maxHeight: 420, overflowY: "auto", marginBottom: 12 }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ marginBottom: 14, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "78%",
                        background: msg.role === "user" ? "#1a3c1a" : "#1a1a2d",
                        border: `1px solid ${msg.role === "user" ? "#3a6a3a" : "#2a2a4a"}`,
                        borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        padding: "10px 14px",
                        fontSize: 14,
                        color: msg.role === "user" ? "#c8f0c8" : "#c8c8f0",
                        lineHeight: 1.5,
                      }}>
                        {msg.role === "assistant" && (
                          <div style={{ fontSize: 11, color: "#6a6a8a", fontFamily: "monospace", marginBottom: 4 }}>
                            HOMEOWNER
                          </div>
                        )}
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{ background: "#1a1a2d", border: "1px solid #2a2a4a", borderRadius: 14, padding: "10px 16px", color: "#6a6a8a", fontSize: 13 }}>
                        <span style={{ animation: "pulse 1s infinite" }}>typing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Score card */}
                {score && (
                  <div style={{
                    background: score.outcome === "success" ? "#0d2a0d" : score.outcome === "failure" ? "#2a0d0d" : "#1a1a0d",
                    border: `2px solid ${score.outcome === "success" ? "#3a6a3a" : score.outcome === "failure" ? "#6a3a3a" : "#6a6a1a"}`,
                    borderRadius: 10, padding: 18, marginBottom: 14,
                  }}>

                    {/* Score header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: score.outcome === "success" ? "#6dff6d" : score.outcome === "failure" ? "#ff6d6d" : "#f0e68c" }}>
                        {score.outcome === "success" ? "✅ APPOINTMENT SET" : score.outcome === "failure" ? "❌ DOOR CLOSED" : "⚠️ PARTIAL"}
                      </div>
                      <div style={{
                        fontSize: 28, fontWeight: 900, fontFamily: "monospace",
                        color: score.score >= 9 ? "#6dff6d" : score.score >= 7 ? "#f0e68c" : score.score >= 5 ? "#f59e0b" : "#ff6d6d",
                      }}>
                        {score.score}<span style={{ fontSize: 14, color: "#6a8a6a" }}>/10</span>
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: "#c8c8a8", marginBottom: 16, lineHeight: 1.6 }}>{score.summary}</div>

                    {/* Qualification Gates */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: "#f0e68c", fontFamily: "monospace", letterSpacing: "0.08em", marginBottom: 8 }}>
                        QUALIFICATION GATES — ALL 4 REQUIRED FOR 9+ SCORE
                      </div>
                      <div style={{ display: "grid", gap: 8 }}>
                        {[
                          { key: "creditCheck",     label: "Credit Score Asked",         icon: "💳", tip: "Ask about credit before mentioning financing options" },
                          { key: "roofAge",         label: "Roof Age Confirmed",          icon: "🏠", tip: "Always qualify the roof before setting an appointment" },
                          { key: "utilityBill",     label: "Utility Bill Obtained",       icon: "📄", tip: "Need to see the NYSEG/National Grid bill to size the system" },
                          { key: "spouseIncluded",  label: "Spouse / Decision-Maker In",  icon: "👫", tip: "Both decision-makers must be at the expert appointment" },
                        ].map((gate) => {
                          const passed = score.gates?.[gate.key];
                          return (
                            <div key={gate.key} style={{
                              display: "flex", alignItems: "flex-start", gap: 10,
                              background: passed ? "#0d2a0d" : "#2a0d0d",
                              border: `1px solid ${passed ? "#2a5a2a" : "#5a2a2a"}`,
                              borderRadius: 7, padding: "10px 12px",
                            }}>
                              <span style={{ fontSize: 18, flexShrink: 0 }}>{gate.icon}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: passed ? "#a8f0a8" : "#f0a8a8" }}>{gate.label}</span>
                                  <span style={{ fontSize: 16 }}>{passed ? "✅" : "❌"}</span>
                                </div>
                                {!passed && (
                                  <div style={{ fontSize: 11, color: "#c88888", marginTop: 3 }}>💡 {gate.tip}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Technique tags */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                      {[
                        { label: "Net Metering", val: score.netMeteringUsed },
                        { label: "Rate Hike",    val: score.rateHikeUsed },
                        { label: "Urgency",      val: score.urgencyUsed },
                      ].map((t, i) => (
                        <span key={i} style={{
                          fontSize: 11, fontFamily: "monospace", padding: "3px 10px", borderRadius: 4,
                          background: t.val ? "#1a3a1a" : "#2a1a1a",
                          color: t.val ? "#6dff6d" : "#ff6d6d",
                          border: `1px solid ${t.val ? "#3a6a3a" : "#6a3a3a"}`,
                        }}>
                          {t.val ? "✓" : "✗"} {t.label}
                        </span>
                      ))}
                    </div>

                    {/* Strengths / Improvements */}
                    {score.strengths?.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: "#6dff6d", fontFamily: "monospace", marginBottom: 4 }}>STRENGTHS</div>
                        {score.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: "#a8e8a8", marginBottom: 3 }}>▸ {s}</div>)}
                      </div>
                    )}
                    {score.improvements?.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, color: "#ff9a9a", fontFamily: "monospace", marginBottom: 4 }}>IMPROVE</div>
                        {score.improvements.map((s, i) => <div key={i} style={{ fontSize: 13, color: "#e8a8a8", marginBottom: 3 }}>▸ {s}</div>)}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={() => startRoleplay(selectedPersona)}
                        style={{ background: "#1a3c1a", border: "1px solid #4a8c4a", color: "#c8f0c8", padding: "9px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
                      >
                        🔄 Try Again
                      </button>
                      <button
                        onClick={() => setActiveTab("personas")}
                        style={{ background: "#1a1a3c", border: "1px solid #4a4a8c", color: "#c8c8f0", padding: "9px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
                      >
                        🚪 New Door
                      </button>
                    </div>

                    {/* Post-session customer reveal */}
                    <div style={{ marginTop: 18, borderTop: "1px solid #2a3a2a", paddingTop: 14 }}>
                      <div style={{ fontSize: 11, color: "#f0e68c", fontFamily: "monospace", marginBottom: 10, letterSpacing: "0.08em" }}>
                        📋 WHO YOU WERE TALKING TO
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 32 }}>{selectedPersona.avatar}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: "#e8dcc8", fontSize: 15 }}>{selectedPersona.name}</div>
                          <div style={{ fontSize: 12, color: "#8aab8a", marginBottom: 6 }}>
                            {selectedPersona.location} · {selectedPersona.utility} ·{" "}
                            <span style={{ color: difficultyColor(selectedPersona.difficulty) }}>
                              Difficulty {selectedPersona.difficulty}/10 — {difficultyLabel(selectedPersona.difficulty)}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: "#a89878", marginBottom: 8 }}>{selectedPersona.background}</div>
                          <div style={{ fontSize: 12, color: "#7a9a7a", fontStyle: "italic" }}>Opening mood: "{selectedPersona.openingMood}"</div>
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 11, color: "#8aab8a", fontFamily: "monospace", marginBottom: 4 }}>WHAT WOULD HAVE WARMED THEM UP:</div>
                            {selectedPersona.warmupTriggers.map((t, i) => (
                              <div key={i} style={{ fontSize: 12, color: "#a8c888" }}>▸ {t}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input */}
                {!sessionOver && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="Type your response as the solar rep... (Enter to send, Shift+Enter for new line)"
                      style={{
                        flex: 1, background: "#111c11", border: "1px solid #2a4a2a", borderRadius: 8,
                        color: "#e8dcc8", padding: "12px 14px", fontSize: 14, resize: "none", height: 80,
                        fontFamily: "Georgia, serif", outline: "none",
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      style={{
                        background: loading || !input.trim() ? "#1a2a1a" : "linear-gradient(135deg, #2a5c2a, #1a4a1a)",
                        border: "1px solid #4a8c4a", color: loading || !input.trim() ? "#4a6a4a" : "#c8f0c8",
                        padding: "0 22px", borderRadius: 8, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                        fontSize: 22, fontWeight: 700,
                      }}
                    >
                      →
                    </button>
                  </div>
                )}
                <div style={{ fontSize: 11, color: "#4a6a4a", marginTop: 6, fontFamily: "monospace" }}>
                  TIP: Reference net metering, rate hikes, the 20-year rate lock, and NY state tax credit for best results.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== COMPONENTS =====
function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f0e68c", letterSpacing: "0.08em", fontFamily: "monospace", textTransform: "uppercase" }}>
        {title}
      </h2>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#131f13", border: "1px solid #2a3a2a", borderRadius: 8, padding: "14px 16px", ...style }}>
      {children}
    </div>
  );
}

function Tag({ children, color }) {
  return (
    <span style={{ fontSize: 12, fontFamily: "monospace", padding: "3px 10px", borderRadius: 4, background: `${color}22`, color, border: `1px solid ${color}55`, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

// ===== OBJECTIONS DATA =====
const OBJECTIONS = [
  {
    category: "TRUST",
    objection: "I'm not interested / I've had too many solar companies at my door",
    psychology: "Solar fatigue is real. They've been approached multiple times and the repetition breeds skepticism. This is exhaustion, not rejection of solar itself.",
    rebuttal: "Acknowledge it directly and don't fight it. 'I completely get that — I'd feel the same way. I'll be quick. The one thing most of those companies probably didn't leave you with is a free custom design built for your specific roof. It takes me 2 minutes to show you why that matters. If you still want me gone after that, I'm gone.' The goal is a 2-minute window, not a sale at the door.",
    nySpin: "Mention you're specifically here about National Grid / NYSEG's recent rate increases — not generic solar. This reframes you as responding to a local urgency, not doing a generic pitch.",
  },
  {
    category: "FINANCIAL",
    objection: "It's too expensive / I can't afford it",
    psychology: "Upfront cost anchoring. They're imagining writing a check for $25,000. They don't know about zero-down options.",
    rebuttal: "Never quote a price at the door. Pivot immediately to financing. 'Most people I talk to say the same thing — and they're surprised to find out there's actually a $0-down path where your monthly payment is lower than what you're already paying the utility. That's it. No big check. We're just rerouting where your electricity payment goes.' Then ask what they're paying monthly on their bill.",
    nySpin: "With NYSEG/National Grid rates climbing 10–28%, the 'cost' of doing nothing is now higher than the cost of solar. Frame it as: 'The question isn't can you afford solar — it's can you afford another 5 years of rate hikes?'",
  },
  {
    category: "FINANCIAL",
    objection: "I just refinanced / took out a loan / can't take on more debt",
    psychology: "Debt aversion. They've conflated solar with another loan product.",
    rebuttal: "Separate solar from a personal loan. 'A solar lease isn't debt — it's a utility service agreement. You're paying for electricity, just at a fixed rate. Think of it like switching utility providers — no new debt on your credit, no new line on your mortgage. And unlike your current bill, the rate doesn't go up every year.' Then address the lease vs. loan distinction clearly.",
    nySpin: "Section 48E means leasing companies still capture the commercial tax credit and pass savings through to you. The lease path is arguably stronger now that the homeowner 30% credit expired.",
  },
  {
    category: "SKEPTICISM",
    objection: "My neighbor / friend got solar and it didn't save them money",
    psychology: "Social proof working against you. Second-hand experience is powerful. The system may have been undersized, badly sited, or promised unrealistic savings.",
    rebuttal: "Validate, then investigate. 'That's really important to hear — and honestly, it does happen. The two most common reasons are: the system was undersized for their usage, or their roof wasn't oriented right. Before I ever recommend anything, I do a site assessment — actual roof measurements, your utility bills, your usage patterns. If it doesn't pencil out, I'll tell you.' Ask if they know the company that did their neighbor's install.",
    nySpin: "Some older installs in upstate NY were pre-net metering optimization. If the neighbor installed before 2022, they may not have optimized for the CBC charge structure. Ask what utility they're on.",
  },
  {
    category: "SKEPTICISM",
    objection: "How do I know you / your company will still be around?",
    psychology: "Legitimate fear. Several large solar companies have gone bankrupt. This is not paranoia — it's informed caution.",
    rebuttal: "Don't dismiss it. 'That's a fair question and I'm glad you asked it. [Share local installer credentials, NYSERDA approval status, license numbers, BBB rating, years in business.] More importantly, the panels themselves are warranted by the manufacturer for 25 years — separate from us. Your interconnection agreement is with your utility, not us. I can show you the installer's NYSERDA-approved contractor listing before you sign anything.'",
    nySpin: "NYSERDA-approved contractor status is a filter — not every company qualifies. This is a legitimizing credential specific to New York that most homeowners don't know to ask about.",
  },
  {
    category: "TIMING",
    objection: "I need to think about it / talk to my spouse",
    psychology: "Decision deferral. Often a polite 'no' but sometimes genuine. The real issue is they don't have enough information to feel confident deciding.",
    rebuttal: "Never push for a same-day close at the door. 'Of course — I'd expect nothing less on a 25-year decision. Here's what I want to do: schedule a 30-minute sit-down where we can put the actual numbers on paper together — you, your spouse, and me. No pressure, no contract. Just real numbers. If it doesn't work, we both walk away. Would Thursday evening or Saturday morning work better?'",
    nySpin: "The 20-year net metering rate lock is a genuine urgency point — once NY transitions to VDER as the default, locking in is off the table. Frame this as: 'The one thing I'd mention is there's a real window right now on locking in the 1-to-1 net metering rate for 20 years. Your spouse should hear that part too.'",
  },
  {
    category: "TIMING",
    objection: "We might sell the house / we're planning to move",
    psychology: "Investment horizon concern. They assume the investment won't transfer or will complicate a sale.",
    rebuttal: "Solar is a selling feature. 'Studies consistently show homes with solar sell for about 4–7% more and spend fewer days on market. The system either transfers to the buyer or the agreement gets wrapped into the sale. Either way, it's an asset — not a complication. Zillow and Redfin now flag solar in listings as a premium feature.' Ask their timeline — even 3 years of savings plus a bump in sale price often beats waiting.",
    nySpin: "Property tax exemption under RPT §487 means the added home value doesn't increase their property tax assessment for 15 years — a unique NY benefit that makes solar a low-risk home improvement.",
  },
  {
    category: "TECHNICAL",
    objection: "My roof is too old / I need a new roof first",
    psychology: "Valid practical concern. They don't want to pay to remove and reinstall panels.",
    rebuttal: "Validate and offer a path. 'That's exactly the right thing to flag, and I'll tell you upfront — if your roof genuinely needs to be replaced first, we'll say so and we can time the solar install right after. In some cases, we can partner with roofers and bundle the projects. What we never want to do is put panels on a roof that's going to need work in 3 years.' Then note that most lenders or lease companies require a roof assessment anyway.",
    nySpin: "Upstate NY roofs take a beating from ice and snow. A 12–15 year old roof in this climate deserves a real look. Position this as responsible, not as a barrier.",
  },
  {
    category: "POLITICAL/IDEOLOGICAL",
    objection: "Solar is a government subsidy scam / I don't believe in it",
    psychology: "Deeply held worldview. Don't argue climate or politics. Pivot entirely to economics and property rights.",
    rebuttal: "Don't take the bait on ideology. 'I'm not here to talk about any of that — I'm just here to talk about your electricity bill. Your bill went up again this year, right? National Grid/NYSEG raised rates. That's a fact independent of politics. Solar, for whatever reason you want to call it, puts a power generator on your property that you or your installer owns. Your bill goes down. That's math, not politics.' If they're hostile to government programs, emphasize purchase/ownership paths over incentives.",
    nySpin: "Frame solar as energy independence, not environmentalism. 'You're not relying on the utility anymore. You generate your own power. That's about as self-sufficient as it gets.'",
  },
  {
    category: "AESTHETICS/HOA",
    objection: "Panels will look bad / hurt my home value",
    psychology: "Pride of ownership and fear of depreciation. Often neighbors or HOA influence.",
    rebuttal: "Acknowledge it's a real consideration. 'The technology has come a long way — all-black panels are far more subtle than the old blue-silver look. And we have data showing solar homes in upstate NY sell for more, not less. I can show you actual before-and-after photos of systems on homes in this neighborhood.' If HOA is a concern, note that New York State has strong solar access laws that limit HOA restrictions.",
    nySpin: "New York State law limits HOAs from outright banning solar (NY General Business Law § 198-a). HOAs can regulate placement but cannot prohibit installation.",
  },
  {
    category: "NET METERING CONFUSION",
    objection: "Will I really have no electric bill? My neighbor still pays something.",
    psychology: "Expectation mismatch. Common misconception that solar eliminates all charges.",
    rebuttal: "Be honest upfront. 'Your neighbor is right — there's always a small connection fee to the grid. In upstate NY, National Grid and NYSEG charge a basic service fee of about $19–22/month that's unavoidable. But your energy charges — the actual electricity you use — can go to near zero. So instead of a $200/month bill, most customers see something like $20–25. The net metering program is what makes that possible: every kWh you send to the grid in summer becomes a credit that offsets your winter usage.'",
    nySpin: "The CBC charge ($0.30–$1.33/kW/month) is an additional small fee for net metering customers in NY — be upfront about this. Hiding it kills trust.",
  },
];
