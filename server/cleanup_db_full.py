import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "supportflow.settings")
django.setup()

with connection.cursor() as cursor:
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    tables = [row[0] for row in cursor.fetchall()]
    print("Found tables:", tables)
    
    for table in tables:
        print(f"Dropping {table}...")
        cursor.execute(f'DROP TABLE "{table}" CASCADE')

print("All tables dropped. Ready for fresh migration.")
