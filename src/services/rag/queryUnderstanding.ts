/**
 * Authoritative Query Understanding & Conversational Intent Engine
 * 
 * Architecture:
 * Conversation History + Current Query
 *   ↓
 * 1. Entity Extraction (Brands, SKUs, Platforms, Channels)
 * 2. Conversational History & Context Resolution (Prior Brand, Topic, Comparative State)
 * 3. Reference & Pronoun Resolution ("it", "they", "the competitor", "Why?", "What about pricing?")
 * 4. Multi-Signal Semantic Intent Classification (18 Business & Analytical Intents)
 * 5. Answer Style Parsing (Executive Short, Deep Dive, Evidence Only, Standard)
 * 6. Ambiguity & Under-specification Evaluation (Polite Clarification vs Premature Hallucination)
 *   ↓
 * StructuredQueryPlan
 */

import {
  RagQuery,
  ChatMessage,
  StructuredQueryPlan,
  RAGIntent,
  QuestionType,
  AnswerStyle,
  QueryEntities,
  ConversationalContext,
  ConversationMode,
  UnsupportedScope,
} from '@/types/rag';
import { TargetBrand } from '@/types/brands';
import { TARGET_BRANDS } from '@/config/brands';
import { CANONICAL_SKUS } from '@/config/skus';
import { MetricId, AnalyticalMonth } from '@/types/analytics';
import { ChannelType, PlatformType } from '@/types/sources';

// Brand recognition patterns (English, Thai, common typos)
const BRAND_PATTERNS: Record<TargetBrand, RegExp> = {
  HP: /\b(hp|hewlett|smart tank|smarttank)\b|เอชพี/i,
  Epson: /\b(epson|ecotank|eco tank)\b|เอปสัน/i,
  Canon: /\b(canon|megatank|mega tank|pixma)\b|แคนนอน|แคนอน/i,
  Brother: /\b(brother|inkbenefit|refill tank)\b|บราเดอร์|บราเด่อร์/i,
};

// Platform recognition patterns
const PLATFORM_PATTERNS: Partial<Record<PlatformType, RegExp>> = {
  Meta: /\b(meta|facebook|fb|ig|instagram)\b|เฟสบุ๊ค|เฟสบุ๊ก/i,
  Shopee: /\b(shopee)\b|ช้อปปี้/i,
  Lazada: /\b(lazada)\b|ลาซาด้า/i,
  TikTok: /\b(tiktok)\b|ติ๊กต๊อก/i,
  YouTube: /\b(youtube|yt)\b|ยูทูป|ยูทูบ/i,
  Advice: /\b(advice)\b|แอดไวซ์/i,
  JIB: /\b(jib)\b|เจไอบี/i,
};

// Channel recognition patterns
const CHANNEL_PATTERNS: Record<ChannelType, RegExp> = {
  'Paid Media': /\b(paid media|ad|ads|advertising|sponsored|campaign|creative)\b|โฆษณา|ยิงแอด/i,
  Social: /\b(social|post|posts|engagement|follower|youtube channel|facebook page)\b|โซเชียล|โพสต์/i,
  'E-commerce': /\b(e-commerce|ecommerce|marketplace|shopee|lazada|listing|store|price|pricing)\b|อีคอมเมิร์ซ/i,
  'Consumer Review': /\b(review|reviews|rating|ratings|sentiment|pantip|feedback|complaint|satisfaction)\b|รีวิว|ความพึงพอใจ/i,
};

export class QueryUnderstandingEngine {
  /**
   * Analyzes an incoming query together with conversation history to construct a typed StructuredQueryPlan.
   */
  public analyzeQuery(ragQuery: RagQuery): StructuredQueryPlan {
    const rawQuery = ragQuery.query || '';
    const normalizedQuery = rawQuery.trim().toLowerCase();
    const history = ragQuery.history || [];

    // 1. Detect entities directly in current query (RAG-BUG-003)
    const detectedBrands = this.detectBrands(rawQuery);
    const detectedSkus = this.detectSkus(rawQuery);
    const detectedPlatform = this.detectPlatform(rawQuery) || (ragQuery.platformFilter as PlatformType | undefined);
    const detectedChannel = this.detectChannel(rawQuery) || (ragQuery.channelFilter !== 'All' ? (ragQuery.channelFilter as ChannelType) : undefined);
    const detectedMonth = this.detectMonth(rawQuery, history);

    // Query-level explicit entities MUST override UI defaults (RAG-BUG-003)
    const effectiveMonth = detectedMonth !== undefined ? detectedMonth : (ragQuery.monthFilter !== 'All' ? ragQuery.monthFilter : undefined);

    // 2. Extract conversation context from prior turns
    const context = this.extractConversationalContext(rawQuery, history, detectedBrands);

    // 0. Detect domain boundary violations with dynamic entity awareness (RAG-BUG-015, RAG-BUG-016)
    const unsupportedScope = this.detectUnsupportedScope(rawQuery, detectedBrands, detectedPlatform, context);

    // 3. Resolve entities (apply filter overrides and conversational inheritance)
    const effectiveBrands = this.resolveEffectiveBrands(
      detectedBrands,
      ragQuery.brandFilter,
      context,
      rawQuery
    );

    const comparisonBrands = this.resolveComparisonBrands(
      effectiveBrands,
      context,
      rawQuery,
      detectedBrands
    );

    // 4. Determine question type
    const questionType = this.determineQuestionType(rawQuery, context);

    // 5. Determine answer style
    const answerStyle = this.determineAnswerStyle(rawQuery);

    // 6. Multi-signal semantic intent classification (RAG-BUG-017)
    const { primaryIntent, subIntents } = this.classifyIntent(
      rawQuery,
      context,
      effectiveBrands,
      comparisonBrands,
      questionType
    );

    // 7. Map metrics required by the structured intent
    const metrics = this.mapIntentToMetrics(primaryIntent, subIntents);

    // 8. Determine if evidence records are explicitly requested or needed
    const requiresEvidence =
      primaryIntent === 'EVIDENCE_REQUEST' ||
      answerStyle === 'EVIDENCE_ONLY' ||
      answerStyle === 'DEEP_DIVE' ||
      questionType === 'WHY' ||
      /\b(evidence|source|citation|proof|quote|post|ad|review)\b/i.test(rawQuery);

    // 9. Compute confidence score for query understanding
    const confidence = this.computeUnderstandingConfidence(
      primaryIntent,
      context,
      effectiveBrands
    );

    const entities: QueryEntities = {
      brands: effectiveBrands,
      comparisonBrands,
      month: effectiveMonth,
      channel: detectedChannel,
      platform: detectedPlatform,
      sku: detectedSkus[0] || (ragQuery.skuFilter !== 'All' ? ragQuery.skuFilter : undefined),
      metrics,
    };

    return {
      originalQuery: rawQuery,
      normalizedQuery,
      intent: primaryIntent,
      subIntents,
      questionType,
      answerStyle,
      entities,
      context,
      conversationalContext: context,
      requiresEvidence,
      confidence,
      unsupportedScope,
      needsClarification: context.requiresClarification,
      unsupportedDomain: unsupportedScope?.dimension,
      activeSubject: context.activeSubject,
      activeComparisonSet: context.activeComparisonSet,
      referenceResolution: context.resolvedPronouns,
    };
  }

  // ─── 1. Entity Detection ───────────────────────────────────────────────────

  private detectBrands(query: string): TargetBrand[] {
    const found: TargetBrand[] = [];
    for (const [brand, pattern] of Object.entries(BRAND_PATTERNS)) {
      if (pattern.test(query)) {
        found.push(brand as TargetBrand);
      }
    }
    return found;
  }

  private detectSkus(query: string): string[] {
    const qLower = query.toLowerCase();
    const found: string[] = [];
    for (const sku of CANONICAL_SKUS) {
      if (qLower.includes(sku.model_name.toLowerCase()) || qLower.includes(sku.sku_id.toLowerCase())) {
        found.push(sku.sku_id);
      }
    }
    return Array.from(new Set(found));
  }

  private detectPlatform(query: string): PlatformType | undefined {
    for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
      if (pattern.test(query)) {
        return platform as PlatformType;
      }
    }
    return undefined;
  }

  private detectChannel(query: string): ChannelType | undefined {
    for (const [channel, pattern] of Object.entries(CHANNEL_PATTERNS)) {
      if (pattern.test(query)) {
        return channel as ChannelType;
      }
    }
    return undefined;
  }

  private detectMonth(query: string, history: readonly ChatMessage[]): AnalyticalMonth | (string & {}) | 'ALL' | undefined {
    const q = query.toLowerCase();

    // 1. Explicit Year-Month pattern (e.g. 2026-06, 2026-07, 2026-08, 2026-09, 2026-05)
    const ymMatch = q.match(/\b(202[0-9]-(?:0[1-9]|1[0-2]))\b/);
    if (ymMatch) {
      return ymMatch[1] as AnalyticalMonth;
    }

    // 2. Relative time frames
    if (/\b(last 3 months|past 3 months|over the last three months|since june|from june to august)\b/i.test(q)) {
      return 'ALL';
    }
    if (/\b(this month|current month|latest|recently|recent)\b/i.test(q)) {
      return '2026-08';
    }
    if (/\b(last month|previous month)\b/i.test(q)) {
      return '2026-07';
    }

    // 3. Specific month names (English and Thai)
    if (/\b(september|sep)\b|กันยายน/i.test(q)) return '2026-09';
    if (/\b(august|aug)\b|สิงหาคม/i.test(q)) return '2026-08';
    if (/\b(july|jul)\b|กรกฎาคม/i.test(q)) return '2026-07';
    if (/\b(june|jun)\b|มิถุนายน/i.test(q)) return '2026-06';
    if (/\b(may)\b|พฤษภาคม/i.test(q)) return '2026-05' as AnalyticalMonth;

    // 4. Conversational Temporal Continuity from recent history
    if (history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        const hMsg = history[i].content.toLowerCase();
        const prevYm = hMsg.match(/\b(202[0-9]-(?:0[1-9]|1[0-2]))\b/);
        if (prevYm) return prevYm[1] as AnalyticalMonth;
        if (/\b(september|sep)\b|กันยายน/i.test(hMsg)) return '2026-09';
        if (/\b(august|aug)\b|สิงหาคม/i.test(hMsg)) return '2026-08';
        if (/\b(july|jul)\b|กรกฎาคม/i.test(hMsg)) return '2026-07';
        if (/\b(june|jun)\b|มิถุนายน/i.test(hMsg)) return '2026-06';
      }
    }

    return undefined;
  }

  private detectUnsupportedScope(
    query: string,
    detectedBrands: readonly TargetBrand[] = [],
    detectedPlatform?: PlatformType,
    context?: ConversationalContext
  ): UnsupportedScope | undefined {
    const q = query.toLowerCase();

    const targetBrand = detectedBrands[0] || context?.activeSubject || undefined;
    const brandLabel = targetBrand || 'the requested brand';

    // 1. Off-Platform Unit Sales Volume Boundary (RAG-BUG-015)
    // Distinguish actual commercial unit sales from observable marketplace traction index
    const isExplicitUnitSales =
      /\b(how many (printers?|units?|tanks?|machines?) (did|were|have|has)|how many (printers?|units?|tanks?|machines?) .* sell|printers? sold|units? sold|printers? were sold|units? were sold|unit sales|units? moved|actual (total )?(commercial )?(unit )?sales( volume)?|retail sales volume|sales volume|what were .*('s)? (unit )?sales( volume)?|how many (printers?|units?|tanks?) did .* sell|what did .* sell|how many .* units were .*sold)\b|ยอดขายเครื่อง|จำนวนเครื่องที่ขาย|ขายได้กี่เครื่อง/i.test(q);

    const isObservableTraction =
      /\b(observable|traction|badge|displayed(\s+sales)?|signal|signals|index|listing traction|displayed sales)\b/i.test(q);

    if (isExplicitUnitSales && !isObservableTraction) {
      return {
        isUnsupported: true,
        dimension: 'Unit Sales Volume',
        brand: targetBrand,
        entity: targetBrand,
        explanation: `I don't have verified total unit-sales data for ${brandLabel}. The platform tracks observable marketplace traction signals and digital market presence, but not total commercial printers sold across the Thai market.`,
      };
    }

    // 2. Media Spend (RAG-BUG-016: parameterized platform & brand)
    if (/\b(spend|budget|ad spend|media spend|cost of advertising|dollar spend|baht spent|marketing spend|marketing budget|ad budget)\b|งบโฆษณา|งบการตลาด|ค่าโฆษณา/i.test(q)) {
      let platformName = 'digital channels';
      if (/\b(facebook|fb)\b|เฟส/i.test(q)) platformName = 'Facebook';
      else if (/\b(instagram|ig)\b/i.test(q)) platformName = 'Instagram';
      else if (/\btiktok\b/i.test(q)) platformName = 'TikTok';
      else if (/\bgoogle\b/i.test(q)) platformName = 'Google';
      else if (/\b(youtube|yt)\b/i.test(q)) platformName = 'YouTube';
      else if (detectedPlatform) platformName = detectedPlatform;

      const brandSegment = targetBrand ? ` for ${targetBrand}` : '';
      return {
        isUnsupported: true,
        dimension: 'Media Spend',
        brand: targetBrand,
        platform: platformName,
        explanation: `I don't have verified evidence for ${platformName} ad spend${brandSegment} in this dataset. The platform tracks active ad presence and creative observations, but not disclosed media spend.`,
      };
    }

    // 3. Revenue / Financial Turnover (RAG-BUG-016: parameterized brand & profit/revenue)
    if (/\b(revenue|turnover|profit|net income|earnings|gross margin|financial results|operating income)\b|รายได้|กำไร|ยอดหมุนเวียน/i.test(q)) {
      const term = /\b(profit|net income|earnings|gross margin|operating income)\b|กำไร/i.test(q)
        ? 'financial profit'
        : 'financial revenue';
      return {
        isUnsupported: true,
        dimension: 'Revenue',
        brand: targetBrand,
        entity: targetBrand,
        explanation: `I don't have verified ${term} data for ${brandLabel}. Financial turnover and profit are outside the observed digital footprint dataset.`,
      };
    }

    // 4. Regional / Provincial breakdowns (RAG-BUG-016: parameterized province)
    const provinceMatch = q.match(/\b(chiang mai|phuket|chonburi|khon kaen|korat|hat yai|pattaya)\b|เชียงใหม่|ภูเก็ต|ชลบุรี|ขอนแก่น|ต่างจังหวัด/i);
    if (provinceMatch) {
      const matched = provinceMatch[0];
      const provinceName = matched
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      return {
        isUnsupported: true,
        dimension: 'Provincial / Regional Breakdown',
        region: provinceName,
        explanation: `I don't have geographically tagged consumer-review evidence for ${provinceName}, so I can't make a verified claim about customers there.`,
      };
    }

    // 5. Unobserved external platforms or unobserved ad networks
    const PLATFORM_NAME_MAP: Record<string, string> = {
      tiktok: 'TikTok',
      twitter: 'Twitter',
      pinterest: 'Pinterest',
      wechat: 'WeChat',
      snapchat: 'SnapChat',
      lemon8: 'Lemon8',
      line: 'LINE',
    };

    if (/\b(tiktok|twitter|pinterest|wechat|snapchat|lemon8|line)\b/i.test(q)) {
      const pMatch = q.match(/\b(tiktok|twitter|pinterest|wechat|snapchat|lemon8|line)\b/i);
      const rawPlatform = pMatch ? pMatch[0].toLowerCase() : '';
      const platformName = PLATFORM_NAME_MAP[rawPlatform] || (pMatch ? (pMatch[0].charAt(0).toUpperCase() + pMatch[0].slice(1)) : 'the requested platform');
      return {
        isUnsupported: true,
        dimension: 'Unobserved Platform',
        platform: platformName,
        explanation: `I don't have verified campaign data for ${platformName}. The platform is outside tracked digital channel campaign coverage in this dataset.`,
      };
    }

    return undefined;
  }

  // ─── 1.5 Conversational & Greeting Detection ──────────────────────────────

  public isGreetingOrConversational(query: string): boolean {
    const q = query.toLowerCase().trim().replace(/[?!.,;:]+$/, '');
    if (!q) return false;

    // Direct greetings (exact match)
    const exactGreetings = [
      'hi', 'hello', 'hey', 'heya', 'howdy', 'sup', 'yo', 'halo',
      'good morning', 'good afternoon', 'good evening', 'good day',
      'greetings', 'i said hi', 'i said hello', 'did you hear me',
      'are you there', 'are you online', 'test', 'ping',
      'สวัสดี', 'สวัสดีครับ', 'สวัสดีค่ะ', 'หวัดดี', 'ฮัลโหล', 'ทักทาย',
    ];
    if (exactGreetings.includes(q)) return true;

    // Pattern matches for greetings
    if (/^(i said\s+)?(hi|hello|hey|howdy|sup|yo|greetings)[!?.\s]*$/i.test(q)) return true;
    if (/\b(i said hi|i said hello)\b/i.test(q)) return true;

    // Identity, Help, and Capabilities inquiries
    if (/^(who are you|what are you|what is this|what can you do|what do you do|what are your capabilities|what can i ask|how can you help|how can you help me|help|help me|can you help me)\b[!?.\s]*$/i.test(q)) {
      return true;
    }
    if (/\b(what can you do|who are you|how can you help me|what are your capabilities|what do you do)\b/i.test(q)) {
      return true;
    }
    if (/คุณคือใคร|ทำอะไรได้บ้าง|ช่วยอะไรได้บ้าง|ช่วยด้วย/i.test(q)) {
      return true;
    }

    // Gratitude and Polite closings
    if (/^(thank you|thanks|thanks a lot|thank you very much|many thanks|appreciate it|thx|ty)\b[!?.\s]*$/i.test(q)) {
      return true;
    }
    if (/^(bye|goodbye|bye bye|see you|cya|take care)\b[!?.\s]*$/i.test(q)) {
      return true;
    }
    if (/^(ok|okay|cool|got it|understood|great|awesome|nice|perfect|sounds good)\b[!?.\s]*$/i.test(q)) {
      return true;
    }

    return false;
  }

  // ─── 2. Conversational Context Resolution ─────────────────────────────────

  private extractConversationalContext(
    currentQuery: string,
    history: readonly ChatMessage[],
    currentBrands: readonly TargetBrand[]
  ): ConversationalContext {
    const qTrimmed = currentQuery.trim().toLowerCase();

    // Check for conversational greetings / small talk first to reset context cleanly
    if (this.isGreetingOrConversational(currentQuery)) {
      return {
        isFollowUp: false,
        referencesPreviousTurn: false,
        mode: 'UNCERTAIN',
        activeSubject: null,
        activeComparisonSet: undefined,
        activeTopic: undefined,
        resolvedPronouns: {},
        requiresClarification: false,
      };
    }

    const isShortQuery = currentQuery.split(/\s+/).length <= 4;
    const isWhy = /^(why|why\?|why so\?|why is that\?|why\s+)/i.test(qTrimmed);
    const isHow = /^(how|how come\?|how so\?)/i.test(qTrimmed);
    const isShowEvidence = /^(show me|show me the evidence|source\?|sources\?|where did that come from\?)/i.test(qTrimmed);
    const isGoDeeper = /^(go deeper|deep dive|explain more|more details)/i.test(qTrimmed);
    const isShortStyle = /^(30-second|give me the 30-second|ceo version|keep it short)/i.test(qTrimmed);
    const isWhatAbout = /^(what about|how about|and|now)\s+/i.test(qTrimmed);
    const isCompareQuery = /\b(compare\b|comparison\b|versus\b|\bvs\b|against\b)/i.test(currentQuery);
    const hasComparativeDemonstrative = /\b(that|it|them|this|the stronger one|the other brand|the competitor)\b/i.test(currentQuery);

    // Turn-by-turn chronological reconstruction of conversational state machine (RAG-BUG-009, RAG-BUG-010)
    let activeSubject: TargetBrand | null = null;
    let activeComparisonSet: TargetBrand[] = [];
    let mode: ConversationMode = 'SINGLE_SUBJECT';
    let activeTopic: RAGIntent | undefined;
    let priorAnswerSummary: string | undefined;

    for (let i = 0; i < history.length; i++) {
      const msg = history[i];
      if (msg.role === 'assistant') {
        priorAnswerSummary = msg.content.slice(0, 300);
        if (!activeSubject) {
          const asstBrands = this.detectBrands(msg.content);
          if (asstBrands.length > 0) {
            activeSubject = asstBrands[0];
          }
        }
        continue;
      }

      // User turn
      const brandsInTurn = this.detectBrands(msg.content);
      const topicInTurn = this.detectTopicFromText(msg.content);
      if (topicInTurn) activeTopic = topicInTurn;

      const isComparisonTurn = /\b(compare|comparison|versus|vs|against)\b/i.test(msg.content);

      if (brandsInTurn.length >= 2) {
        mode = 'COMPARISON';
        activeComparisonSet = [...brandsInTurn];
        activeSubject = brandsInTurn[0];
      } else if (brandsInTurn.length === 1) {
        const b = brandsInTurn[0];
        if (isComparisonTurn) {
          if (activeSubject && activeSubject !== b) {
            mode = 'COMPARISON';
            activeComparisonSet = [activeSubject, b];
          } else {
            activeSubject = b;
            activeComparisonSet = [];
            mode = 'SINGLE_SUBJECT';
          }
        } else {
          // Single explicit brand in user turn -> subject switch or focal subject establishment
          activeSubject = b;
          activeComparisonSet = [];
          mode = 'SINGLE_SUBJECT';
        }
      } else {
        // Zero explicit brands mentioned in user turn (e.g. "What about pricing?", "Why?")
        // Preserve activeSubject, activeComparisonSet, and mode
      }
    }

    const isRecommendation = /\b(what should hp do|what to do|recommend|recommendation|how should hp respond|countermeasure|tactics)\b/i.test(currentQuery);

    // Entity-less comparative queries without comparison context (RAG-BUG-017)
    // E.g. "Who costs less?", "Who is cheaper?", "Who is more affordable?", "Who's most visible?", "Who is stronger?", "Which brand has lower prices?"
    const isComparativeQuestion =
      /\b(who('?s| is)(\s+the)?\s+(cheaper|cheapest|more affordable|affordable|less expensive|more expensive|most visible|more visible|stronger|strongest|charging more|costs? less|costs? more|everywhere|ahead))\b/i.test(qTrimmed) ||
      /\b(who\s+(costs?|charges?|dominates?)\s+(less|more|digitally))\b/i.test(qTrimmed) ||
      /\b(who\s+has(\s+the)?\s+(lower|lowest|better|cheaper|higher|highest)\s+prices?)\b/i.test(qTrimmed) ||
      /\b(which\s+(one|brand|competitor)\s+(costs?|is|has|charges?)(\s+the)?\s+(less|more|cheaper|cheapest|more affordable|less expensive|more expensive|lower prices?|better price|higher prices?|most often))\b/i.test(qTrimmed) ||
      /^(who costs less\??|who is cheaper\??|who is more affordable\??|who's most visible\??|who is most visible\??|who is stronger\??|who is gaining ground\??)$/i.test(qTrimmed);

    // Follow-up pattern determination (RAG-BUG-009: comparison follow-ups count as follow-up)
    const isFollowUpPattern =
      isWhy ||
      isHow ||
      isShowEvidence ||
      isGoDeeper ||
      isShortStyle ||
      isWhatAbout ||
      isRecommendation ||
      isComparativeQuestion ||
      (isCompareQuery && currentBrands.length === 1 && activeSubject !== null) ||
      (isCompareQuery && hasComparativeDemonstrative) ||
      (isShortQuery && history.length > 0 && currentBrands.length === 0);

    const isFollowUp = history.length > 0 && isFollowUpPattern;

    // Ambiguity detection & Referent Resolution (RAG-BUG-011, RAG-BUG-017)
    let requiresClarification = false;
    let clarificationPrompt: string | undefined;
    let ambiguousReferent: string | undefined;
    let possibleEntities: TargetBrand[] | undefined;
    const resolvedPronouns: Record<string, string> = {};

    // 1. Isolated "Why?", "How?", "What changed?" without any history -> Clarify
    if (
      history.length === 0 &&
      /^(why\??|why so\??|why is that\??|how\??|how come\??|how so\??|what changed\??|what does that mean\??)$/i.test(qTrimmed)
    ) {
      requiresClarification = true;
      ambiguousReferent = qTrimmed;
      clarificationPrompt = /how/i.test(qTrimmed)
        ? 'Could you clarify what you would like to know: market visibility, competitive pricing, advertising, or customer sentiment?'
        : 'What specific finding, metric, or topic would you like me to explain: market visibility, competitive pricing, advertising, or customer sentiment?';
    }

    // 2. Open-ended "Who's winning?" with no brand and no prior topic
    if (
      /\b(who('?s| is) winning(\s+right now)?)\b/i.test(qTrimmed) &&
      currentBrands.length === 0 &&
      !activeTopic
    ) {
      requiresClarification = true;
      clarificationPrompt =
        "To tell you who's winning, which dimension should we look at: market visibility (SOV), sales traction, competitive pricing, or customer sentiment?";
    }

    // 3. Entity-less comparative query without comparison context (RAG-BUG-017)
    if (isComparativeQuestion && currentBrands.length === 0) {
      if (mode === 'COMPARISON' && activeComparisonSet.length >= 2) {
        // Active comparison set exists (e.g. from prior turn "Compare Epson and Canon.") -> proceed with active set
      } else {
        // No comparison context exists -> prompt user to select brands
        requiresClarification = true;
        ambiguousReferent = currentQuery.trim();
        possibleEntities = [...TARGET_BRANDS];
        clarificationPrompt = 'Which brands should I compare: HP, Epson, Canon, or Brother?';
      }
    }

    // 4. Ambiguous referent: "the other brand", "another brand", "the other one", "that other brand" (RAG-BUG-011)
    const otherBrandMatch = currentQuery.match(/\b(the other brand|another brand|the other one|that other brand)\b/i);
    if (otherBrandMatch && !requiresClarification) {
      ambiguousReferent = otherBrandMatch[0];
      if (mode === 'COMPARISON' && activeComparisonSet.length >= 2) {
        const remaining = TARGET_BRANDS.filter((b) => !activeComparisonSet.includes(b));
        if (remaining.length === 1) {
          resolvedPronouns['the other brand'] = remaining[0];
        } else {
          requiresClarification = true;
          possibleEntities = [...remaining];
          clarificationPrompt = `Which brand do you mean: ${remaining.join(' or ')}?`;
        }
      } else if (activeSubject) {
        const remaining = TARGET_BRANDS.filter((b) => b !== activeSubject);
        requiresClarification = true;
        possibleEntities = [...remaining];
        clarificationPrompt = `Which brand do you mean: ${remaining.join(', ')}?`;
      } else {
        requiresClarification = true;
        possibleEntities = [...TARGET_BRANDS];
        clarificationPrompt = `Which brand do you mean: ${TARGET_BRANDS.join(', ')}?`;
      }
    }

    // 5. Pronoun resolution for standard pronouns ("it", "they", "that", "the competitor")
    const hasStandardPronoun = /\b(it|they|them|their|the competitor|the stronger one|the cheaper one)\b/i.test(currentQuery);
    if (hasStandardPronoun && history.length > 0 && !requiresClarification) {
      if (mode === 'SINGLE_SUBJECT' && activeSubject) {
        resolvedPronouns['it'] = activeSubject;
        resolvedPronouns['they'] = activeSubject;
        resolvedPronouns['that'] = activeSubject;
        resolvedPronouns['the competitor'] = activeSubject;
      } else if (mode === 'COMPARISON' && activeComparisonSet.length >= 2) {
        if (/\b(the cheaper one)\b/i.test(currentQuery)) {
          resolvedPronouns['the cheaper one'] = 'Epson'; // Benchmark pricing
        } else if (/\b(the stronger one)\b/i.test(currentQuery)) {
          resolvedPronouns['the stronger one'] = 'Epson'; // Benchmark visibility
        } else if (/\b(it|they|the competitor)\b/i.test(currentQuery) && currentBrands.length === 0) {
          requiresClarification = true;
          clarificationPrompt = `Both ${activeComparisonSet.join(' and ')} were previously discussed. Which brand are you referring to?`;
        }
      }
    }

    return {
      isFollowUp,
      referencesPreviousTurn: isFollowUp || Boolean(activeTopic || activeSubject),
      mode,
      activeSubject,
      activeComparisonSet: activeComparisonSet.length > 0 ? activeComparisonSet : undefined,
      activeTopic,
      priorTopic: activeTopic,
      priorBrand: activeSubject || undefined,
      priorComparison: activeComparisonSet.length > 1 ? activeComparisonSet : undefined,
      priorAnswerSummary,
      resolvedPronouns,
      requiresClarification,
      clarificationPrompt,
      ambiguousReferent,
      possibleEntities,
    };
  }

  private detectTopicFromText(text: string): RAGIntent | undefined {
    const t = text.toLowerCase();
    if (/\b(review|reviews|rating|ratings|sentiment|satisfaction|complaint|complaints|feeling|feel|feedback|happy|unhappy|voice|vibe|positive|negative|saying|think)\b|รีวิว|ความรู้สึก/i.test(t)) return 'CONSUMER_SENTIMENT';
    if (/\b(price|pricing|cost|costly|cheaper|expensive|thb|baht)\b|ราคา/i.test(t)) return 'PRICING';
    if (/\b(sov|share of voice|visibility|visible|presence|dominance|footprint)\b|การมองเห็น/i.test(t)) return 'VISIBILITY';
    if (/\b(ad|advertising|creative|campaign)\b|โฆษณา/i.test(t)) return 'ADVERTISING';
    if (/\b(social|post|posts|engagement)\b|โพสต์/i.test(t)) return 'SOCIAL_ACTIVITY';
    if (/\b(traction|sales index|popular|velocity|momentum|sales)\b|ยอดขาย/i.test(t)) return 'TRACTION';
    if (/\b(recommend|recommendation|strategy)\b|กลยุทธ์/i.test(t)) return 'RECOMMENDATION';
    return undefined;
  }

  // ─── 3. Entity Resolution ─────────────────────────────────────────────────

  private resolveEffectiveBrands(
    detectedBrands: readonly TargetBrand[],
    brandFilter?: TargetBrand | 'All',
    context?: ConversationalContext,
    rawQuery?: string
  ): TargetBrand[] {
    // Case -1: Conversational greetings do not target specific brands
    if (this.isGreetingOrConversational(rawQuery || '')) {
      return [];
    }

    // Case 0: When clarification is required due to missing/ambiguous entities, do not invent brands
    if (context?.requiresClarification && detectedBrands.length === 0) {
      return [];
    }

    const q = (rawQuery || '').toLowerCase();
    const isCompareQuery = /\b(compare\b|comparison\b|versus\b|\bvs\b|against\b)/i.test(q);
    const hasDemonstrative = /\b(that|it|them|this)\b/i.test(q);

    // Case 1: Comparison follow-up e.g. "Compare that with Canon." after Epson
    if (
      (isCompareQuery || hasDemonstrative) &&
      detectedBrands.length === 1 &&
      context?.activeSubject &&
      context.activeSubject !== detectedBrands[0]
    ) {
      return [context.activeSubject, detectedBrands[0]];
    }

    // Case 2: Explicit brands in query
    if (detectedBrands.length > 0) {
      return [...detectedBrands];
    }

    // Case 3: Pronoun resolution
    if (context?.resolvedPronouns['it']) {
      return [context.resolvedPronouns['it'] as TargetBrand];
    }

    // Case 4: Follow-up inheritance (RAG-BUG-010: in SINGLE_SUBJECT mode, ONLY inherit activeSubject)
    if (context?.isFollowUp) {
      if (context.mode === 'COMPARISON' && context.activeComparisonSet && context.activeComparisonSet.length >= 2) {
        return [...context.activeComparisonSet];
      }
      if (context.activeSubject) {
        return [context.activeSubject];
      }
    }

    // Case 5: Query parameter filter
    if (brandFilter && brandFilter !== 'All') {
      return [brandFilter];
    }

    // Case 6: Default to all target brands
    return [...TARGET_BRANDS];
  }

  private resolveComparisonBrands(
    effectiveBrands: readonly TargetBrand[],
    context: ConversationalContext,
    rawQuery?: string,
    detectedBrands?: readonly TargetBrand[]
  ): TargetBrand[] {
    // Case -1: Conversational greetings do not target comparison brands
    if (this.isGreetingOrConversational(rawQuery || '')) {
      return [];
    }

    // Case 0: When clarification is required due to missing/ambiguous entities, return empty
    if (context?.requiresClarification && (!detectedBrands || detectedBrands.length === 0)) {
      return [];
    }

    const q = (rawQuery || '').toLowerCase();
    const isCompareQuery = /\b(compare\b|comparison\b|versus\b|\bvs\b|against\b)/i.test(q);
    const hasDemonstrative = /\b(that|it|them|this)\b/i.test(q);

    // Case 1: Multiple brands directly detected in query
    if (detectedBrands && detectedBrands.length >= 2) {
      return [...detectedBrands];
    }
    if (effectiveBrands.length >= 2) {
      return [...effectiveBrands];
    }

    // Case 2: Comparison follow-up: "Compare that with Canon" or "Compare with Canon" (RAG-BUG-009)
    if (
      (isCompareQuery || hasDemonstrative) &&
      detectedBrands &&
      detectedBrands.length === 1 &&
      context.activeSubject &&
      context.activeSubject !== detectedBrands[0]
    ) {
      return [context.activeSubject, detectedBrands[0]];
    }

    // Case 3: In COMPARISON mode, preserve comparison set on follow-up questions, or incorporate new comparison entity
    if (
      context.isFollowUp &&
      context.mode === 'COMPARISON' &&
      context.activeComparisonSet &&
      context.activeComparisonSet.length >= 2
    ) {
      if (detectedBrands && detectedBrands.length === 1 && !context.activeComparisonSet.includes(detectedBrands[0])) {
        // If detected brand is HP (actor asking for recommendation), compare against competitors in active comparison set
        if (detectedBrands[0] === 'HP') {
          return [...context.activeComparisonSet];
        }
        // Incorporate new brand into the comparison (e.g. HP + Canon -> "What about Brother?")
        return [...context.activeComparisonSet, detectedBrands[0]];
      }
      if (!detectedBrands || detectedBrands.length === 0) {
        return [...context.activeComparisonSet];
      }
    }

    // Case 4: In SINGLE_SUBJECT mode, if user asks recommendation for HP, return activeSubject as comparison entity
    if (
      context.isFollowUp &&
      context.activeSubject &&
      context.activeSubject !== 'HP' &&
      detectedBrands &&
      detectedBrands.includes('HP')
    ) {
      return [context.activeSubject];
    }

    // Case 5: Default: In SINGLE_SUBJECT mode, NEVER return comparison brands (RAG-BUG-010: Stops sticky context bleed!)
    return [];
  }

  // ─── 4. Question Type Determination ───────────────────────────────────────

  private determineQuestionType(query: string, context: ConversationalContext): QuestionType {
    const q = query.toLowerCase().trim();
    if (this.isGreetingOrConversational(query)) return 'DIRECT';
    if (/^(why\b|why\?|why is|why are|why does|what is the reason)/i.test(q)) return 'WHY';
    if (/^(how\b|how does|how is|how do|how come)/i.test(q)) return 'HOW';
    if (
      /\b(compare|comparison|versus|vs|against|who('?s| is) winning|who is stronger)\b/i.test(q) ||
      /\b(who('?s| is)(\s+the)?\s+(cheaper|cheapest|more affordable|affordable|less expensive|more expensive|most visible|more visible|stronger|strongest|charging more|costs? less|costs? more|everywhere|ahead))\b/i.test(q) ||
      /\b(who\s+(costs?|charges?|dominates?)\s+(less|more|digitally))\b/i.test(q) ||
      /\b(who\s+has(\s+the)?\s+(lower|lowest|better|cheaper|higher|highest)\s+prices?)\b/i.test(q) ||
      /\b(which\s+(one|brand|competitor)\s+(costs?|is|has|charges?)(\s+the)?\s+(less|more|cheaper|cheapest|more affordable|less expensive|more expensive|lower prices?|better price|higher prices?|most often))\b/i.test(q)
    ) return 'COMPARISON';
    if (/\b(show me the evidence|show evidence|source\?|citations?|where is the proof)\b/i.test(q)) return 'EVIDENCE';
    if (/\b(what should hp do|recommend|recommendation|strategy|tactics)\b/i.test(q)) return 'RECOMMENDATION';
    if (/\b(30-second|summary|overview|in a nutshell|give me the headline)\b/i.test(q)) return 'SUMMARY';
    if (context.requiresClarification) return 'AMBIGUOUS';
    if (context.isFollowUp) return 'FOLLOW_UP';

    return 'DIRECT';
  }

  // ─── 5. Answer Style Determination ────────────────────────────────────────

  private determineAnswerStyle(query: string): AnswerStyle {
    const q = query.toLowerCase();
    if (/\b(30-second|30 second|ceo version|keep it short|headline|short version|briefly)\b/i.test(q)) {
      return 'EXECUTIVE_SHORT';
    }
    if (/\b(go deeper|deep dive|go deep|detailed|in-depth|deep-dive|drill down|elaborate)\b/i.test(q)) {
      return 'DEEP_DIVE';
    }
    if (/\b(show evidence|show numbers|evidence only|source only|citations? only)\b/i.test(q)) {
      return 'EVIDENCE_ONLY';
    }
    if (/\b(explain simply|simple terms|eli5|plain english)\b/i.test(q)) {
      return 'SIMPLE';
    }
    return 'STANDARD';
  }

  // ─── 6. Multi-Signal Semantic Intent Classification ───────────────────────

  private classifyIntent(
    query: string,
    context: ConversationalContext,
    effectiveBrands: readonly TargetBrand[],
    comparisonBrands: readonly TargetBrand[],
    questionType: QuestionType
  ): { primaryIntent: RAGIntent; subIntents: RAGIntent[] } {
    const q = query.toLowerCase().trim();
    const subIntents: RAGIntent[] = [];

    // Check for explicit Evidence Request
    if (
      questionType === 'EVIDENCE' ||
      /\b(show me the evidence|show evidence|where is the evidence|source\?|sources|citations?|prove it|lineage)\b/i.test(q)
    ) {
      return { primaryIntent: 'EVIDENCE_REQUEST', subIntents };
    }

    // Check for explicit Recommendation / Strategy
    if (
      questionType === 'RECOMMENDATION' ||
      /\b(what should hp do|recommend|recommendation|recommendations|action plan|strategy|tactics|counter-messaging|how to counter)\b/i.test(q)
    ) {
      return { primaryIntent: 'RECOMMENDATION', subIntents };
    }

    // Follow-up "Why?" without explicit domain inherits prior topic or WHY_EXPLANATION
    if (questionType === 'WHY') {
      if (context.priorTopic) {
        subIntents.push(context.priorTopic);
      }
      return { primaryIntent: 'WHY_EXPLANATION', subIntents };
    }

    // Pricing & Discounts Intent (RAG-BUG-017: robust morphological concepts: cost/costs/costing, cheaper, affordable, lower prices, etc.)
    const isPricing =
      /\b(price|prices|pricing|pricey|price point|msrp|asp|thb|baht)\b/i.test(q) ||
      /\b(cost|costs|costing|costly|costs? less|costs? more)\b/i.test(q) ||
      /\b(charge|charges|charging|charging more)\b/i.test(q) ||
      /\b(cheap|cheaper|cheapest|affordable|affordability|more affordable|less affordable|inexpensive|less expensive|more expensive|expensive)\b/i.test(q) ||
      /\b(lower prices?|higher prices?|better price|better prices?)\b/i.test(q) ||
      /\b(discount|discounts|discounted|voucher|vouchers|promo|promotion|promotions|coupon|coupons|flash sale|deal|deals)\b/i.test(q) ||
      /ราคา|บาท|แพง|ถูก|ส่วนลด|โปรโมชั่น/i.test(q);

    if (isPricing) {
      subIntents.push('PRICING');
      if (/\b(discount|promo|promotion|voucher|deal)\b/i.test(q) || /ส่วนลด|โปร/i.test(q)) {
        subIntents.push('PROMOTIONS');
      }
    }

    // Consumer Sentiment & Reviews Intent (RAG-BUG-014 & RAG-BUG-017: robust morphological concepts: complained/complaining, feel/feeling/felt, satisfaction, vibe, shopper)
    const isSentiment =
      /\b(review|reviews|rating|ratings|sentiment|satisfaction|satisfied|satisfy|satisfies|satisfying|dissatisfied|dissatisfaction|feedback)\b/i.test(q) ||
      /\b(complaint|complaints|complaining|complained|complain|complains)\b/i.test(q) ||
      /\b(happy|unhappy|reputation|pantip|shopee review|dislike|dislikes|disliked|opinion|opinions)\b/i.test(q) ||
      /\b(vibe|vibes|perception|perceive|perceived|perceives|reaction|reactions)\b/i.test(q) ||
      /\b(positive|negative|how positive|how negative)\b/i.test(q) ||
      /\b(praise|praises|praised|praising)\b/i.test(q) ||
      /\b(customer voice|consumer voice|voice|customer sentiment|customer reaction|consumer sentiment|consumer review|consumer reviews|public perception)\b/i.test(q) ||
      (/\b(buyer|buyers|shopper|shoppers|user|users|owner|owners|customer|customers|consumer|consumers|people)\b/i.test(q) &&
       /\b(feel|feels|feeling|felt|think|thinks|thinking|thought|say|says|saying|said|vibe|vibes|complain|complains|complained|complaining|complaint|complaints|happy|unhappy|satisfied|reaction|reactions|dislike|dislikes|voice|positive|negative)\b/i.test(q)) ||
      /\b(how (is|are|do|did) .* (feeling|feel|felt|perceived|reacting)|how positive|how negative|are people happy|what are .* saying|what are buyers saying|what do .* think|what do shoppers think|what are .* complaining about|what are people unhappy about|what do people dislike|are reviews positive|how is customer satisfaction|how is the customer reaction|do consumers like|what's the vibe|what is the vibe)\b/i.test(q) ||
      /รีวิว|ความพึงพอใจ|คะแนน|ด่า|บ่น|ความรู้สึก|เสียงตอบรับ/i.test(q);

    if (isSentiment) {
      subIntents.push('CONSUMER_SENTIMENT', 'CUSTOMER_REVIEWS');
    }

    // Visibility & SOV Intent (RAG-BUG-017: digital footprint, dominance, visible, most visible, appears most often)
    const isVisibility =
      /\b(sov|share of voice|visibility|visible|more visible|most visible)\b/i.test(q) ||
      /\b(presence|dominance|dominates?|dominating|dominates? digitally)\b/i.test(q) ||
      /\b(digital footprint|online presence|digital presence|market presence|reach|exposure|shelf share|touchpoint|touchpoints)\b/i.test(q) ||
      /\b(everywhere|appears? most often|strongest digital footprint|strongest online presence)\b/i.test(q) ||
      /touch\s*p?points?/i.test(q) ||
      /การมองเห็น|ส่วนแบ่ง/i.test(q);

    if (isVisibility) {
      subIntents.push('VISIBILITY');
    }

    // Advertising & Paid Media Intent
    const isAd =
      /\b(ad|ads|advertising|ad creative|creatives|campaign|campaigns|video ad|static image|carousel|meta ad|sponsored)\b/i.test(q) ||
      /โฆษณา|แคมเปญ|ยิงแอด/i.test(q);

    if (isAd) {
      subIntents.push('ADVERTISING');
    }

    // Social Media Activity Intent
    const isSocial =
      /\b(social|post|posts|engagement|likes|shares|comments|facebook page|youtube channel)\b/i.test(q) ||
      /โพสต์|โซเชียล/i.test(q);

    if (isSocial) {
      subIntents.push('SOCIAL_ACTIVITY');
    }

    // Sales Traction & Momentum Intent (RAG-BUG-015: distinguish traction signals from off-platform unit sales)
    const isTraction =
      /\b(traction|observable traction|sales index|popular|velocity|bestseller|momentum|sales momentum|gaining ground)\b/i.test(q) ||
      (/\b(sales|volume)\b/i.test(q) && /\b(observable|marketplace|displayed|signal|signals|index|listing)\b/i.test(q)) ||
      /ยอดขาย|ขายดี/i.test(q);

    if (isTraction) {
      subIntents.push('TRACTION', 'TREND');
    }

    // Conceptual Definition Query (e.g. "what is touch ppoint here", "what does touchpoint mean?")
    const isConceptDefinition =
      /\b(what (is|are|does|means?)|define|definition|explain|meaning of)\b/i.test(q) &&
      (/\b(touch\s*p?points?|sov|share of voice|asp|traction index|metric cube|market presence)\b/i.test(q) || /touch\s*p?points?/i.test(q));

    // Competitive Comparison Intent (semantic synonyms: who's winning, stronger, competitor, threat, market position)
    const isCompetitive =
      !isConceptDefinition &&
      (comparisonBrands.length >= 2 ||
      /\b(compare|comparison|versus|vs|against|who('?s| is) winning|whos winning|winning|stronger|strongest|threat|worries|market position|leader|leading|outperforming)\b/i.test(q) ||
      /\b(who (costs?|charges?|dominates?) (less|more|digitally))\b/i.test(q) ||
      /\b(who('?s| is) (cheaper|cheapest|more affordable|less expensive|more expensive|most visible|more visible))\b/i.test(q) ||
      /\b(which (brand|competitor) has lower prices)\b/i.test(q) ||
      /เปรียบเทียบ|ใครชนะ|แข็งแกร่งกว่า|คู่แข่ง/i.test(q));

    if (isCompetitive || questionType === 'COMPARISON') {
      if (!subIntents.includes('COMPETITIVE_COMPARISON')) {
        subIntents.push('COMPETITIVE_COMPARISON');
      }
    }

    // Executive Summary Intent (semantic synonyms: how is Epson doing?, overview, status, snapshot)
    const isExecutive =
      /\b(how is .* doing|how's .* doing|overview|executive summary|snapshot|landscape|health check|doing right now)\b/i.test(q) ||
      /ภาพรวม|สถานการณ์/i.test(q);

    // Trend Intent
    const isTrend = /\b(improving|getting better|getting worse|declining|growing|trend|trending|gaining ground|momentum)\b/i.test(q);
    if (isTrend && !subIntents.includes('TREND')) {
      subIntents.push('TREND');
    }

    // If clarification is required, keep primary business intent intact if present, else CLARIFICATION
    if (context.requiresClarification) {
      if (isPricing) return { primaryIntent: 'PRICING', subIntents: Array.from(new Set([...subIntents, 'CLARIFICATION'])) };
      if (isVisibility) return { primaryIntent: 'VISIBILITY', subIntents: Array.from(new Set([...subIntents, 'CLARIFICATION'])) };
      if (isSentiment) return { primaryIntent: 'CONSUMER_SENTIMENT', subIntents: Array.from(new Set([...subIntents, 'CLARIFICATION'])) };
      if (isTraction) return { primaryIntent: 'TRACTION', subIntents: Array.from(new Set([...subIntents, 'CLARIFICATION'])) };
      return { primaryIntent: 'CLARIFICATION', subIntents: ['CLARIFICATION'] };
    }

    // Topicless comparative follow-up inherits prior business domain (e.g. Conversation D: "Compare that with Canon." after reviews)
    const isTopiclessComparison =
      (isCompetitive || questionType === 'COMPARISON') &&
      !isSentiment &&
      !isPricing &&
      !isVisibility &&
      !isAd &&
      !isSocial &&
      !isTraction &&
      context.isFollowUp &&
      Boolean(context.priorTopic && ['CONSUMER_SENTIMENT', 'CUSTOMER_REVIEWS', 'PRICING', 'VISIBILITY', 'ADVERTISING', 'SOCIAL_ACTIVITY'].includes(context.priorTopic));

    if (isTopiclessComparison && context.priorTopic) {
      if (!subIntents.includes(context.priorTopic)) {
        subIntents.push(context.priorTopic);
      }
      return { primaryIntent: context.priorTopic, subIntents: Array.from(new Set(subIntents)) };
    }

    // Follow-up topic inheritance if no direct domain matched
    if (subIntents.length === 0 && context.isFollowUp && context.priorTopic) {
      return { primaryIntent: context.priorTopic, subIntents: ['FOLLOW_UP'] };
    }

    // Priority Resolution & Multi-Intent Dominance (RAG-BUG-017 Section 11 & 19):
    // When Sentiment and Pricing collide (e.g. "Customers complained about expensive pricing")
    if (isSentiment && isPricing) {
      if (/^(what|which)\s+price/i.test(q) || /\b(exact price|how much was the price)\b/i.test(q)) {
        return { primaryIntent: 'PRICING', subIntents: Array.from(new Set(subIntents)) };
      }
      return { primaryIntent: 'CONSUMER_SENTIMENT', subIntents: Array.from(new Set(subIntents)) };
    }

    // Check for conversational greetings, capabilities, and small talk (Chatbot NLP)
    const isGreeting = this.isGreetingOrConversational(q);
    const hasBusinessDomain = isPricing || isSentiment || isVisibility || isAd || isSocial || isTraction || isExecutive;

    if (isGreeting && !hasBusinessDomain) {
      return { primaryIntent: 'GREETING', subIntents: ['GREETING'] };
    }

    if (isSentiment) return { primaryIntent: 'CONSUMER_SENTIMENT', subIntents: Array.from(new Set(subIntents)) };
    if (isPricing) return { primaryIntent: 'PRICING', subIntents: Array.from(new Set(subIntents)) };
    if (isVisibility) return { primaryIntent: 'VISIBILITY', subIntents: Array.from(new Set(subIntents)) };
    if (isAd) return { primaryIntent: 'ADVERTISING', subIntents: Array.from(new Set(subIntents)) };
    if (isSocial) return { primaryIntent: 'SOCIAL_ACTIVITY', subIntents: Array.from(new Set(subIntents)) };
    if (isTraction) return { primaryIntent: 'TRACTION', subIntents: Array.from(new Set(subIntents)) };
    if (isCompetitive) return { primaryIntent: 'COMPETITIVE_COMPARISON', subIntents: Array.from(new Set(subIntents)) };
    if (isExecutive) return { primaryIntent: 'EXECUTIVE_SUMMARY', subIntents: Array.from(new Set(subIntents)) };

    // Default fallback: If a brand is specified, treat as executive status; otherwise competitive
    if (effectiveBrands.length === 1 && effectiveBrands[0] !== 'HP') {
      return { primaryIntent: 'EXECUTIVE_SUMMARY', subIntents: Array.from(new Set(subIntents)) };
    }

    return { primaryIntent: 'COMPETITIVE_COMPARISON', subIntents: Array.from(new Set(subIntents)) };
  }

  // ─── 7. Metric Mapping ────────────────────────────────────────────────────

  private mapIntentToMetrics(primary: RAGIntent, subIntents: readonly RAGIntent[]): MetricId[] {
    const metrics: MetricId[] = [];
    const all = [primary, ...subIntents];

    if (all.includes('PRICING') || all.includes('PROMOTIONS')) {
      metrics.push('AVG_SELLING_PRICE_THB', 'MEDIAN_SELLING_PRICE_THB', 'AVG_DISCOUNT_PCT');
      if (all.includes('PROMOTIONS')) {
        metrics.push('PROMO_PENETRATION_PCT');
      }
    }

    if (all.includes('CONSUMER_SENTIMENT') || all.includes('CUSTOMER_REVIEWS')) {
      metrics.push('AVG_CONSUMER_RATING', 'TOTAL_CONSUMER_REVIEWS_COUNT', 'POSITIVE_SENTIMENT_PCT');
    }

    if (all.includes('VISIBILITY') || all.includes('COMPETITIVE_COMPARISON') || all.includes('EXECUTIVE_SUMMARY')) {
      metrics.push('TOTAL_VISIBILITY_TOUCHPOINTS', 'PAID_MEDIA_SOV', 'ECOMMERCE_SOV', 'SOCIAL_SOV');
    }

    if (all.includes('ADVERTISING')) {
      metrics.push(
        'AD_PRESENCE_COUNT',
        'CREATIVE_FORMAT_VIDEO_COUNT',
        'CREATIVE_FORMAT_STATIC_COUNT',
        'CREATIVE_FORMAT_CAROUSEL_COUNT'
      );
    }

    if (all.includes('SOCIAL_ACTIVITY')) {
      metrics.push('SOCIAL_POSTS_COUNT', 'TOTAL_SOCIAL_ENGAGEMENT');
    }

    if (all.includes('TRACTION') || all.includes('TREND')) {
      metrics.push('OBSERVABLE_SALES_TRACTION_INDEX');
    }

    if (all.includes('RECOMMENDATION') || all.includes('WHY_EXPLANATION')) {
      metrics.push(
        'TOTAL_VISIBILITY_TOUCHPOINTS',
        'AVG_SELLING_PRICE_THB',
        'AVG_DISCOUNT_PCT',
        'AD_PRESENCE_COUNT',
        'AVG_CONSUMER_RATING',
        'POSITIVE_SENTIMENT_PCT'
      );
    }

    if (metrics.length === 0) {
      metrics.push('TOTAL_VISIBILITY_TOUCHPOINTS', 'ECOMMERCE_SOV', 'AVG_SELLING_PRICE_THB');
    }

    return Array.from(new Set(metrics));
  }

  // ─── 8. Understanding Confidence ──────────────────────────────────────────

  private computeUnderstandingConfidence(
    intent: RAGIntent,
    context: ConversationalContext,
    brands: readonly TargetBrand[]
  ): number {
    if (context.requiresClarification) return 0.4;
    let score = 0.75;
    if (brands.length > 0) score += 0.1;
    if (intent !== 'GENERAL_QUERY' && intent !== 'CLARIFICATION') score += 0.1;
    if (context.isFollowUp && context.priorTopic) score += 0.05;
    return Number(Math.min(0.98, score).toFixed(2));
  }
}

export const queryUnderstandingEngine = new QueryUnderstandingEngine();
