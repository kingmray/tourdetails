import os
from flask import request, send_from_directory, render_template, url_for, jsonify
from tourdetailsapp import app
from tourdetailsapp.models import Posts

thePosts = Posts()
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
    return render_template('index.html', posts=thePosts.get_all_posts(reverse=True))


@app.route('/edit')
def edit():
    return render_template('edit.html', posts=thePosts.get_all_posts(), edit=True)


@app.route('/download/db')
def download():
    return send_from_directory('.', 'db.json')


@app.route('/post/save', methods=['GET', 'POST'])
def save():
    post = request.get_json()
    thePosts.save_post(post)
    return 'hallo'


@app.route('/comments/save', methods=['GET', 'POST'])
def save_comment():
    comment = request.get_json()
    return jsonify(thePosts.save_comment(comment))


@app.route('/img/<path:path>')
def send_js(path):
    return send_from_directory('img', path)
