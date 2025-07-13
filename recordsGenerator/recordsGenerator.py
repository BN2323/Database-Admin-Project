import mysql.connector
from faker import Faker
import random
from tqdm import tqdm

# Setup Faker and DB Connection
faker = Faker()
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='bnjk2323',
    database='hotel_management_system'
)
cursor = conn.cursor()

NUM_RECORDS = 1_000_000
BATCH_SIZE = 1000

def batch_insert(query, data):
    for i in range(0, len(data), BATCH_SIZE):
        cursor.executemany(query, data[i:i+BATCH_SIZE])
        conn.commit()

def insert_roles_and_permissions():
    roles = ['guest', 'staff', 'admin']
    perms = ['view_room', 'book_room', 'manage_users', 'manage_rooms']
    cursor.executemany("INSERT IGNORE INTO roles (role_name) VALUES (%s)", [(r,) for r in roles])
    cursor.executemany("INSERT IGNORE INTO permissions (permission_name) VALUES (%s)", [(p,) for p in perms])
    conn.commit()

# def generate_users():
#     cursor.execute("SELECT role_id FROM roles")
#     role_ids = [row[0] for row in cursor.fetchall()]
#     data = []
#     for _ in tqdm(range(NUM_RECORDS), desc="Users"):
#         data.append((
#             faker.name(), faker.unique.email(), faker.unique.user_name(),
#             faker.sha256(), faker.msisdn()[:20], random.choice(role_ids)
#         ))
#         if len(data) % BATCH_SIZE == 0:
#             batch_insert("""
#                 INSERT INTO users (full_name, email, username, password_hash, phone, role_id)
#                 VALUES (%s, %s, %s, %s, %s, %s)
#             """, data)
#             data = []
#     if data:
#         batch_insert("""
#             INSERT INTO users (full_name, email, username, password_hash, phone, role_id)
#             VALUES (%s, %s, %s, %s, %s, %s)
#         """, data)

def generate_users():
    cursor.execute("SELECT role_id FROM roles")
    role_ids = [row[0] for row in cursor.fetchall()]
    data = set()  # store (email, username) to avoid dupes
    insert_batch = []

    for _ in tqdm(range(NUM_RECORDS), desc="Users"):
        while True:
            email = faker.email()
            username = faker.user_name()
            key = (email, username)
            if key not in data:
                data.add(key)
                break  # found a unique one

        insert_batch.append((
            faker.name(), email, username,
            faker.sha256(), faker.msisdn()[:20],
            random.choice(role_ids)
        ))

        if len(insert_batch) >= BATCH_SIZE:
            batch_insert("""
                INSERT IGNORE INTO users (full_name, email, username, password_hash, phone, role_id)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, insert_batch)
            insert_batch = []

    if insert_batch:
        batch_insert("""
            INSERT IGNORE INTO users (full_name, email, username, password_hash, phone, role_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, insert_batch)


def generate_guest_details():
    cursor.execute("SELECT user_id FROM users WHERE role_id = (SELECT role_id FROM roles WHERE role_name = 'guest')")
    guest_ids = [row[0] for row in cursor.fetchall()]
    data = [(gid, faker.address()) for gid in tqdm(guest_ids, desc="Guest Details")]
    batch_insert("INSERT INTO guest_details (user_id, address) VALUES (%s, %s)", data)

def generate_rooms():
    data = []
    for i in tqdm(range(NUM_RECORDS), desc="Rooms"):
        data.append((
            f"{i+1:05d}", random.choice(['Single', 'Double', 'Suite']),
            random.choice(['available', 'booked', 'maintenance']),
            round(random.uniform(50, 500), 2), faker.text(max_nb_chars=200)
        ))
        if len(data) % BATCH_SIZE == 0:
            batch_insert("""
                INSERT INTO rooms (room_number, type, status, price, description)
                VALUES (%s, %s, %s, %s, %s)
            """, data)
            data = []
    if data:
        batch_insert("""
            INSERT INTO rooms (room_number, type, status, price, description)
            VALUES (%s, %s, %s, %s, %s)
        """, data)

def generate_bookings():
    cursor.execute("SELECT user_id FROM users")
    user_ids = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT room_id FROM rooms")
    room_ids = [row[0] for row in cursor.fetchall()]
    data = []
    for _ in tqdm(range(NUM_RECORDS), desc="Bookings"):
        checkin = faker.date_between(start_date='-1y', end_date='today')
        checkout = faker.date_between(start_date=checkin, end_date='+30d')
        data.append((
            random.choice(user_ids), random.choice(room_ids),
            checkin, checkout, random.choice(['confirmed', 'checked_in', 'checked_out', 'cancelled'])
        ))
        if len(data) % BATCH_SIZE == 0:
            batch_insert("""
                INSERT INTO bookings (user_id, room_id, checkin_date, checkout_date, status)
                VALUES (%s, %s, %s, %s, %s)
            """, data)
            data = []
    if data:
        batch_insert("""
            INSERT INTO bookings (user_id, room_id, checkin_date, checkout_date, status)
            VALUES (%s, %s, %s, %s, %s)
        """, data)

def generate_payments():
    cursor.execute("SELECT booking_id FROM bookings")
    booking_ids = [row[0] for row in cursor.fetchall()]
    data = []
    for booking_id in tqdm(booking_ids, desc="Payments"):
        data.append((
            booking_id, round(random.uniform(50, 1000), 2), random.choice(['credit_card', 'cash', 'paypal'])
        ))
        if len(data) % BATCH_SIZE == 0:
            batch_insert("""
                INSERT INTO payments (booking_id, amount, method)
                VALUES (%s, %s, %s)
            """, data)
            data = []
    if data:
        batch_insert("""
            INSERT INTO payments (booking_id, amount, method)
            VALUES (%s, %s, %s)
        """, data)

def generate_reviews():
    cursor.execute("SELECT user_id FROM users")
    user_ids = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT room_id FROM rooms")
    room_ids = [row[0] for row in cursor.fetchall()]
    data = []
    for _ in tqdm(range(NUM_RECORDS), desc="Reviews"):
        data.append((
            random.choice(user_ids), random.choice(room_ids),
            random.randint(1, 5), faker.text(max_nb_chars=200)
        ))
        if len(data) % BATCH_SIZE == 0:
            batch_insert("""
                INSERT INTO reviews (user_id, room_id, rating, comment)
                VALUES (%s, %s, %s, %s)
            """, data)
            data = []
    if data:
        batch_insert("""
            INSERT INTO reviews (user_id, room_id, rating, comment)
            VALUES (%s, %s, %s, %s)
        """, data)

def generate_services():
    data = []
    for i in tqdm(range(NUM_RECORDS), desc="Services"):
        data.append((f"Service {i+1}", round(random.uniform(10, 100), 2), faker.text(max_nb_chars=100)))
        if len(data) % BATCH_SIZE == 0:
            batch_insert("""
                INSERT INTO services (name, price, description)
                VALUES (%s, %s, %s)
            """, data)
            data = []
    if data:
        batch_insert("""
            INSERT INTO services (name, price, description)
            VALUES (%s, %s, %s)
        """, data)

def generate_booked_services():
    cursor.execute("SELECT booking_id FROM bookings")
    booking_ids = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT service_id FROM services")
    service_ids = [row[0] for row in cursor.fetchall()]
    data = []
    for _ in tqdm(range(NUM_RECORDS), desc="Booked Services"):
        data.append((
            random.choice(booking_ids), random.choice(service_ids), random.randint(1, 5)
        ))
        if len(data) % BATCH_SIZE == 0:
            batch_insert("""
                INSERT INTO booked_services (booking_id, service_id, quantity)
                VALUES (%s, %s, %s)
            """, data)
            data = []
    if data:
        batch_insert("""
            INSERT INTO booked_services (booking_id, service_id, quantity)
            VALUES (%s, %s, %s)
        """, data)

def generate_room_maintenance():
    cursor.execute("SELECT room_id FROM rooms")
    room_ids = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT user_id FROM users")
    user_ids = [row[0] for row in cursor.fetchall()]
    data = []
    for _ in tqdm(range(NUM_RECORDS), desc="Room Maintenance"):
        data.append((
            random.choice(room_ids), random.choice(user_ids), faker.text(max_nb_chars=200)
        ))
        if len(data) % BATCH_SIZE == 0:
            batch_insert("""
                INSERT INTO roommaintenance (room_id, user_id, description)
                VALUES (%s, %s, %s)
            """, data)
            data = []
    if data:
        batch_insert("""
            INSERT INTO roommaintenance (room_id, user_id, description)
            VALUES (%s, %s, %s)
        """, data)

# Main Execution
if __name__ == "__main__":
    insert_roles_and_permissions()
    generate_users()
    generate_guest_details()
    generate_rooms()
    generate_bookings()
    generate_payments()
    generate_reviews()
    generate_services()
    generate_booked_services()
    generate_room_maintenance()
    cursor.close()
    conn.close()
    print("Database population complete.")
