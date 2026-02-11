import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "supportflow.settings")
django.setup()

with connection.cursor() as cursor:
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    tables = [row[0] for row in cursor.fetchall()]
    print("Found tables:", tables)

    # Tables to drop for a clean slate
    to_drop = [
        'api_user', 'api_complaint', 'api_complainthistory', 
        'api_user_groups', 'api_user_user_permissions',
        'users', 'complaints', 'complaint_history', # Just in case
        'django_migrations' # Careful, but effective for full reset
    ]
    
    for table in to_drop:
        if table in tables:
            print(f"Dropping {table}...")
            cursor.execute(f'DROP TABLE "{table}" CASCADE')

print("Cleanup complete.")
