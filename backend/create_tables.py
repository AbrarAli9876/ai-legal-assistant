import mysql.connector
from mysql.connector import errorcode
import os
from dotenv import load_dotenv

load_dotenv() 

DB_CONFIG = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME')
}

# --- 1. ADD THE NEW 'chat_history' TABLE TO THE DICTIONARY ---
TABLES = {}
TABLES['users'] = (
    "CREATE TABLE users ("
    "    id INT AUTO_INCREMENT PRIMARY KEY,"
    "    name VARCHAR(255) NOT NULL,"
    "    email VARCHAR(255) NOT NULL UNIQUE,"
    "    hashed_password VARCHAR(255) NOT NULL,"
    "    phone VARCHAR(20) NULL,"
    "    gender ENUM('male', 'female', 'other', 'prefer_not_to_say') DEFAULT 'prefer_not_to_say',"
    "    profile_pic_url VARCHAR(1024) NULL,"
    "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ");"
)

TABLES['chat_history'] = (
    "CREATE TABLE chat_history ("
    "    id INT AUTO_INCREMENT PRIMARY KEY,"
    "    user_id INT NOT NULL,"
    "    session_id VARCHAR(255) NOT NULL,"
    "    message_text TEXT NOT NULL,"
    "    response_text TEXT NOT NULL,"
    "    relevant_law VARCHAR(1024) NULL,"
    "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
    "    FOREIGN KEY (user_id) REFERENCES users(id)"
    ");"
)
# -----------------------------------------------------------------

def create_database_and_tables():
    connection = None
    cursor = None
    
    if not all([DB_CONFIG['user'], DB_CONFIG['password'], DB_CONFIG['host'], DB_CONFIG['database']]):
        print("❌ Error: Missing database configuration in .env file.")
        return

    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print(f"✅ Successfully connected to database '{DB_CONFIG['database']}'")

        # --- 2. LOOP OVER BOTH TABLES AND CREATE THEM ---
        for table_name in TABLES:
            table_description = TABLES[table_name]
            try:
                print(f"Attempting to create table: {table_name}...", end='')
                cursor.execute(table_description)
                print(" ✅ Created!")
            
            except mysql.connector.Error as err:
                if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                    print(" ⚠️ Already exists.")
                elif err.errno == errorcode.ER_FK_CANNOT_OPEN_PARENT:
                    print(" ❌ FAILED: Foreign key error. Make sure 'users' table exists before 'chat_history'.")
                else:
                    print(f" ❌ FAILED: {err.msg}")
        # ----------------------------------------------------

    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_BAD_DB_ERROR:
            print(f"❌ Error: Database '{DB_CONFIG['database']}' does not exist.")
        elif err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("❌ Error: Wrong username or password.")
        else:
            print(f"❌ Error: {err}")
    
    finally:
        if cursor:
            cursor.close()
            print("Cursor closed.")
        if connection:
            connection.close()
            print("Connection closed.")

if __name__ == "__main__":
    create_database_and_tables()