// BurnSight Upload Route — supports CSV, Excel (.xlsx), and JSON
import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/csvParser';
import { categorizeTransactions } from '@/lib/categorizer';

async function parseExcelToCSV(buffer: ArrayBuffer): Promise<string> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_csv(firstSheet);
}

interface JSONTransaction {
  date?: string;
  Date?: string;
  description?: string;
  Description?: string;
  narration?: string;
  Narration?: string;
  amount?: number | string;
  Amount?: number | string;
  debit?: number | string;
  Debit?: number | string;
  credit?: number | string;
  Credit?: number | string;
  type?: string;
  Type?: string;
  category?: string;
  Category?: string;
}

function parseJSONTransactions(jsonStr: string) {
  const data: JSONTransaction[] = JSON.parse(jsonStr);
  if (!Array.isArray(data)) throw new Error('JSON must be an array of transaction objects');

  return data.map((tx, i) => {
    const date = tx.date || tx.Date || '';
    const description = tx.description || tx.Description || tx.narration || tx.Narration || '';
    const rawAmount = tx.amount || tx.Amount || tx.debit || tx.Debit || tx.credit || tx.Credit || 0;
    const amount = typeof rawAmount === 'string' ? parseFloat(rawAmount.replace(/[,$]/g, '')) : rawAmount;
    const type = tx.type || tx.Type || (amount >= 0 ? 'INCOME' : 'EXPENSE');

    return {
      id: `json-${i}`,
      date: date,
      description: description,
      amount: Math.abs(amount),
      type: type.toUpperCase() === 'INCOME' ? 'INCOME' as const : 'EXPENSE' as const,
      category: tx.category || tx.Category || 'UNCATEGORIZED',
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let transactions;

    if (fileName.endsWith('.json')) {
      // --- JSON ---
      const text = await file.text();
      transactions = parseJSONTransactions(text);

    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // --- Excel ---
      const buffer = await file.arrayBuffer();
      const csvContent = await parseExcelToCSV(buffer);
      const parseResult = parseCSV(csvContent);
      if (parseResult.errors.length > 0 && parseResult.transactions.length === 0) {
        return NextResponse.json({ error: parseResult.errors.join(', ') }, { status: 400 });
      }
      transactions = await categorizeTransactions(parseResult.transactions);

    } else if (fileName.endsWith('.csv')) {
      // --- CSV ---
      const text = await file.text();
      const parseResult = parseCSV(text);
      if (parseResult.errors.length > 0 && parseResult.transactions.length === 0) {
        return NextResponse.json({ error: parseResult.errors.join(', ') }, { status: 400 });
      }
      transactions = await categorizeTransactions(parseResult.transactions);

    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload CSV, Excel (.xlsx), or JSON.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
      format: fileName.endsWith('.json') ? 'json' : fileName.endsWith('.xlsx') || fileName.endsWith('.xls') ? 'excel' : 'csv',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    );
  }
}
