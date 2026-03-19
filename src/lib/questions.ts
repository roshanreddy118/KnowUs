export const RELATIONSHIP_OPTIONS = [
  { value: "friends", label: "Friends" },
  { value: "couple", label: "Couple" },
  { value: "married", label: "Married" },
  { value: "family", label: "Family" },
  { value: "siblings", label: "Siblings" },
  { value: "mixed", label: "Mixed group" },
];

export const SAMPLE_TOPICS = [
  "Food habits",
  "Travel dreams",
  "Funny truths",
  "Daily routines",
  "Values and priorities",
  "Relationship dynamics",
];

const COMMON_QUESTIONS = [
  "What kind of plan would this person say yes to without much thinking?",
  "What usually improves this person's mood the fastest?",
  "What does this person value more right now: comfort, growth, or fun?",
  "What small habit says the most about this person's personality?",
  "What kind of trip would this person choose first?",
  "What usually drains this person's energy the quickest?",
  "What kind of surprise would make this person genuinely happy?",
  "What does this person care about more: being understood or being supported?",
  "What makes this person feel respected?",
  "What makes this person feel misunderstood?",
  "What would this person likely spend extra money on without regret?",
  "What kind of environment helps this person relax most?",
  "What topic can easily pull this person into a long conversation?",
  "What type of social setting suits this person best?",
  "What matters more to this person: honesty, loyalty, or peace?",
  "What kind of compliment means the most to this person?",
  "What is this person's default mood in a group setting?",
  "What type of day would feel perfect to this person?",
  "What usually stresses this person more: uncertainty, conflict, or delay?",
  "What does this person need most on a bad day?",
  "What is something this person rarely asks for but appreciates deeply?",
  "What kind of gift would feel most personal to this person?",
  "What does this person usually do first when plans change suddenly?",
  "What kind of success matters most to this person right now?",
  "What would this person rather have more of this year: rest, adventure, or stability?",
  "What trait do people notice first about this person?",
  "What kind of conversation does this person enjoy most: deep, funny, or practical?",
  "What motivates this person more: encouragement, challenge, or responsibility?",
  "What kind of memory would make this person smile instantly?",
  "What does this person protect most strongly: time, energy, or relationships?",
];

const RELATIONSHIP_QUESTION_BANK: Record<string, string[]> = {
  friends: [
    "What would make this friend instantly say yes to a weekend hangout?",
    "If this friend needed cheering up tonight, what would help first?",
    "What kind of food plan fits this friend best: cafe, street food, or home comfort?",
    "What role does this friend naturally take in a group?",
    "What kind of joke would this friend laugh at the hardest?",
    "What is this friend's most reliable trait?",
    "What kind of message from you would mean the most to this friend today?",
    "What is the biggest sign that this friend is feeling low?",
    "What kind of trip vibe fits this friend most: chill, chaotic, or adventurous?",
    "What is one thing this friend always pretends not to care about but actually does?",
    "What kind of support does this friend appreciate from close friends?",
    "What makes this friend feel closest to people?",
    "What would this friend most likely organize for the group?",
    "What kind of last-minute plan would this friend enjoy most?",
    "What would this friend be best remembered for in the group?",
  ],
  couple: [
    "What feels more meaningful to this person: time, words, or surprises?",
    "Which kind of date would make this person happiest this month?",
    "What usually helps this person feel safe after a stressful day?",
    "What is one thing this person secretly wishes happened more often?",
    "What matters more during conflict to this person: quick repair or time to cool off?",
    "What type of affection does this person notice most quickly?",
    "What kind of quality time feels most natural to this person?",
    "What helps this person feel chosen in a relationship?",
    "What does this person need first during emotional stress: listening, advice, or space?",
    "What kind of routine would make this person feel more connected?",
    "What romantic gesture would feel most genuine to this person?",
    "What makes this person feel most secure with a partner?",
    "What part of a future together matters most to this person right now?",
    "What type of apology lands best with this person?",
    "What kind of conversation makes this person feel closest to you?",
  ],
  married: [
    "What kind of support would this person value most on a hard week?",
    "Which shared routine matters most to this person right now?",
    "What do they want more of this year: stability, adventure, or rest?",
    "What usually makes this person feel most appreciated at home?",
    "What family habit would this person protect first if life got busy?",
    "What type of teamwork matters most to this person in marriage?",
    "What home atmosphere helps this person feel calm?",
    "What kind of small daily effort means a lot to this person?",
    "What does this person want more from married life right now: fun, peace, or structure?",
    "What shared goal matters most to this person this year?",
    "What kind of reassurance helps this person during pressure?",
    "What makes this person feel most seen by their spouse?",
    "What part of home life does this person care about more than they say?",
    "What kind of evening feels most restorative to this person?",
    "What type of partnership makes this person feel strongest together?",
  ],
  family: [
    "What makes this person feel most respected in the family?",
    "Which tradition would this person never want to lose?",
    "What is this person's default role during stressful situations?",
    "What kind of celebration does this person enjoy most?",
    "What do they most often need but rarely ask for?",
    "What kind of support from family means the most to this person?",
    "What value does this person try hardest to protect in the family?",
    "What situation usually brings out the most emotion in this person?",
    "What kind of family moment matters most to this person?",
    "What kind of misunderstanding affects this person most deeply?",
    "What does this person contribute naturally to the family dynamic?",
    "What kind of family outing would this person enjoy most?",
    "What makes this person feel proud of the family?",
    "What kind of check-in from family feels most meaningful to this person?",
    "What does this person most want the family to remember about them?",
  ],
  siblings: [
    "Who is more likely to turn a normal day into chaos first?",
    "What memory would make this person laugh immediately?",
    "What kind of help do they actually appreciate from you?",
    "Which trait did they keep from childhood the most?",
    "What topic can always pull this person into a long conversation?",
    "What kind of teasing would this person enjoy and what crosses the line?",
    "What childhood role still fits this person today?",
    "What kind of support from a sibling means the most to this person?",
    "What type of shared memory would this person protect forever?",
    "What makes this person feel closest to a sibling?",
    "What kind of argument bothers this person least?",
    "What kind of argument bothers this person most?",
    "What is one thing this person still does exactly like they did years ago?",
    "What kind of surprise from a sibling would this person love?",
    "What quality makes this person a great sibling?",
  ],
  mixed: [
    "What kind of vibe does this person bring into a room most often?",
    "What would they spend extra money on without regret?",
    "What makes them feel understood fastest?",
    "How do they usually react when plans suddenly change?",
    "What is the simplest thing that always improves their mood?",
    "What kind of praise feels real to this person?",
    "What kind of company does this person enjoy most?",
    "What usually helps this person reset after a tiring day?",
    "What type of experience would this person choose over buying something new?",
    "What makes this person feel instantly at ease with others?",
    "What kind of choice does this person make faster than most people?",
    "What is this person's strongest social quality?",
    "What kind of loyalty matters most to this person?",
    "What kind of misunderstanding happens to this person often?",
    "What makes time with this person memorable?",
  ],
};

const QUESTION_BANK: Record<string, string[]> = Object.fromEntries(
  Object.entries(RELATIONSHIP_QUESTION_BANK).map(([relationship, questions]) => [
    relationship,
    [...COMMON_QUESTIONS, ...questions],
  ]),
);

export function getQuestionsForRelationship(relationshipType: string) {
  return QUESTION_BANK[relationshipType] ?? QUESTION_BANK.mixed;
}

export function getRelationshipLabel(value: string) {
  return (
    RELATIONSHIP_OPTIONS.find((option) => option.value === value)?.label ??
    "Mixed group"
  );
}

export function getRandomQuestionSet(
  relationshipType: string,
  totalQuestions = 5,
  excludedQuestions: string[] = [],
) {
  const excluded = new Set(excludedQuestions);
  const availableQuestions = getQuestionsForRelationship(relationshipType).filter(
    (question) => !excluded.has(question),
  );
  const questions =
    availableQuestions.length >= totalQuestions
      ? [...availableQuestions]
      : [...getQuestionsForRelationship(relationshipType)];

  for (let index = questions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [questions[index], questions[randomIndex]] = [
      questions[randomIndex],
      questions[index],
    ];
  }

  return questions.slice(0, totalQuestions);
}
