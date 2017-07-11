import click
from tourdetailsapp.models import Posts

the_posts = Posts()
@click.command()
@click.option('--post_id', help='post_id of post where you want to add pictures')
@click.option('--all_posts', is_flag=True, help='update images for all posts')
def add_picture(post_id, all_posts):
    """Simple program that greets NAME for a total of COUNT times."""
    if post_id:
        the_posts.update_images_for_post(post_id)
        return
    if all_posts:
        the_posts.update_images_for_all_posts()
        return

if __name__ == '__main__':
    add_picture()