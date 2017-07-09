import os
import json
from operator import itemgetter
from tinydb import TinyDB, Query
from flask import Flask, request, send_from_directory, render_template, url_for, jsonify

# set the project root directory as the static folder, you can set others.
app = Flask(__name__, static_url_path='')

db = TinyDB('./db.json')
db_comments = TinyDB('./db_comments.json')


@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)


def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                     endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)


@app.route('/')
def root():
    posts = db.all()
    return render_template('index.html', posts=list(reversed(posts)))


@app.route('/edit')
def edit():
    posts = db.all()
    return render_template('edit.html', posts=posts, edit=True)


@app.route('/download/db')
def download():
    return send_from_directory('.', 'db.json')


@app.route('/post/save', methods=['GET', 'POST'])
def save():
    post = request.get_json()
    Post = Query()
    if db.search(Post.id == post['id']):
        db.update(post, Post.id == post['id'])
    else:
        db.insert(post)
    return 'hallo'


@app.route('/comments/save', methods=['GET', 'POST'])
def save_comment():
    comment = request.get_json()
    Post = Query()
    post = db.search(Post.id == comment['data'])

    comments_list = []
    if 'comments' in post[0]:
        comments_list = post[0]['comments']
        try:
            comment_index = next(index for (index, d) in enumerate(comments_list) if d['id'] == comment['id'])
            comments_list[comment_index] = comment
            db.update({'comments': comments_list}, Post.id == comment['data'])
            return jsonify({'id': comment['data'], 'list': comments_list})
        except StopIteration:
            pass
    comments_list.insert(0, comment)
    db.update({'comments': comments_list}, Post.id == comment['data'])
    return jsonify({'id': comment['data'], 'list': comments_list})


@app.route('/img/<path:path>')
def send_js(path):
    return send_from_directory('img', path)
