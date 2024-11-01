import os
import psycopg2
from flask import Flask, render_template, request

app = Flask(__name__)

# Database connection
def get_db_connection():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    return conn

@app.route('/')
def index():
    return render_template('form.html')

@app.route('/submit', methods=['POST'])
def submit():
    country = request.form['country']
    first_name = request.form['first_name']
    last_name = request.form['last_name']
    email = request.form['email']
    mobile = request.form['mobile']
    dob_day = request.form['dob_day']
    dob_month = request.form['dob_month']
    dob_year = request.form['dob_year']
    postcode = request.form['postcode']
    course_type = request.form['course_type']
    year_of_entry = request.form['year_of_entry']
    special_needs = request.form['special_needs']
    subject = request.form['subject']
    consent = 'consent' in request.form

    # Save data to PostgreSQL
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO form_data 
        (country, first_name, last_name, email, mobile, dob_day, dob_month, dob_year, postcode, course_type, year_of_entry, special_needs, subject, consent) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (country, first_name, last_name, email, mobile, dob_day, dob_month, dob_year, postcode, course_type, year_of_entry, special_needs, subject, consent)
    )
    conn.commit()
    cur.close()
    conn.close()

    return render_template('form.html', success=True)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
