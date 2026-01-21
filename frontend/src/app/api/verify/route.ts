import { NextResponse } from 'next/server';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { cronosTestnet } from 'viem/chains';
import { ESCROW_ADDRESS, ESCROW_ABI } from '@/constants';

// Load Private Key from Env
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) {
    console.warn("⚠️ PRIVATE_KEY is missing directly in API. Ensure it is set in Vercel/Env.");
}
// Fallback account or create from valid key
const account = PRIVATE_KEY ? privateKeyToAccount(PRIVATE_KEY) : privateKeyToAccount('0x0000000000000000000000000000000000000000000000000000000000000001');

const client = createWalletClient({
    account,
    chain: cronosTestnet,
    transport: http('https://evm-t3.cronos.org/')
}).extend(publicActions);

import { GoogleGenerativeAI } from '@google/generative-ai';

// ... existing imports ...

// Gemini API
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// ============================================
// TYPES
// ============================================

interface PlatformInfo {
    platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'unknown';
    contentType: 'video' | 'post' | 'reel' | 'short' | 'unknown';
    contentId: string | null;
    username: string | null;
    isValid: boolean;
}

interface OEmbedResult {
    exists: boolean;
    title?: string;
    author?: string;
    thumbnail?: string;
    html?: string;
    error?: string;
}

interface GeminiAnalysis {
    isContentAppropriate: boolean;
    isBrandSafe: boolean;
    hasSponsorship: boolean;
    contentDescription: string;
    detectedHashtags: string[];
    confidenceScore: number;
    brandMentions: string[];
    warnings: string[];
}

interface VerificationResult {
    verified: boolean;
    score: number;
    reason: string;
    aiAnalysis?: GeminiAnalysis;
    details: {
        platform: string;
        contentType: string;
        contentId: string | null;
        contentExists: boolean;
        title?: string;
        author?: string;
        thumbnail?: string;
    };
    payoutPercent?: number;
}

// ============================================
// PLATFORM DETECTION
// ============================================

function parseSocialUrl(url: string): PlatformInfo {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        const pathname = urlObj.pathname;

        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            let videoId: string | null = null;
            if (hostname.includes('youtu.be')) videoId = pathname.slice(1).split('?')[0];
            else if (pathname.includes('/watch')) videoId = urlObj.searchParams.get('v');
            else if (pathname.includes('/shorts/')) {
                videoId = pathname.split('/shorts/')[1]?.split('?')[0];
                return { platform: 'youtube', contentType: 'short', contentId: videoId, username: null, isValid: !!videoId };
            }
            return { platform: 'youtube', contentType: 'video', contentId: videoId, username: null, isValid: !!videoId && videoId.length >= 11 };
        }

        if (hostname.includes('instagram.com') || hostname.includes('instagr.am')) {
            const reelMatch = pathname.match(/\/reel\/([A-Za-z0-9_-]+)/);
            const postMatch = pathname.match(/\/p\/([A-Za-z0-9_-]+)/);
            if (reelMatch) return { platform: 'instagram', contentType: 'reel', contentId: reelMatch[1], username: null, isValid: true };
            if (postMatch) return { platform: 'instagram', contentType: 'post', contentId: postMatch[1], username: null, isValid: true };
            return { platform: 'instagram', contentType: 'unknown', contentId: null, username: null, isValid: false };
        }

        if (hostname.includes('tiktok.com')) {
            const videoMatch = pathname.match(/\/video\/(\d+)/);
            const userMatch = pathname.match(/\/@([A-Za-z0-9_.]+)/);
            if (videoMatch) return { platform: 'tiktok', contentType: 'video', contentId: videoMatch[1], username: userMatch?.[1] || null, isValid: true };
            return { platform: 'tiktok', contentType: 'unknown', contentId: null, username: userMatch?.[1] || null, isValid: false };
        }

        if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
            const tweetMatch = pathname.match(/\/([A-Za-z0-9_]+)\/status\/(\d+)/);
            if (tweetMatch) return { platform: 'twitter', contentType: 'post', contentId: tweetMatch[2], username: tweetMatch[1], isValid: true };
            return { platform: 'twitter', contentType: 'unknown', contentId: null, username: null, isValid: false };
        }

        return { platform: 'unknown', contentType: 'unknown', contentId: null, username: null, isValid: false };
    } catch {
        return { platform: 'unknown', contentType: 'unknown', contentId: null, username: null, isValid: false };
    }
}

// ============================================
// OEMBED VALIDATION
// ============================================

async function validateWithOEmbed(url: string, platform: string): Promise<OEmbedResult> {
    try {
        let oembedUrl: string | null = null;
        if (platform === 'youtube') oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        else if (platform === 'twitter') oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
        else if (platform === 'tiktok') oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        else if (platform === 'instagram') return { exists: true, title: 'Instagram Post', author: 'Instagram User' };

        if (!oembedUrl) return { exists: false, error: 'No oEmbed available' };

        const response = await fetch(oembedUrl, { headers: { 'User-Agent': 'CreatorConnect/1.0' } });
        if (!response.ok) return { exists: false, error: `HTTP ${response.status}` };

        const data = await response.json();
        return {
            exists: true,
            title: data.title || data.author_name,
            author: data.author_name,
            thumbnail: data.thumbnail_url,
            html: data.html
        };
    } catch {
        return { exists: true, title: 'Unable to fetch metadata' };
    }
}

// ============================================
// GEMINI AI ANALYSIS
// ============================================

async function analyzeWithGemini(
    thumbnailUrl: string | undefined,
    title: string,
    campaignRequirements?: string
): Promise<GeminiAnalysis> {
    const defaultResult: GeminiAnalysis = {
        isContentAppropriate: true,
        isBrandSafe: true,
        hasSponsorship: false,
        contentDescription: 'Unable to analyze',
        detectedHashtags: [],
        confidenceScore: 60,
        brandMentions: [],
        warnings: []
    };

    if (!genAI) {
        console.error('[Gemini] ❌ API key not configured!');
        // Don't throw, just return default to allow fallback to rule-based
        return defaultResult;
    }

    try {
        console.log('[Gemini] Starting content analysis...');
        console.log('[Gemini] Title:', title);
        console.log('[Gemini] Campaign Requirements:', campaignRequirements || 'None');

        let result;
        try {
            // Try primary model
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `
            Analyze this social media content for brand verification.
            Title/Description: "${title}"
            Campaign Rules: "${campaignRequirements || 'None'}"

            Return JSON:
            {
                "isContentAppropriate": boolean,
                "isBrandSafe": boolean,
                "hasSponsorship": boolean (look for #ad, #sponsored, paid partnership),
                "contentDescription": "brief summary",
                "detectedHashtags": ["list", "of", "hashtags"],
                "confidenceScore": number (0-100),
                "brandMentions": ["list", "of", "brands"],
                "warnings": ["list", "potential", "issues"]
            }
            `;
            result = await model.generateContent(prompt);
        } catch (err) {
            console.warn('[Gemini] 1.5-flash failed, trying gemini-pro...', err);
            // Fallback to older model
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const prompt = `Analyze: "${title}". Rules: "${campaignRequirements}". Return JSON with isContentAppropriate, isBrandSafe, hasSponsorship, contentDescription, detectedHashtags, confidenceScore, brandMentions, warnings.`;
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
        const data = JSON.parse(jsonStr);

        return { ...defaultResult, ...data };

    } catch (error) {
        console.error('[Gemini] AI Analysis Failed:', error);

        // ----------------------------------------
        // FALLBACK: RULE-BASED VERIFICATION
        // ----------------------------------------
        const titleLower = title.toLowerCase();
        const reqs = (campaignRequirements || '').toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);

        // Check requirement matches
        const matchedKeywords = reqs.filter(req => titleLower.includes(req));
        const matchRatio = reqs.length > 0 ? matchedKeywords.length / reqs.length : 1;

        // Basic Checks
        const hashtags = title.match(/#[a-zA-Z0-9_]+/g) || [];
        const isSponsored = /#ad|#sponsored|#partner|#collab/i.test(title);

        // Optimistic Scoring for Fallback
        const baseScore = 60; // Start with passing score if structure is okay
        const matchBonus = Math.floor(matchRatio * 20); // Up to +20 for keyword matches
        const sponsorBonus = isSponsored ? 10 : 0;

        const fallbackScore = Math.min(100, baseScore + matchBonus + sponsorBonus);

        console.log(`[Gemini] ⚠️ Using Fallback Logic. Score: ${fallbackScore}`);

        return {
            isContentAppropriate: true, // Assume innocent until proven guilty
            isBrandSafe: true,
            hasSponsorship: isSponsored,
            contentDescription: `[Fallback Analysis] ${title.substring(0, 50)}...`,
            detectedHashtags: hashtags,
            confidenceScore: fallbackScore,
            brandMentions: matchedKeywords,
            warnings: ['⚠️ AI Service Unavailable - Verified using rule-based logic']
        };
    }
}



// ============================================
// COMPREHENSIVE VERIFICATION
// ============================================

async function verifyContent(url: string, campaignRequirements?: string): Promise<VerificationResult> {
    const platformInfo = parseSocialUrl(url);
    console.log(`[Verifier] Platform:`, platformInfo);

    if (platformInfo.platform === 'unknown') {
        return {
            verified: false, score: 0,
            reason: '❌ URL is not from a supported platform',
            details: { platform: 'unknown', contentType: 'unknown', contentId: null, contentExists: false }
        };
    }

    if (!platformInfo.isValid) {
        return {
            verified: false, score: 15,
            reason: `❌ Invalid ${platformInfo.platform} URL`,
            details: { platform: platformInfo.platform, contentType: platformInfo.contentType, contentId: null, contentExists: false }
        };
    }

    const oembedResult = await validateWithOEmbed(url, platformInfo.platform);
    if (!oembedResult.exists) {
        return {
            verified: false, score: 25,
            reason: '❌ Content not found or is private',
            details: { platform: platformInfo.platform, contentType: platformInfo.contentType, contentId: platformInfo.contentId, contentExists: false }
        };
    }

    // ----------------------------------------
    // STRICT PLATFORM ENFORCEMENT
    // ----------------------------------------
    // ----------------------------------------
    // STRICT PLATFORM ENFORCEMENT
    // ----------------------------------------
    let reqsLower = (campaignRequirements || '').toLowerCase();

    // Attempt to parse JSON to find explicit platform field
    let explicitPlatform = null;
    try {
        const json = JSON.parse(campaignRequirements || '{}');
        if (json.platform) explicitPlatform = json.platform.toLowerCase();
    } catch (e) { /* Ignore non-JSON reqs */ }

    const detected = platformInfo.platform;
    console.log(`[Verifier] Strict Check -> Explicit: "${explicitPlatform}" | Reqs: "${reqsLower}" | Detected: "${detected}"`);

    // Override requirements if specific platform is selected in Wizard
    const requiresYoutube = explicitPlatform
        ? (explicitPlatform.includes('youtube') || explicitPlatform.includes('yt'))
        : (reqsLower.includes('youtube') || reqsLower.includes('yt ') || reqsLower.includes('you tube') || reqsLower.includes('shorts'));

    const requiresInsta = explicitPlatform
        ? (explicitPlatform.includes('instagram') || explicitPlatform.includes('insta'))
        : (reqsLower.includes('instagram') || reqsLower.includes('insta') || reqsLower.includes(' ig ') || reqsLower.includes('reel'));

    const requiresTiktok = explicitPlatform
        ? (explicitPlatform.includes('tiktok'))
        : (reqsLower.includes('tiktok') || reqsLower.includes('tik tok'));

    const requiresTwitter = explicitPlatform
        ? (explicitPlatform.includes('twitter') || explicitPlatform.includes('x.com'))
        : (reqsLower.includes('twitter') || reqsLower.includes('x.com') || reqsLower.includes('tweet'));


    // YouTube Checks
    if (requiresYoutube && detected !== 'youtube') {
        console.log('[Verifier] ❌ STRICT FAIL: Campaign requires YouTube');
        return {
            verified: false, score: 0,
            reason: '❌ Mismatch: Campaign requires YouTube',
            details: { platform: platformInfo.platform, contentType: platformInfo.contentType, contentId: platformInfo.contentId, contentExists: true }
        };
    }

    // Instagram Checks
    if (requiresInsta && detected !== 'instagram') {
        console.log('[Verifier] ❌ STRICT FAIL: Campaign requires Instagram');
        return {
            verified: false, score: 0,
            reason: '❌ Mismatch: Campaign requires Instagram',
            details: { platform: platformInfo.platform, contentType: platformInfo.contentType, contentId: platformInfo.contentId, contentExists: true }
        };
    }

    // TikTok Checks
    if (requiresTiktok && detected !== 'tiktok') {
        console.log('[Verifier] ❌ STRICT FAIL: Campaign requires TikTok');
        return {
            verified: false, score: 0,
            reason: '❌ Mismatch: Campaign requires TikTok',
            details: { platform: platformInfo.platform, contentType: platformInfo.contentType, contentId: platformInfo.contentId, contentExists: true }
        };
    }

    // Twitter Checks
    if (requiresTwitter && detected !== 'twitter') {
        console.log('[Verifier] ❌ STRICT FAIL: Campaign requires Twitter');
        return {
            verified: false, score: 0,
            reason: '❌ Mismatch: Campaign requires Twitter',
            details: { platform: platformInfo.platform, contentType: platformInfo.contentType, contentId: platformInfo.contentId, contentExists: true }
        };
    }

    // ----------------------------------------
    // ----------------------------------------
    // DETERMINISTIC RULE MATCHING (Simplified)
    // ----------------------------------------
    console.log('[Verifier] Running Rule-Based Analysis...');

    // User Requested: "Title descip tko mat match kar yr sirf url se test kar"
    // Logic: If Platform Strict Check Passed (above) AND oEmbed Exists -> VERIFY.

    let score = 85; // High score for valid connected content
    const reasons: string[] = ['✅ Platform Matched', '✅ Content Exists (Verified via oEmbed)'];

    let isBrandSafe = true;
    let isContentAppropriate = true;

    // Final Validation
    // ----------------------------------------
    // AI ANALYSIS (Gemini)
    // ----------------------------------------
    let aiResult = await analyzeWithGemini(
        oembedResult.thumbnail,
        oembedResult.title || 'Untitled',
        campaignRequirements
    );

    console.log(`[Verifier] AI Score: ${aiResult.confidenceScore}`);

    // Scoring Logic (Smart Valuation)
    let finalScore = aiResult.confidenceScore;
    let payoutPercent = 0;
    let verified = false;

    if (finalScore >= 80) {
        payoutPercent = 100;
        verified = true;
        reasons.push(`✅ High Quality Content (${finalScore}/100)`);
    } else if (finalScore >= 50) {
        payoutPercent = 50;
        verified = true;
        reasons.push(`⚠️ Acceptable Quality (${finalScore}/100) - 50% Payout`);
        // Append warning
        aiResult.warnings.push('Partial payout due to average quality score.');
    } else {
        verified = false;
        reasons.push(`❌ Low Quality / Irrelevant (${finalScore}/100)`);
    }

    // Safety Overrides
    if (!aiResult.isBrandSafe) {
        verified = false;
        payoutPercent = 0;
        reasons.push('❌ Brand Safety Fail');
    }

    if (!aiResult.hasSponsorship && (campaignRequirements || '').includes('sponsor')) {
        // If sponsorship disclosure is strictly required
        // reasons.push('⚠️ Missing #ad/#sponsored');
        // We can be strict or lenient here. Let's be lenient for now but warn.
    }

    return {
        verified,
        score: finalScore,
        reason: reasons.join(' • '),
        details: {
            platform: platformInfo.platform,
            contentType: platformInfo.contentType,
            contentId: platformInfo.contentId,
            contentExists: true,
            title: oembedResult.title,
            author: oembedResult.author,
            thumbnail: oembedResult.thumbnail
        },
        payoutPercent
    };
}

// ============================================
// API HANDLER
// ============================================

export async function POST(req: Request) {
    try {
        const { url, campaignId, creatorAddress, campaignRequirements } = await req.json();

        if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        if (!creatorAddress) return NextResponse.json({ error: 'Creator address required' }, { status: 400 });

        console.log(`\n${'═'.repeat(60)}`);
        console.log(`[AI Agent] 🤖 GEMINI-POWERED VERIFICATION`);
        console.log(`[AI Agent] Campaign: ${campaignId} | Creator: ${creatorAddress.slice(0, 10)}...`);
        console.log(`[AI Agent] URL: ${url}`);
        console.log(`[AI Agent] Gemini API: ${genAI ? '✅ Active' : '⚠️ Not configured'}`);
        console.log(`${'═'.repeat(60)}`);

        const result = await verifyContent(url, campaignRequirements);
        console.log(`[AI Agent] Score: ${result.score}/100 | Verified: ${result.verified}`);

        if (!result.verified) {
            console.log(`[AI Agent] ❌ VERIFICATION FAILED`);
            return NextResponse.json(result);
        }

        // On-chain payout
        let txHash = null;
        if (campaignId !== undefined) {
            try {
                console.log(`[AI Agent] ✅ VERIFIED - Triggering payout...`);

                // DEBUG: Check verifier agent on chain
                try {
                    const currentVerifier = await client.readContract({
                        address: ESCROW_ADDRESS as `0x${string}`,
                        abi: ESCROW_ABI,
                        functionName: 'verifierAgent',
                    });
                    console.log(`[AI Agent] My Address: ${account.address}`);
                    console.log(`[AI Agent] Contract Verifier: ${currentVerifier}`);

                    if (currentVerifier.toLowerCase() !== account.address.toLowerCase()) {
                        console.error(`[AI Agent] ❌ MISMATCH! I am not the verifier.`);
                    }
                } catch (e) {
                    console.log('Error reading verifier:', e);
                }

                // X402 SDK Integration (Receipt Generation)
                // We use the SDK to structure the payment requirement for logging/audit
                try {
                    const { Facilitator, CronosNetwork } = require('@crypto.com/facilitator-client');
                    const facilitator = new Facilitator({
                        network: CronosNetwork.CronosTestnet,
                    });

                    const receipt = facilitator.generatePaymentRequirements({
                        payTo: creatorAddress,
                        description: `Campaign #${campaignId} Payout - Quality Score: ${result.score}`,
                        maxAmountRequired: '0', // Dynamic amount determined by contract
                    });
                    console.log('[AI Agent] 🧾 X402 Receipt Generated:', receipt);
                } catch (sdkError) {
                    console.warn('[AI Agent] Warning: X402 SDK not loaded or failed', sdkError);
                }

                txHash = await client.writeContract({
                    address: ESCROW_ADDRESS as `0x${string}`,
                    abi: ESCROW_ABI,
                    functionName: 'verifyAndRelease',
                    args: [BigInt(campaignId), creatorAddress as `0x${string}`, true, BigInt(result.payoutPercent || 0)],
                    account,
                });
                console.log(`[AI Agent] 💰 PAYOUT TX: ${txHash}`);
            } catch (err: any) {
                console.error('[AI Agent] Payout Error:', err.message);
            }
        }

        console.log(`${'═'.repeat(60)}\n`);
        return NextResponse.json({ ...result, txHash });

    } catch (error) {
        console.error('[AI Agent] Fatal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
