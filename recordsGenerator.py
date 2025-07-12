import mysql.connector
from faker import Faker
import random
from tqdm import tqdm

# Setup Faker
faker = Faker()

# Connect to MySQL
conn = mysql.connector.connect(
    host='localhost',
    user='your_mysql_user',
    password='your_mysql_password',
    database='hotel_management_system'
)
cursor = conn.cursor()

# ============ CONFIG ============
NUM_RECORDS = 1_000_000
BATCH_SIZE = 1000
# ================================

def insert_roles_and_permissions():
    roles = ['guest', 'staff', 'admin']
    for role in roles:
        cursor.execute("INSERT IGNORE INTO roles (role_name) VALUES (%s)", (role,))
    permissions = ['view_room', 'book_room', 'manage_users', 'manage_rooms']
    for perm in permissions:
        cursor.execute("INSERT IGNORE INTO permissions (permission_name) VALUES (%s)", (perm,))
    conn.commit()

def generate_users():
    role_ids = [1, 2, 3]  # Assuming IDs from the inserted roles
    for _ in tqdm(range(NUM_RECORDS)):
        full_name = faker.name()
        email = faker.unique.email()
        username = faker.unique.user_name()
        password_hash = faker.sha256()
        phone = faker.phone_number()
        role_id = random.choice(role_ids)
        cursor.execute("""
            INSERT INTO users (full_name, email, username, password_hash, phone, role_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (full_name, email, username, password_hash, phone, role_id))
        if _ % BATCH_SIZE == 0:
            conn.commit()
    conn.commit()

def generate_guest_details():
    cursor.execute("SELECT user_id FROM users WHERE role_id=1 LIMIT %s", (NUM_RECORDS,))
    guest_ids = [row[0] for row in cursor.fetchall()]
    for user_id in tqdm(guest_ids):
        address = faker.address()
        cursor.execute("""
            INSERT INTO guest_details (user_id, address)
            VALUES (%s, %s)
        """, (user_id, address))
        if user_id % BATCH_SIZE == 0:
            conn.commit()
    conn.commit()

def generate_rooms():
    for i in tqdm(range(NUM_RECORDS)):
        room_number = f"{i+1:05d}"
        type_ = random.choice(['Single', 'Double', 'Suite'])
        status = random.choice(['available', 'booked', 'maintenance'])
        price = round(random.uniform(50, 500), 2)
        description = faker.text(max_nb_chars=200)
        cursor.execute("""
            INSERT INTO rooms (room_number, type, status, price, description)
            VALUES (%s, %s, %s, %s, %s)
        """, (room_number, type_, status, price, description))
        if i % BATCH_SIZE == 0:
            conn.commit()
    conn.commit()

def generate_bookings():
    cursor.execute("SELECT user_id FROM users LIMIT %s", (NUM_RECORDS,))
    user_ids = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT room_id FROM rooms LIMIT %s", (NUM_RECORDS,))
    room_ids = [row[0] for row in cursor.fetchall()]
    for _ in tqdm(range(NUM_RECORDS)):
        user_id = random.choice(user_ids)
        room_id = random.choice(room_ids)
        checkin = faker.date_between(start_date='-1y', end_date='today')
        checkout = faker.date_between(start_date=checkin, end_date='+30d')
        status = random.choice(['confirmed', 'checked_in', 'checked_out', 'cancelled'])
        cursor.execute("""
            INSERT INTO bookings (user_id, room_id, checkin_date, checkout_date, status)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, room_id, checkin, checkout, status))
        if _ % BATCH_SIZE == 0:
            conn.commit()
    conn.commit()

def generate_payments():
    cursor.execute("SELECT booking_id FROM bookings LIMIT %s", (NUM_RECORDS,))
    booking_ids = [row[0] for row in cursor.fetchall()]
    for booking_id in tqdm(booking_ids):
        amount = round(random.uniform(50, 1000), 2)
        method = random.choice(['credit_card', 'cash', 'paypal'])
        cursor.execute("""
            INSERT INTO payments (booking_id, amount, method)
            VALUES (%s, %s, %s)
        """, (booking_id, amount, method))
        if booking_id % BATCH_SIZE == 0:
            conn.commit()
    conn.commit()

def generate_reviews():
    cursor.execute("SELECT user_id FROM users LIMIT %s", (NUM_RECORDS,))
    user_ids = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT room_id FROM rooms LIMIT %s", (NUM_RECORDS,))
    room_ids = [row[0] for row in cursor.fetchall()]
    for _ in tqdm(range(NUM_RECORDS)):
        user_id = random.choice(user_ids)
        room_id = random.choice(room_ids)
        rating = random.randint(1, 5)
        comment = faker.text(max_nb_chars=200)
        cursor.execute("""
            INSERT INTO reviews (user_id, room_id, rating, comment)
            VALUES (%s, %s, %s, %s)
        """, (user_id, room_id, rating, comment))
        if _ % BATCH_SIZE == 0:
            conn.commit()
    conn.commit()

def generate_services():
    for i in tqdm(range(NUM_RECORDS)):
        name = f"Service {i+1}"
        price = round(random.uniform(10, 100), 2)
        description = faker.text(max_nb_chars=100)
        cursor.execute("""
            INSERT INTO services (name, price, description)
            VALUES (%s, %s, %s)
        """, (name, price, description))
        if i % BATCH_SIZE == 0:
            conn.commit()
    conn.commit()

def generate_booked_services():
    cursor.execute("SELECT booking_id FROM bookings LIMIT %s", (NUM_RECORDS,))
    booking_ids = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT service_id FROM services LIMIT %s", (NUM_RECORDS,))
    service_ids = [row[0] for row in cursor.fetchall()]
    for _ in tqdm(range(NUM_RECORDS)):
        booking_id = random.choice(booking_ids)
        service_id = random.choice(service_ids)
        quantity = random.randint(1, 5)
        cursor.execute("""
            INSERT INTO booked_services (booking_id, service_id, quantity)
            VALUES (%s, %s, %s)
        """, (booking_id, service_id, quantity))
        if _ % BATCH_SIZE == 0:
            conn.commit()
    conn.commit()

def generate_room_maintenance():
    cursor.execute("SELECT room_id FROM rooms LIMIT %s", (NUM_RECORDS,))
    room_ids = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT user_id FROM users LIMIT %s", (NUM_RECORDS,))
    user_ids = [row[0] for row in cursor.fetchall()]
    for _ in tqdm(range(NUM_RECORDS)):
        room_id = random.choice(room_ids)
        user_id = random.choice(user_ids)
        description = faker.text(max_nb_chars=200)
        cursor.execute("""
            INSERT INTO roommaintenance (room_id, user_id, description)
            VALUES (%s, %s, %s)
        """, (room_id, user_id, description))
        if _ % BATCH_SIZE == 0:
            conn.commit()
    conn.commit()

# ================================
# MAIN
# ================================
if __name__ == "__main__":
    print("Inserting roles and permissions...")
    insert_roles_and_permissions()

    print("Generating users...")
    generate_users()

    print("Generating guest details...")
    generate_guest_details()

    print("Generating rooms...")
    generate_rooms()

    print("Generating bookings...")
    generate_bookings()

    print("Generating payments...")
    generate_payments()

    print("Generating reviews...")
    generate_reviews()

    print("Generating services...")
    generate_services()

    print("Generating booked services...")
    generate_booked_services()

    print("Generating room maintenance...")
    generate_room_maintenance()

    cursor.close()
    conn.close()
    print("DONE ✅")
