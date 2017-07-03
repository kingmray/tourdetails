from tinydb import TinyDB, Query
from flask import Flask, request, send_from_directory, render_template

# set the project root directory as the static folder, you can set others.
app = Flask(__name__, static_url_path='')

db = TinyDB('./db.json')
@app.route('/')
def root():
    posts = db.all()
    return render_template('index.html', posts=list(reversed(posts)))

@app.route('/edit')
def edit():
    posts = db.all()
    return render_template('edit.html', posts=posts, edit=True)

@app.route('/post/save', methods=['GET', 'POST'])
def save():
    post = request.get_json()
    Post = Query()
    if db.search(Post.id == post['id']):
        db.update(post, Post.id == post['id'])
    else:
        db.insert(post)
    return 'hallo'

@app.route('/img/<path:path>')
def send_js(path):
    return send_from_directory('img', path)

