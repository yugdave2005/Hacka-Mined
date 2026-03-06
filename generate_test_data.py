import csv
import random
from datetime import datetime, timedelta

def generate_data():
    transactions = []
    
    # Start: Jan 1, 2025. End: Dec 31, 2025
    start_date = datetime(2025, 1, 1)
    
    # Base MRR (Monthly Recurring Revenue)
    mrr = 15000
    mrr_growth_rate = 1.10 # 10% month over month growth
    
    # Base Payroll
    payroll = -20000
    
    # Loop over 12 months
    for month in range(1, 13):
        # Determine days in month
        if month in [1, 3, 5, 7, 8, 10, 12]:
            days = 31
        elif month == 2:
            days = 28
        else:
            days = 30
            
        current_month_mrr = int(mrr * (mrr_growth_rate ** (month - 1)))
        
        # 1. Add Subscription Revenue (spread out over the month)
        # We simulate 20-30 separate Stripe payouts a month
        num_payouts = random.randint(20, 35)
        for _ in range(num_payouts):
            day = random.randint(1, days)
            amount = round(random.uniform(0.5, 1.5) * (current_month_mrr / num_payouts), 2)
            d = datetime(2025, month, day)
            transactions.append((d, "Stripe Transfer - Subscription Revenue", amount))
            
        # 2. Add Enterpise/Client Payments (1-3 large ones)
        num_enterprise = random.randint(1, 3)
        for _ in range(num_enterprise):
            day = random.randint(1, days)
            # Enterprise payments become larger as year progresses
            amount = round(random.uniform(3000, 8000) * (1 + 0.1 * month), 2)
            d = datetime(2025, month, day)
            transactions.append((d, "Stripe Transfer - Client Payment", amount))
            
        # 3. Payroll (Semi-monthly)
        # Payroll grows at month 6 (hiring new dev)
        current_payroll = payroll
        if month >= 6:
            current_payroll -= 8000
        if month >= 10:
            current_payroll -= 6000
            
        # 15th and 28th usually
        d1 = datetime(2025, month, 15)
        d2 = datetime(2025, month, 28)
        transactions.append((d1, "Gusto Payroll - Mid-month", current_payroll / 2))
        transactions.append((d2, f"Gusto Payroll - Month End", current_payroll / 2))
        
        # 4. Rent (1st of month)
        transactions.append((datetime(2025, month, 1), "Office Rent Payment", -3500))
        
        # 5. AWS Bill (3rd of month, correlates with revenue)
        aws_bill = round(-500 * (1 + 0.15 * month) - random.uniform(0, 100), 2)
        transactions.append((datetime(2025, month, 3), "AWS Monthly Bill", aws_bill))
        
        # 6. Ads Campaign
        meta_ads = round(random.uniform(-1000, -2000) * (1 + 0.05 * month), 2)
        google_ads = round(random.uniform(-1500, -3000) * (1 + 0.05 * month), 2)
        transactions.append((datetime(2025, month, 7), "Meta Ads Campaign", meta_ads))
        transactions.append((datetime(2025, month, 12), "Google Ads Campaign", google_ads))
        
        # 7. SaaS Subscriptions
        transactions.append((datetime(2025, month, 15), "Vercel Pro Plan", -40))
        transactions.append((datetime(2025, month, 16), "GitHub Enterprise", -44))
        transactions.append((datetime(2025, month, 18), "Notion Team Plan", -96))
        transactions.append((datetime(2025, month, 22), "Slack Business+", -150))
        transactions.append((datetime(2025, month, 10), "Linear App", -48))
        
        # 8. Misc office expenses (travel, meals, internet)
        for _ in range(random.randint(4, 8)):
            day = random.randint(1, days)
            desc = random.choice(["Uber Rides", "Team Lunch - DoorDash", "WeWork Day Pass", "Starbucks", "Internet Service - Comcast", "Office Supplies - Amazon"])
            amount = round(random.uniform(-15, -250), 2)
            transactions.append((datetime(2025, month, day), desc, amount))

    # Sort transactions by date
    transactions.sort(key=lambda x: x[0])
    
    # Write to CSV
    with open("sample_bank_statement.csv", "w", newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Date", "Description", "Amount"])
        for t in transactions:
            writer.writerow([t[0].strftime("%d-%m-%Y"), t[1], t[2]])
            
if __name__ == "__main__":
    generate_data()
    print("CSV updated!")
