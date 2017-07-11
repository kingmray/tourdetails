import os
import glob

from tourdetailsapp import app
from tinydb import TinyDB, Query



class Posts:
    def __init__(self):
        self.db = TinyDB(app.config['DB'])

    def get_all_posts(self, reverse=False):
        tour_posts = self.db.all()
        if reverse:
            return list(reversed(tour_posts))
        return tour_posts

    def save_post(self, post):
        tour_post = Query()
        if self.db.search(tour_post.id == post['id']):
            self.db.update(post, tour_post.id == post['id'])
        else:
            self.db.insert(post)


    def save_comment(self, comment):
        tour_post = Query()
        post = self.db.search(tour_post.id == comment['data'])

        comments_list = []
        if 'comments' in post[0]:
            comments_list = post[0]['comments']
            try:
                comment_index = next(index for (index, d) in enumerate(comments_list) if d['id'] == comment['id'])
                comments_list[comment_index] = comment
                self.db.update({'comments': comments_list}, tour_post.id == comment['data'])
                return {'id': comment['data'], 'list': comments_list}
            except StopIteration:
                pass
        comments_list.insert(0, comment)
        self.db.update({'comments': comments_list}, tour_post.id == comment['data'])
        return {'id': comment['data'], 'list': comments_list}

    def get_post_by_id(self, post_id):
        tour_post = Query()
        return self.db.search(tour_post.id == post_id)

    def update_post(self, key, value, post_id):
        tour_post = Query()
        self.db.update({key: value}, tour_post.id == post_id)

    def update_images_for_post(self, post_id):
        path = "./tourdetailsapp/img/%s/*.png" % (post_id)
        print(path)
        images_list = list(reversed(glob.glob(path)))
        images_list = ["/img/%s/%s" % (post_id, os.path.basename(x)) for x in images_list]
        if images_list:
            self.update_post('images', images_list, post_id)

    def update_images_for_all_posts(self):
        for post in self.db.all():
            self.update_images_for_post(post['id'])

