export const calculateMatchScore = (campaign: any, creatorNiche: string[]) => {
    // 1. Basic Content Analysis
    // In a real app, this would call an LLM.
    // Here we simulate "AI" analysis based on string matching and randomization seeded by ID to be consistent.

    if (!campaign) return 85; // Default high score for demo

    let score = 70;

    // Simulate keyword matching (handle BigInt in campaign data)
    const campaignText = JSON.stringify(campaign, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ).toLowerCase();

    // Add points for matching terms
    if (campaignText.includes("tech") || campaignText.includes("review")) score += 10;
    if (campaignText.includes("beauty") || campaignText.includes("lifestyle")) score += 5;

    // Random variance based on campaign ID to make it look dynamic per card
    const variance = (Number(campaign[0] || 0) * 13) % 15;

    return Math.min(99, score + variance);
};

export const getMatchColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (score >= 80) return "text-purple-400 bg-purple-400/10 border-purple-400/20";
    return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
};
