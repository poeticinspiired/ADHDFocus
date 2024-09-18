from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.models import Forum, Post
from app import db

bp = Blueprint('forums', __name__)

@bp.route('/forums')
def forums():
    forums = Forum.query.all()
    return render_template('forums/index.html', forums=forums)

@bp.route('/forums/<int:forum_id>')
def forum_detail(forum_id):
    forum = Forum.query.get_or_404(forum_id)
    posts = Post.query.filter_by(forum_id=forum_id).order_by(Post.created_at.desc()).all()
    return render_template('forums/detail.html', forum=forum, posts=posts)

@bp.route('/forums/<int:forum_id>/new_post', methods=['GET', 'POST'])
def new_post(forum_id):
    forum = Forum.query.get_or_404(forum_id)
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        post = Post(title=title, content=content, forum=forum)
        db.session.add(post)
        db.session.commit()
        flash('Your post has been submitted.')
        return redirect(url_for('forums.forum_detail', forum_id=forum_id))
    return render_template('forums/new_post.html', forum=forum)
