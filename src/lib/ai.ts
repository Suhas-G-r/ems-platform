
// Mock AI Service simulating LLM calls

export async function generateAdminSummary() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return `
    **Daily Insight**: Company attendance is up 5% this week.
    Production team is meeting all deadlines.
    **Attention Needed**: 3 pending leave requests for next week require approval.
    Overall sentiment in recent feedback is Positive (85%).
  `;
}


export async function suggestLeaveResponse(approved: boolean, name: string) {
    // Mock generation
    if (approved) {
        return `Hi ${name}, your leave request has been approved. Enjoy your time off!`;
    } else {
        return `Hi ${name}, unfortunately we cannot approve your leave at this time due to critical project deadlines. Let's discuss an alternative date.`;
    }
}

export async function analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
    const lower = text.toLowerCase();
    if (lower.includes('bad') || lower.includes('hate') || lower.includes('issue')) return 'NEGATIVE';
    if (lower.includes('good') || lower.includes('great') || lower.includes('love')) return 'POSITIVE';
    return 'NEUTRAL';
}
