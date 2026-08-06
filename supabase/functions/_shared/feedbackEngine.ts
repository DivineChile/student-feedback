const POSITIVE_KEYWORDS = {
  good: 2,
  excellent: 3,
  great: 3,
  helpful: 2,
  clean: 2,
  fast: 2,
  satisfied: 2,
  effective: 2,
  appreciate: 2,
  comfortable: 2,
  reliable: 2,
  amazing: 3,
  nice: 1,
  supportive: 2,
  improved: 2,
  working: 1,
  functional: 1,
  organized: 2,
};

const NEGATIVE_KEYWORDS = {
  poor: -2,
  bad: -2,
  terrible: -3,
  dirty: -2,
  broken: -3,
  late: -2,
  slow: -2,
  missing: -2,
  unfair: -3,
  unsafe: -3,
  problem: -2,
  issue: -1,
  uncomfortable: -2,
  hot: -1,
  worst: -3,
  inadequate: -2,
  unreliable: -2,
  difficult: -1,
  frustrating: -2,
  delay: -2,
  damaged: -3,
  faulty: -3,
  cracked: -2,
  leaking: -2,
  outdated: -2,
  insufficient: -2,
  overcrowded: -2,
  unusable: -3,
  torn: -2,
  rusty: -2,
  faded: -1,
  deteriorated: -3,
};

const POSITIVE_PHRASES = {
  "very good": 3,
  "works well": 2,
  "very helpful": 3,
  "well organized": 2,
  "clean environment": 2,
  "fast response": 2,
  "in good condition": 2,
  "highly effective": 3,
};

const NEGATIVE_PHRASES = {
  "not working": -3,
  "does not work": -3,
  "too slow": -3,
  "very bad": -3,
  "no light": -2,
  "no water": -3,
  "very late": -2,
  "not clean": -2,
  "poor condition": -2,
  "misses classes": -3,
  "worn out": -3,
  "completely worn out": -4,
  "badly maintained": -3,
  "falling apart": -4,
  "not functional": -3,
  "too hot": -2,
  "too crowded": -2,
  "inadequate facilities": -3,
  "poor ventilation": -3,
  "not usable": -3,
};

const NEGATION_WORDS = ["not", "never", "no", "hardly"];
const INTENSIFIERS = {
  very: 1,
  extremely: 2,
  completely: 2,
  seriously: 1,
  highly: 1,
};

function normalizeText(text) {
  return text.toLowerCase().trim();
}

function tokenize(text) {
  return normalizeText(text)
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function countPhraseScore(text) {
  let score = 0;

  for (const [phrase, weight] of Object.entries(POSITIVE_PHRASES)) {
    if (text.includes(phrase)) {
      score += weight;
    }
  }

  for (const [phrase, weight] of Object.entries(NEGATIVE_PHRASES)) {
    if (text.includes(phrase)) {
      score += weight;
    }
  }

  return score;
}

function countKeywordScore(tokens) {
  let score = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const previousWord = i > 0 ? tokens[i - 1] : "";
    const previousTwoWords = i > 1 ? `${tokens[i - 2]} ${tokens[i - 1]}` : "";
    const hasNegation = NEGATION_WORDS.includes(previousWord);

    let multiplier = 1;

    if (previousWord in INTENSIFIERS) {
      multiplier += INTENSIFIERS[previousWord];
    }

    if (tokens[i - 2] in INTENSIFIERS) {
      multiplier += 0.5;
    }

    if (word in POSITIVE_KEYWORDS) {
      const baseScore = POSITIVE_KEYWORDS[word] * multiplier;
      score += hasNegation ? -baseScore : baseScore;
    }

    if (word in NEGATIVE_KEYWORDS) {
      const baseScore = Math.abs(NEGATIVE_KEYWORDS[word]) * multiplier;
      score += hasNegation ? baseScore : -baseScore;
    }

    // small contextual penalty for institutional deterioration phrases
    if (
      ["whiteboard", "whiteboards", "projector", "chairs", "chair", "desks", "desk", "fan", "fans", "toilet", "hostel", "lab", "library", "classroom"].includes(word) &&
      ["worn", "broken", "faulty", "damaged", "dirty", "cracked", "outdated"].includes(previousWord)
    ) {
      score -= 2;
    }

    if (
      previousTwoWords === "worn out" &&
      ["whiteboard", "whiteboards", "chairs", "desks", "equipment"].includes(word)
    ) {
      score -= 2;
    }
  }

  return score;
}

function calculateConfidence(score) {
  const absoluteScore = Math.abs(score);

  if (absoluteScore >= 8) return 0.92;
  if (absoluteScore >= 6) return 0.88;
  if (absoluteScore >= 4) return 0.8;
  if (absoluteScore >= 2) return 0.7;
  if (absoluteScore >= 1) return 0.6;

  return 0.5;
}

export function detectSentiment(text) {
  const normalizedText = normalizeText(text);
  const tokens = tokenize(text);

  const phraseScore = countPhraseScore(normalizedText);
  const keywordScore = countKeywordScore(tokens);
  const totalScore = phraseScore + keywordScore;

  let sentiment = "neutral";

  if (totalScore > 0) {
    sentiment = "positive";
  } else if (totalScore < 0) {
    sentiment = "negative";
  }

  return {
    sentiment,
    confidence: calculateConfidence(totalScore),
    score: totalScore,
  };
}

export function generateSystemResponse(category, sentiment, confidence) {
  const normalizedCategory = category.trim().toLowerCase();
  const highConfidence = confidence >= 0.8;

  if (sentiment === "positive") {
    return highConfidence
      ? "Thank you for your positive feedback. We appreciate your experience and your submission has been recorded."
      : "Thank you for your feedback. We appreciate you taking the time to share your experience.";
  }

  if (sentiment === "neutral") {
    return "Thank you for your feedback. Your submission has been recorded successfully and will be reviewed.";
  }

  if (normalizedCategory === "academics") {
    return "Your academic concern has been received and recorded for review by the relevant department.";
  }

  if (normalizedCategory === "lecturers") {
    return "Thank you for your feedback regarding a lecturer. Your submission has been recorded and will be reviewed appropriately.";
  }

  if (normalizedCategory === "facilities") {
    return "Thank you for reporting this facilities issue. Your feedback has been recorded and will be reviewed by the appropriate unit.";
  }

  if (normalizedCategory === "administration") {
    return "Thank you for sharing this administrative concern. It has been logged and will be reviewed accordingly.";
  }

  if (normalizedCategory === "hostel") {
    return "Thank you for reporting this hostel-related issue. Your submission has been recorded for further review.";
  }

  if (normalizedCategory === "security") {
    return "Thank you for reporting this security concern. Your feedback has been logged and will be treated with attention.";
  }

  return "Thank you for your feedback. Your submission has been recorded and will be reviewed by the appropriate unit.";
}

export function processFeedback(category, title, comment) {
  const combinedText = `${title} ${comment}`.trim();
  const { sentiment, confidence, score } = detectSentiment(combinedText);
  const systemResponse = generateSystemResponse(category, sentiment, confidence);

  return {
    sentiment,
    confidence,
    score,
    systemResponse,
  };
}
