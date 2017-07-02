from flask import Flask, request, send_from_directory, render_template
# set the project root directory as the static folder, you can set others.
app = Flask(__name__, static_url_path='')

@app.route('/')
def root():
    return render_template('index.html')

@app.route('/edit')
def edit():
    return render_template('edit.html')

@app.route('/post/save', methods=['GET', 'POST'])
def save():
    print('Go!')
    return 'hallo'

@app.route('/img/<path:path>')
def send_js(path):
    return send_from_directory('img', path)

