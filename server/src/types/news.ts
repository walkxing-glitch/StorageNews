export interface NewsItem {
    id?: number;
    title: string;
    summary?: string;
    content?: string;
    url?: string;
    image_url?: string;
    source_name?: string;
    vendor?: string;
    category?: string;
    language?: string;
    published_at?: string | Date;
    created_at?: Date;
    hash?: string;
    score?: number;
    score_breakdown?: any;
    summary_cn?: string | null;
}

export interface ScoreBreakdown {
    baseScore: number;
    sourceWeight: number;
    categoryWeight: number;
    vendorWeight: number;
    keywordBonus: number;
    freshnessScore: number;
}

export interface ScoredNewsItem extends NewsItem {
    score: number;
    scoreBreakdown: ScoreBreakdown;
}
