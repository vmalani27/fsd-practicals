import subprocess
import sys
import os

def run_sql_script(script_path):
    """Run a SQL script using the database connection"""
    print(f"Running {script_path}...")
    
    # This would typically connect to your database and run the script
    # For now, we'll just print the script contents to show it's ready
    try:
        with open(script_path, 'r') as file:
            content = file.read()
            print(f"✅ Script {script_path} is ready to run")
            print(f"   Contains {len(content.split(';'))} SQL statements")
            return True
    except FileNotFoundError:
        print(f"❌ Script {script_path} not found")
        return False

def main():
    """Run all billing setup scripts in order"""
    scripts = [
        "scripts/003_create_billing_schema.sql",
        "scripts/004_seed_billing_data.sql"
    ]
    
    print("🚀 Setting up billing system database...")
    print("=" * 50)
    
    success_count = 0
    for script in scripts:
        if run_sql_script(script):
            success_count += 1
        print()
    
    print("=" * 50)
    if success_count == len(scripts):
        print("✅ All billing scripts are ready!")
        print("\n📋 Next steps:")
        print("1. Run these scripts in your Supabase SQL editor")
        print("2. Or execute them via the Supabase CLI")
        print("3. Verify tables are created: customers, invoices, invoice_items, payments")
        print("4. Check that sample data is inserted")
    else:
        print(f"⚠️  {len(scripts) - success_count} scripts had issues")
    
    print("\n🔗 Billing system features:")
    print("- Customer management")
    print("- Invoice creation and tracking")
    print("- Payment recording")
    print("- Automatic tax calculations")
    print("- Role-based access control")

if __name__ == "__main__":
    main()
