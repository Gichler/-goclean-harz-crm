from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app)

# Database initialization
def init_db():
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    # Create tables if they don't exist
    c.execute('''CREATE TABLE IF NOT EXISTS customers
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  customer_number TEXT UNIQUE,
                  first_name TEXT NOT NULL,
                  last_name TEXT NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  phone TEXT,
                  mobile TEXT,
                  company_name TEXT,
                  street TEXT,
                  house_number TEXT,
                  postal_code TEXT,
                  city TEXT,
                  customer_type TEXT DEFAULT 'private',
                  preferred_contact_method TEXT DEFAULT 'email',
                  is_active BOOLEAN DEFAULT 1,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS orders
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  order_number TEXT UNIQUE,
                  customer_id INTEGER,
                  title TEXT NOT NULL,
                  description TEXT,
                  service_type TEXT,
                  service_street TEXT,
                  service_house_number TEXT,
                  service_postal_code TEXT,
                  service_city TEXT,
                  scheduled_date DATE,
                  scheduled_time TIME,
                  estimated_duration INTEGER,
                  estimated_price REAL,
                  final_price REAL,
                  priority TEXT DEFAULT 'normal',
                  status TEXT DEFAULT 'pending',
                  special_instructions TEXT,
                  access_instructions TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  completed_at TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS quotes
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  quote_number TEXT UNIQUE,
                  customer_id INTEGER,
                  title TEXT NOT NULL,
                  description TEXT,
                  service_type TEXT,
                  service_street TEXT,
                  service_house_number TEXT,
                  service_postal_code TEXT,
                  service_city TEXT,
                  valid_until DATE,
                  tax_rate REAL DEFAULT 19.0,
                  status TEXT DEFAULT 'draft',
                  notes TEXT,
                  terms_conditions TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS quote_items
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  quote_id INTEGER,
                  description TEXT NOT NULL,
                  quantity REAL DEFAULT 1,
                  unit TEXT DEFAULT 'Stück',
                  unit_price REAL DEFAULT 0,
                  notes TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS invoices
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  invoice_number TEXT UNIQUE,
                  customer_id INTEGER,
                  order_id INTEGER,
                  invoice_date DATE,
                  due_date DATE,
                  tax_rate REAL DEFAULT 19.0,
                  payment_method TEXT DEFAULT 'bank_transfer',
                  status TEXT DEFAULT 'draft',
                  notes TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS communications
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  customer_id INTEGER,
                  order_id INTEGER,
                  type TEXT NOT NULL,
                  direction TEXT DEFAULT 'outbound',
                  subject TEXT,
                  content TEXT NOT NULL,
                  contact_person TEXT,
                  contact_method TEXT,
                  status TEXT DEFAULT 'completed',
                  communication_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  follow_up_date TIMESTAMP,
                  follow_up_completed BOOLEAN DEFAULT 0,
                  tags TEXT,
                  is_important BOOLEAN DEFAULT 0)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS time_entries
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER DEFAULT 1,
                  user_name TEXT NOT NULL,
                  customer_id INTEGER,
                  order_id INTEGER,
                  start_time TIMESTAMP NOT NULL,
                  end_time TIMESTAMP,
                  duration REAL,
                  description TEXT NOT NULL,
                  activity_type TEXT DEFAULT 'work',
                  status TEXT DEFAULT 'completed',
                  notes TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS quality_checks
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  order_id INTEGER,
                  customer_id INTEGER,
                  inspector_name TEXT NOT NULL,
                  check_date DATE NOT NULL,
                  check_type TEXT NOT NULL,
                  overall_score REAL NOT NULL,
                  status TEXT DEFAULT 'pending',
                  notes TEXT,
                  check_details TEXT,
                  recommendations TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS inventory_items
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  description TEXT,
                  category TEXT,
                  sku TEXT,
                  quantity INTEGER DEFAULT 0,
                  unit TEXT DEFAULT 'Stück',
                  unit_price REAL DEFAULT 0,
                  reorder_point INTEGER DEFAULT 0,
                  supplier TEXT,
                  location TEXT,
                  status TEXT DEFAULT 'active',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Insert sample data
    if c.execute('SELECT COUNT(*) FROM customers').fetchone()[0] == 0:
        # Sample customers
        customers = [
            ('CUST-001', 'Max', 'Mustermann', 'max@example.com', '0123456789', '0987654321', 'Musterfirma GmbH', 'Musterstraße', '123', '12345', 'Musterstadt', 'business', 'email'),
            ('CUST-002', 'Anna', 'Schmidt', 'anna@example.com', '0123456790', '0987654322', None, 'Beispielweg', '456', '54321', 'Beispielstadt', 'private', 'phone'),
        ]
        c.executemany('''INSERT INTO customers 
                         (customer_number, first_name, last_name, email, phone, mobile, company_name, street, house_number, postal_code, city, customer_type, preferred_contact_method)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', customers)
        
        # Sample orders
        orders = [
            ('ORD-001', 1, 'Büroreinigung Hauptgebäude', 'Regelmäßige Reinigung der Büroräume', 'building_cleaning', 'Musterstraße', '123', '12345', 'Musterstadt', '2024-01-15', '09:00', 120, 150.00, None, 'normal', 'confirmed'),
            ('ORD-002', 2, 'Gartenpflege Einfamilienhaus', 'Frühjahrsputz im Garten', 'garden_maintenance', 'Beispielweg', '456', '54321', 'Beispielstadt', '2024-01-20', '14:00', 180, 200.00, None, 'high', 'pending'),
        ]
        c.executemany('''INSERT INTO orders 
                         (order_number, customer_id, title, description, service_type, service_street, service_house_number, service_postal_code, service_city, scheduled_date, scheduled_time, estimated_duration, estimated_price, final_price, priority, status)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', orders)
        
        # Sample inventory items
        inventory = [
            ('Allzweckreiniger', 'Universalreiniger für alle Oberflächen', 'Reinigungsmittel', 'AW-001', 50, 'Liter', 5.99, 10, 'Musterlieferant', 'Regal A1'),
            ('Mikrofasertücher', 'Hochwertige Mikrofasertücher', 'Verbrauchsmaterial', 'MF-001', 100, 'Stück', 2.49, 20, 'Musterlieferant', 'Regal B2'),
        ]
        c.executemany('''INSERT INTO inventory_items 
                         (name, description, category, sku, quantity, unit, unit_price, reorder_point, supplier, location)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', inventory)
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# Helper function to get customer data
def get_customer_data(customer_id):
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    c.execute('SELECT * FROM customers WHERE id = ?', (customer_id,))
    customer = c.fetchone()
    conn.close()
    
    if customer:
        return {
            'id': customer[0],
            'customer_number': customer[1],
            'first_name': customer[2],
            'last_name': customer[3],
            'email': customer[4],
            'phone': customer[5],
            'mobile': customer[6],
            'company_name': customer[7],
            'street': customer[8],
            'house_number': customer[9],
            'postal_code': customer[10],
            'city': customer[11],
            'customer_type': customer[12],
            'preferred_contact_method': customer[13],
            'is_active': customer[14],
            'created_at': customer[15],
            'updated_at': customer[16]
        }
    return None

# Helper function to get order data
def get_order_data(order_id):
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    c.execute('SELECT * FROM orders WHERE id = ?', (order_id,))
    order = c.fetchone()
    conn.close()
    
    if order:
        return {
            'id': order[0],
            'order_number': order[1],
            'customer_id': order[2],
            'title': order[3],
            'description': order[4],
            'service_type': order[5],
            'service_street': order[6],
            'service_house_number': order[7],
            'service_postal_code': order[8],
            'service_city': order[9],
            'scheduled_date': order[10],
            'scheduled_time': order[11],
            'estimated_duration': order[12],
            'estimated_price': order[13],
            'final_price': order[14],
            'priority': order[15],
            'status': order[16],
            'special_instructions': order[17],
            'access_instructions': order[18],
            'created_at': order[19],
            'completed_at': order[20]
        }
    return None

# API Routes

@app.route('/api/customers', methods=['GET'])
def get_customers():
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    search = request.args.get('search', '')
    customer_type = request.args.get('customer_type', '')
    
    query = 'SELECT * FROM customers WHERE 1=1'
    params = []
    
    if search:
        query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company_name LIKE ?)'
        search_term = f'%{search}%'
        params.extend([search_term, search_term, search_term, search_term])
    
    if customer_type:
        query += ' AND customer_type = ?'
        params.append(customer_type)
    
    query += ' ORDER BY created_at DESC'
    
    c.execute(query, params)
    customers = c.fetchall()
    conn.close()
    
    customer_list = []
    for customer in customers:
        customer_data = {
            'id': customer[0],
            'customer_number': customer[1],
            'first_name': customer[2],
            'last_name': customer[3],
            'email': customer[4],
            'phone': customer[5],
            'mobile': customer[6],
            'company_name': customer[7],
            'street': customer[8],
            'house_number': customer[9],
            'postal_code': customer[10],
            'city': customer[11],
            'customer_type': customer[12],
            'preferred_contact_method': customer[13],
            'is_active': customer[14],
            'created_at': customer[15],
            'updated_at': customer[16]
        }
        customer_list.append(customer_data)
    
    return jsonify({'customers': customer_list})

@app.route('/api/customers', methods=['POST'])
def create_customer():
    data = request.json
    
    # Generate customer number
    customer_number = f"CUST-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO customers 
                 (customer_number, first_name, last_name, email, phone, mobile, company_name, street, house_number, postal_code, city, customer_type, preferred_contact_method)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (customer_number, data['first_name'], data['last_name'], data['email'], 
               data.get('phone'), data.get('mobile'), data.get('company_name'), 
               data.get('street'), data.get('house_number'), data.get('postal_code'), 
               data.get('city'), data.get('customer_type', 'private'), 
               data.get('preferred_contact_method', 'email')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Customer created successfully', 'customer_number': customer_number}), 201

@app.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    customer = get_customer_data(customer_id)
    if customer:
        return jsonify(customer)
    return jsonify({'error': 'Customer not found'}), 404

@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    status_filter = request.args.get('status', '')
    service_type_filter = request.args.get('service_type', '')
    
    query = '''SELECT o.*, c.first_name, c.last_name, c.company_name 
               FROM orders o 
               LEFT JOIN customers c ON o.customer_id = c.id 
               WHERE 1=1'''
    params = []
    
    if status_filter:
        query += ' AND o.status = ?'
        params.append(status_filter)
    
    if service_type_filter:
        query += ' AND o.service_type = ?'
        params.append(service_type_filter)
    
    query += ' ORDER BY o.created_at DESC'
    
    c.execute(query, params)
    orders = c.fetchall()
    conn.close()
    
    order_list = []
    for order in orders:
        order_data = {
            'id': order[0],
            'order_number': order[1],
            'customer_id': order[2],
            'title': order[3],
            'description': order[4],
            'service_type': order[5],
            'service_street': order[6],
            'service_house_number': order[7],
            'service_postal_code': order[8],
            'service_city': order[9],
            'scheduled_date': order[10],
            'scheduled_time': order[11],
            'estimated_duration': order[12],
            'estimated_price': order[13],
            'final_price': order[14],
            'priority': order[15],
            'status': order[16],
            'special_instructions': order[17],
            'access_instructions': order[18],
            'created_at': order[19],
            'completed_at': order[20],
            'customer': {
                'first_name': order[21],
                'last_name': order[22],
                'company_name': order[23]
            } if order[21] else None
        }
        order_list.append(order_data)
    
    return jsonify({'orders': order_list})

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    
    # Generate order number
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO orders 
                 (order_number, customer_id, title, description, service_type, service_street, service_house_number, service_postal_code, service_city, scheduled_date, scheduled_time, estimated_duration, estimated_price, priority, special_instructions, access_instructions)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (order_number, data['customer_id'], data['title'], data.get('description'), 
               data['service_type'], data.get('service_street'), data.get('service_house_number'), 
               data.get('service_postal_code'), data.get('service_city'), data.get('scheduled_date'), 
               data.get('scheduled_time'), data.get('estimated_duration'), data.get('estimated_price'), 
               data.get('priority', 'normal'), data.get('special_instructions'), data.get('access_instructions')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Order created successfully', 'order_number': order_number}), 201

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = get_order_data(order_id)
    if order:
        # Add customer data
        customer = get_customer_data(order['customer_id'])
        if customer:
            order['customer'] = customer
        return jsonify(order)
    return jsonify({'error': 'Order not found'}), 404

@app.route('/api/orders/dashboard', methods=['GET'])
def get_orders_dashboard():
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    # Get order counts by status
    c.execute('SELECT status, COUNT(*) FROM orders GROUP BY status')
    status_counts = dict(c.fetchall())
    
    # Get today's orders
    today = datetime.now().date()
    c.execute('SELECT COUNT(*) FROM orders WHERE DATE(scheduled_date) = ?', (today,))
    todays_orders = c.fetchone()[0]
    
    # Get this week's orders
    week_start = today - timedelta(days=today.weekday())
    c.execute('SELECT COUNT(*) FROM orders WHERE DATE(scheduled_date) >= ?', (week_start,))
    this_week_orders = c.fetchone()[0]
    
    # Get total customers
    c.execute('SELECT COUNT(*) FROM customers')
    total_customers = c.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'order_counts': {
            'pending': status_counts.get('pending', 0),
            'confirmed': status_counts.get('confirmed', 0),
            'in_progress': status_counts.get('in_progress', 0),
            'completed': status_counts.get('completed', 0)
        },
        'todays_orders': todays_orders,
        'this_week_orders': this_week_orders,
        'total_customers': total_customers
    })

@app.route('/api/quotes', methods=['GET'])
def get_quotes():
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    status_filter = request.args.get('status', '')
    service_type_filter = request.args.get('service_type', '')
    
    query = '''SELECT q.*, c.first_name, c.last_name, c.company_name 
               FROM quotes q 
               LEFT JOIN customers c ON q.customer_id = c.id 
               WHERE 1=1'''
    params = []
    
    if status_filter:
        query += ' AND q.status = ?'
        params.append(status_filter)
    
    if service_type_filter:
        query += ' AND q.service_type = ?'
        params.append(service_type_filter)
    
    query += ' ORDER BY q.created_at DESC'
    
    c.execute(query, params)
    quotes = c.fetchall()
    conn.close()
    
    quote_list = []
    for quote in quotes:
        # Calculate totals (simplified)
        total_amount = 100.0  # Placeholder
        quote_data = {
            'id': quote[0],
            'quote_number': quote[1],
            'customer_id': quote[2],
            'title': quote[3],
            'description': quote[4],
            'service_type': quote[5],
            'service_street': quote[6],
            'service_house_number': quote[7],
            'service_postal_code': quote[8],
            'service_city': quote[9],
            'valid_until': quote[10],
            'tax_rate': quote[11],
            'status': quote[12],
            'notes': quote[13],
            'terms_conditions': quote[14],
            'created_at': quote[15],
            'total_amount': total_amount,
            'customer': {
                'first_name': quote[16],
                'last_name': quote[17],
                'company_name': quote[18]
            } if quote[16] else None
        }
        quote_list.append(quote_data)
    
    return jsonify({'quotes': quote_list})

@app.route('/api/quotes', methods=['POST'])
def create_quote():
    data = request.json
    
    # Generate quote number
    quote_number = f"QUOTE-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO quotes 
                 (quote_number, customer_id, title, description, service_type, service_street, service_house_number, service_postal_code, service_city, valid_until, tax_rate, notes, terms_conditions)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (quote_number, data['customer_id'], data['title'], data.get('description'), 
               data['service_type'], data.get('service_street'), data.get('service_house_number'), 
               data.get('service_postal_code'), data.get('service_city'), data.get('valid_until'), 
               data.get('tax_rate', 19.0), data.get('notes'), data.get('terms_conditions')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Quote created successfully', 'quote_number': quote_number}), 201

@app.route('/api/quotes/<int:quote_id>', methods=['GET'])
def get_quote(quote_id):
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    c.execute('SELECT * FROM quotes WHERE id = ?', (quote_id,))
    quote = c.fetchone()
    
    if quote:
        # Get quote items
        c.execute('SELECT * FROM quote_items WHERE quote_id = ?', (quote_id,))
        items = c.fetchall()
        
        quote_data = {
            'id': quote[0],
            'quote_number': quote[1],
            'customer_id': quote[2],
            'title': quote[3],
            'description': quote[4],
            'service_type': quote[5],
            'service_street': quote[6],
            'service_house_number': quote[7],
            'service_postal_code': quote[8],
            'service_city': quote[9],
            'valid_until': quote[10],
            'tax_rate': quote[11],
            'status': quote[12],
            'notes': quote[13],
            'terms_conditions': quote[14],
            'created_at': quote[15],
            'quote_items': [
                {
                    'description': item[2],
                    'quantity': item[3],
                    'unit': item[4],
                    'unit_price': item[5],
                    'notes': item[6],
                    'total_price': item[3] * item[5]
                } for item in items
            ],
            'subtotal': sum(item[3] * item[5] for item in items),
            'tax_amount': sum(item[3] * item[5] for item in items) * quote[11] / 100,
            'total_amount': sum(item[3] * item[5] for item in items) * (1 + quote[11] / 100)
        }
        
        conn.close()
        return jsonify(quote_data)
    
    conn.close()
    return jsonify({'error': 'Quote not found'}), 404

@app.route('/api/communications', methods=['GET'])
def get_communications():
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    type_filter = request.args.get('type', '')
    status_filter = request.args.get('status', '')
    
    query = '''SELECT comm.*, c.first_name, c.last_name, c.company_name, o.order_number, o.title as order_title
               FROM communications comm 
               LEFT JOIN customers c ON comm.customer_id = c.id 
               LEFT JOIN orders o ON comm.order_id = o.id 
               WHERE 1=1'''
    params = []
    
    if type_filter:
        query += ' AND comm.type = ?'
        params.append(type_filter)
    
    if status_filter:
        query += ' AND comm.status = ?'
        params.append(status_filter)
    
    query += ' ORDER BY comm.communication_date DESC'
    
    c.execute(query, params)
    communications = c.fetchall()
    conn.close()
    
    comm_list = []
    for comm in communications:
        comm_data = {
            'id': comm[0],
            'customer_id': comm[1],
            'order_id': comm[2],
            'type': comm[3],
            'direction': comm[4],
            'subject': comm[5],
            'content': comm[6],
            'contact_person': comm[7],
            'contact_method': comm[8],
            'status': comm[9],
            'communication_date': comm[10],
            'follow_up_date': comm[11],
            'follow_up_completed': comm[12],
            'tags': comm[13],
            'is_important': comm[14],
            'customer': {
                'first_name': comm[15],
                'last_name': comm[16],
                'company_name': comm[17]
            } if comm[15] else None,
            'order': {
                'order_number': comm[18],
                'title': comm[19]
            } if comm[18] else None
        }
        comm_list.append(comm_data)
    
    return jsonify({'communications': comm_list})

@app.route('/api/communications', methods=['POST'])
def create_communication():
    data = request.json
    
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO communications 
                 (customer_id, order_id, type, direction, subject, content, contact_person, contact_method, status, follow_up_date, tags, is_important)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (data['customer_id'], data.get('order_id'), data['type'], data.get('direction', 'outbound'),
               data.get('subject'), data['content'], data.get('contact_person'), data.get('contact_method'),
               data.get('status', 'completed'), data.get('follow_up_date'), data.get('tags'), data.get('is_important', False)))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Communication created successfully'}), 201

@app.route('/api/time-entries', methods=['GET'])
def get_time_entries():
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    status_filter = request.args.get('status', '')
    user_filter = request.args.get('user_id', '')
    
    query = '''SELECT te.*, c.first_name || ' ' || c.last_name as customer_name, o.title as order_title
               FROM time_entries te 
               LEFT JOIN customers c ON te.customer_id = c.id 
               LEFT JOIN orders o ON te.order_id = o.id 
               WHERE 1=1'''
    params = []
    
    if status_filter:
        query += ' AND te.status = ?'
        params.append(status_filter)
    
    if user_filter:
        query += ' AND te.user_id = ?'
        params.append(user_filter)
    
    query += ' ORDER BY te.created_at DESC'
    
    c.execute(query, params)
    entries = c.fetchall()
    conn.close()
    
    entry_list = []
    for entry in entries:
        entry_data = {
            'id': entry[0],
            'user_id': entry[1],
            'user_name': entry[2],
            'customer_id': entry[3],
            'order_id': entry[4],
            'start_time': entry[5],
            'end_time': entry[6],
            'duration': entry[7],
            'description': entry[8],
            'activity_type': entry[9],
            'status': entry[10],
            'notes': entry[11],
            'created_at': entry[12],
            'customer_name': entry[13] if entry[13] else 'Kein Kunde',
            'order_title': entry[14] if entry[14] else 'Kein Auftrag'
        }
        entry_list.append(entry_data)
    
    return jsonify({'time_entries': entry_list})

@app.route('/api/time-entries', methods=['POST'])
def create_time_entry():
    data = request.json
    
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO time_entries 
                 (user_id, user_name, customer_id, order_id, start_time, end_time, duration, description, activity_type, status, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (data.get('user_id', 1), data['user_name'], data.get('customer_id'), data.get('order_id'),
               data['start_time'], data.get('end_time'), data.get('duration'), data['description'],
               data.get('activity_type', 'work'), data.get('status', 'completed'), data.get('notes')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Time entry created successfully'}), 201

@app.route('/api/time-entries/start', methods=['POST'])
def start_time_entry():
    data = request.json
    
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO time_entries 
                 (user_id, user_name, customer_id, order_id, start_time, description, activity_type, status, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (data.get('user_id', 1), data['user_name'], data.get('customer_id'), data.get('order_id'),
               datetime.now().isoformat(), data['description'], data.get('activity_type', 'work'),
               'active', data.get('notes')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Time entry started successfully'}), 201

@app.route('/api/quality-checks', methods=['GET'])
def get_quality_checks():
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    status_filter = request.args.get('status', '')
    type_filter = request.args.get('check_type', '')
    
    query = '''SELECT qc.*, c.first_name || ' ' || c.last_name as customer_name, o.title as order_title
               FROM quality_checks qc 
               LEFT JOIN customers c ON qc.customer_id = c.id 
               LEFT JOIN orders o ON qc.order_id = o.id 
               WHERE 1=1'''
    params = []
    
    if status_filter:
        query += ' AND qc.status = ?'
        params.append(status_filter)
    
    if type_filter:
        query += ' AND qc.check_type = ?'
        params.append(type_filter)
    
    query += ' ORDER BY qc.created_at DESC'
    
    c.execute(query, params)
    checks = c.fetchall()
    conn.close()
    
    check_list = []
    for check in checks:
        check_data = {
            'id': check[0],
            'order_id': check[1],
            'customer_id': check[2],
            'inspector_name': check[3],
            'check_date': check[4],
            'check_type': check[5],
            'overall_score': check[6],
            'status': check[7],
            'notes': check[8],
            'check_details': check[9],
            'recommendations': check[10],
            'created_at': check[11],
            'customer_name': check[12] if check[12] else 'Kein Kunde',
            'order_title': check[13] if check[13] else 'Kein Auftrag'
        }
        check_list.append(check_data)
    
    return jsonify({'quality_checks': check_list})

@app.route('/api/quality-checks', methods=['POST'])
def create_quality_check():
    data = request.json
    
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO quality_checks 
                 (order_id, customer_id, inspector_name, check_date, check_type, overall_score, status, notes, check_details, recommendations)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (data.get('order_id'), data.get('customer_id'), data['inspector_name'], data['check_date'],
               data['check_type'], data['overall_score'], data.get('status', 'pending'), data.get('notes'),
               data.get('check_details'), data.get('recommendations')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Quality check created successfully'}), 201

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    category_filter = request.args.get('category', '')
    status_filter = request.args.get('status', '')
    low_stock_filter = request.args.get('low_stock', '')
    
    query = 'SELECT * FROM inventory_items WHERE 1=1'
    params = []
    
    if category_filter:
        query += ' AND category = ?'
        params.append(category_filter)
    
    if status_filter:
        query += ' AND status = ?'
        params.append(status_filter)
    
    if low_stock_filter == 'true':
        query += ' AND quantity <= reorder_point'
    
    query += ' ORDER BY name'
    
    c.execute(query, params)
    items = c.fetchall()
    conn.close()
    
    item_list = []
    for item in items:
        item_data = {
            'id': item[0],
            'name': item[1],
            'description': item[2],
            'category': item[3],
            'sku': item[4],
            'quantity': item[5],
            'unit': item[6],
            'unit_price': item[7],
            'reorder_point': item[8],
            'supplier': item[9],
            'location': item[10],
            'status': item[11],
            'created_at': item[12]
        }
        item_list.append(item_data)
    
    return jsonify({'inventory_items': item_list})

@app.route('/api/inventory', methods=['POST'])
def create_inventory_item():
    data = request.json
    
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO inventory_items 
                 (name, description, category, sku, quantity, unit, unit_price, reorder_point, supplier, location, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (data['name'], data.get('description'), data['category'], data.get('sku'), data.get('quantity', 0),
               data.get('unit', 'Stück'), data.get('unit_price', 0.0), data.get('reorder_point', 0),
               data.get('supplier'), data.get('location'), data.get('status', 'active')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Inventory item created successfully'}), 201

@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    status_filter = request.args.get('status', '')
    
    query = '''SELECT i.*, c.first_name || ' ' || c.last_name as customer_name
               FROM invoices i 
               LEFT JOIN customers c ON i.customer_id = c.id 
               WHERE 1=1'''
    params = []
    
    if status_filter:
        query += ' AND i.status = ?'
        params.append(status_filter)
    
    query += ' ORDER BY i.created_at DESC'
    
    c.execute(query, params)
    invoices = c.fetchall()
    conn.close()
    
    invoice_list = []
    for invoice in invoices:
        invoice_data = {
            'id': invoice[0],
            'invoice_number': invoice[1],
            'customer_id': invoice[2],
            'order_id': invoice[3],
            'invoice_date': invoice[4],
            'due_date': invoice[5],
            'tax_rate': invoice[6],
            'payment_method': invoice[7],
            'status': invoice[8],
            'notes': invoice[9],
            'created_at': invoice[10],
            'customer_name': invoice[11] if invoice[11] else 'Unbekannter Kunde',
            'total_amount': 150.0  # Placeholder
        }
        invoice_list.append(invoice_data)
    
    return jsonify({'invoices': invoice_list})

@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    data = request.json
    
    # Generate invoice number
    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    conn = sqlite3.connect('database/app.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO invoices 
                 (invoice_number, customer_id, order_id, invoice_date, due_date, tax_rate, payment_method, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
              (invoice_number, data['customer_id'], data.get('order_id'), data.get('invoice_date'),
               data.get('due_date'), data.get('tax_rate', 19.0), data.get('payment_method', 'bank_transfer'),
               data.get('notes')))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Invoice created successfully', 'invoice_number': invoice_number}), 201

if __name__ == '__main__':
    print("Starting GoClean Harz CRM Backend...")
    print("API available at: http://localhost:5000")
    print("Frontend should be running at: http://localhost:5173")
    app.run(debug=True, host='0.0.0.0', port=5000)
