// BurnSight CSV Parser
// Parses and validates bank statement CSV files

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  errors: string[];
  warnings: string[];
}

function parseDate(value: string): string | null {
  if (!value || !value.trim()) return null;

  const cleaned = value.trim();

  // Try common date formats
  const formats = [
    // ISO format
    /^(\d{4})-(\d{1,2})-(\d{1,2})/,
    // US format MM/DD/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // EU format DD/MM/YYYY
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})/,
    // US format MM-DD-YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})/,
  ];

  for (const fmt of formats) {
    const match = cleaned.match(fmt);
    if (match) {
      const d = new Date(cleaned);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
  }

  // Last resort: try native parse
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

function parseAmount(value: string): number | null {
  if (!value || !value.trim()) return null;

  // Remove currency symbols and whitespace
  const cleaned = value
    .trim()
    .replace(/[$€£¥₹,\s]/g, '')
    .replace(/\(([^)]+)\)/, '-$1'); // Handle (100) as negative

  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;

  return num;
}

function detectColumns(headers: string[]): {
  dateCol: number;
  descCol: number;
  amountCol: number;
  debitCol?: number;
  creditCol?: number;
} | null {
  const normalized = headers.map(h => h.toLowerCase().trim());

  let dateCol = -1;
  let descCol = -1;
  let amountCol = -1;
  let debitCol: number | undefined;
  let creditCol: number | undefined;

  for (let i = 0; i < normalized.length; i++) {
    const h = normalized[i];
    if (dateCol === -1 && (h.includes('date') || h.includes('time') || h === 'dt')) {
      dateCol = i;
    }
    if (descCol === -1 && (h.includes('desc') || h.includes('narr') || h.includes('memo') || h.includes('particular') || h.includes('detail') || h.includes('payee') || h.includes('name'))) {
      descCol = i;
    }
    if (amountCol === -1 && (h === 'amount' || h === 'amt' || h.includes('transaction amount'))) {
      amountCol = i;
    }
    if (h.includes('debit') || h === 'withdrawal' || h.includes('withdraw')) {
      debitCol = i;
    }
    if (h.includes('credit') || h === 'deposit' || h.includes('deposit')) {
      creditCol = i;
    }
  }

  // If no amount column but has debit/credit columns
  if (amountCol === -1 && (debitCol !== undefined || creditCol !== undefined)) {
    return dateCol >= 0 && descCol >= 0 ? { dateCol, descCol, amountCol: -1, debitCol, creditCol } : null;
  }

  if (dateCol === -1 || amountCol === -1) return null;

  // If no description column, use second column as fallback
  if (descCol === -1) {
    descCol = dateCol === 0 ? 1 : 0;
  }

  return { dateCol, descCol, amountCol, debitCol, creditCol };
}

export function parseCSV(csvContent: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const transactions: ParsedTransaction[] = [];

  if (!csvContent || !csvContent.trim()) {
    return { success: false, transactions: [], errors: ['CSV content is empty'], warnings: [] };
  }

  // Split into lines
  const lines = csvContent.trim().split(/\r?\n/);

  if (lines.length < 2) {
    return { success: false, transactions: [], errors: ['CSV must have a header and at least one data row'], warnings: [] };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

  const columns = detectColumns(headers);
  if (!columns) {
    return {
      success: false,
      transactions: [],
      errors: ['Could not detect required columns (date, description, amount). Expected columns like: Date, Description, Amount'],
      warnings: [],
    };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV split (handles basic quoting)
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim().replace(/^["']|["']$/g, ''));

    // Parse date
    const dateStr = cells[columns.dateCol];
    const date = parseDate(dateStr);
    if (!date) {
      warnings.push(`Row ${i + 1}: Could not parse date "${dateStr}"`);
      continue;
    }

    // Parse description
    const description = cells[columns.descCol] || 'Unknown';

    // Parse amount
    let amount: number;
    let type: 'INCOME' | 'EXPENSE';

    if (columns.amountCol >= 0) {
      const parsed = parseAmount(cells[columns.amountCol]);
      if (parsed === null) {
        warnings.push(`Row ${i + 1}: Could not parse amount "${cells[columns.amountCol]}"`);
        continue;
      }
      amount = Math.abs(parsed);
      type = parsed >= 0 ? 'INCOME' : 'EXPENSE';
    } else {
      // Use debit/credit columns
      const debit = columns.debitCol !== undefined ? parseAmount(cells[columns.debitCol]) : null;
      const credit = columns.creditCol !== undefined ? parseAmount(cells[columns.creditCol]) : null;

      if (debit && debit > 0) {
        amount = debit;
        type = 'EXPENSE';
      } else if (credit && credit > 0) {
        amount = credit;
        type = 'INCOME';
      } else {
        warnings.push(`Row ${i + 1}: No valid debit or credit amount`);
        continue;
      }
    }

    transactions.push({ date, description, amount, type });
  }

  if (transactions.length === 0) {
    errors.push('No valid transactions found in CSV');
  }

  return {
    success: transactions.length > 0,
    transactions,
    errors,
    warnings,
  };
}
