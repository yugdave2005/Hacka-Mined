// BurnSight AI Transaction Categorizer
// Categorizes transactions using Groq Llama3

import { ParsedTransaction } from './csvParser';

export interface CategorizedTransaction extends ParsedTransaction {
  category: string;
}

const CATEGORIES = [
  'PAYROLL',
  'SOFTWARE_TOOLS',
  'SERVER_COSTS',
  'MARKETING',
  'OFFICE_RENT',
  'LEGAL_ACCOUNTING',
  'TRAVEL',
  'MEALS_ENTERTAINMENT',
  'INSURANCE',
  'UTILITIES',
  'EQUIPMENT',
  'CONSULTING',
  'SALES_REVENUE',
  'SERVICE_REVENUE',
  'SUBSCRIPTION_REVENUE',
  'INVESTMENT_INCOME',
  'REFUND',
  'OTHER_EXPENSE',
  'OTHER_INCOME',
];

const SYSTEM_PROMPT = `You are a financial transaction categorizer for startups.

Categorize each transaction into ONE of these categories:

${CATEGORIES.join(', ')}

Return ONLY valid JSON in this format:

{
 "categories": ["CATEGORY1","CATEGORY2","CATEGORY3"]
}

The number of categories must match the number of transactions.
Do not include explanations.`;


function buildCategorizationPrompt(transactions: ParsedTransaction[]): string {
  const txList = transactions
    .map((t, i) =>
      `${i + 1}. [${t.type}] $${t.amount.toFixed(2)} - "${t.description}" (${t.date})`
    )
    .join('\n');

  return `Categorize these ${transactions.length} transactions:\n\n${txList}`;
}

function fallbackCategorize(tx: ParsedTransaction): string {
  const desc = tx.description.toLowerCase();

  if (tx.type === 'INCOME') {
    if (desc.includes('subscription') || desc.includes('recurring')) return 'SUBSCRIPTION_REVENUE';
    if (desc.includes('service') || desc.includes('consulting')) return 'SERVICE_REVENUE';
    if (desc.includes('refund')) return 'REFUND';
    if (desc.includes('investment') || desc.includes('interest')) return 'INVESTMENT_INCOME';
    return 'SALES_REVENUE';
  }

  if (desc.includes('salary') || desc.includes('payroll') || desc.includes('wage')) return 'PAYROLL';

  if (
    desc.includes('aws') ||
    desc.includes('azure') ||
    desc.includes('gcp') ||
    desc.includes('heroku') ||
    desc.includes('vercel') ||
    desc.includes('digitalocean') ||
    desc.includes('hosting')
  ) return 'SERVER_COSTS';

  if (
    desc.includes('google ads') ||
    desc.includes('facebook') ||
    desc.includes('marketing') ||
    desc.includes('advertisement') ||
    desc.includes('ad spend')
  ) return 'MARKETING';

  if (
    desc.includes('slack') ||
    desc.includes('github') ||
    desc.includes('notion') ||
    desc.includes('figma') ||
    desc.includes('jira') ||
    desc.includes('software') ||
    desc.includes('saas')
  ) return 'SOFTWARE_TOOLS';

  if (desc.includes('rent') || desc.includes('lease') || desc.includes('office') || desc.includes('cowork')) return 'OFFICE_RENT';

  if (
    desc.includes('legal') ||
    desc.includes('lawyer') ||
    desc.includes('accounting') ||
    desc.includes('cpa') ||
    desc.includes('tax')
  ) return 'LEGAL_ACCOUNTING';

  if (
    desc.includes('flight') ||
    desc.includes('hotel') ||
    desc.includes('uber') ||
    desc.includes('lyft') ||
    desc.includes('travel') ||
    desc.includes('airbnb')
  ) return 'TRAVEL';

  if (
    desc.includes('meal') ||
    desc.includes('lunch') ||
    desc.includes('dinner') ||
    desc.includes('restaurant') ||
    desc.includes('catering')
  ) return 'MEALS_ENTERTAINMENT';

  if (desc.includes('insurance')) return 'INSURANCE';

  if (
    desc.includes('electric') ||
    desc.includes('internet') ||
    desc.includes('phone') ||
    desc.includes('utility')
  ) return 'UTILITIES';

  if (
    desc.includes('laptop') ||
    desc.includes('monitor') ||
    desc.includes('equipment') ||
    desc.includes('hardware')
  ) return 'EQUIPMENT';

  if (
    desc.includes('consultant') ||
    desc.includes('contractor') ||
    desc.includes('freelance')
  ) return 'CONSULTING';

  return 'OTHER_EXPENSE';
}


export async function categorizeTransactions(
  transactions: ParsedTransaction[]
): Promise<CategorizedTransaction[]> {

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return transactions.map(tx => ({
      ...tx,
      category: fallbackCategorize(tx),
    }));
  }

  const batchSize = 30;
  const results: CategorizedTransaction[] = [];

  for (let i = 0; i < transactions.length; i += batchSize) {

    const batch = transactions.slice(i, i + batchSize);

    try {

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: buildCategorizationPrompt(batch) }
            ],
            temperature: 0.1,
            max_tokens: 400,
            response_format: { type: 'json_object' }
          }),
        }
      );

      if (!response.ok) {
        for (const tx of batch) {
          results.push({
            ...tx,
            category: fallbackCategorize(tx)
          });
        }
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (content) {

        let jsonStr = content.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json[\r\n]*/, '').replace(/[\r\n]*```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```[\r\n]*/, '').replace(/[\r\n]*```$/, '');
        }

        const parsed = JSON.parse(jsonStr);
        const categories: string[] = parsed.categories;

        if (Array.isArray(categories) && categories.length === batch.length) {

          for (let j = 0; j < batch.length; j++) {

            const cat = CATEGORIES.includes(categories[j])
              ? categories[j]
              : fallbackCategorize(batch[j]);

            results.push({
              ...batch[j],
              category: cat
            });
          }

          continue;
        }
      }

      for (const tx of batch) {
        results.push({
          ...tx,
          category: fallbackCategorize(tx)
        });
      }

    } catch {

      for (const tx of batch) {
        results.push({
          ...tx,
          category: fallbackCategorize(tx)
        });
      }

    }
  }

  return results;
}