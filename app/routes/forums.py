from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from app.models import Forum, Post, User
from app import db

bp = Blueprint('forums', __name__)

@bp.route('/forums')
def forums():
    forums = Forum.query.all()
    return render_template('forums/index.html', forums=forums)

@bp.route('/forums/<int:forum_id>')
def forum_detail(forum_id):
    forum = Forum.query.get_or_404(forum_id)
    posts = Post.query.filter_by(forum_id=forum_id, is_approved=True).order_by(Post.created_at.desc()).all()
    return render_template('forums/detail.html', forum=forum, posts=posts)

@bp.route('/forums/<int:forum_id>/new_post', methods=['GET', 'POST'])
@login_required
def new_post(forum_id):
    forum = Forum.query.get_or_404(forum_id)
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        post = Post(title=title, content=content, author=current_user, forum=forum)
        db.session.add(post)
        db.session.commit()
        flash('Your post has been submitted for approval.')
        return redirect(url_for('forums.forum_detail', forum_id=forum_id))
    return render_template('forums/new_post.html', forum=forum)

@bp.route('/moderate')
@login_required
def moderate():
    if not current_user.is_moderator:
        flash('You do not have permission to access this page.')
        return redirect(url_for('forums.forums'))
    pending_posts = Post.query.filter_by(is_approved=False).order_by(Post.created_at.desc()).all()
    return render_template('forums/moderate.html', pending_posts=pending_posts)

@bp.route('/moderate/<int:post_id>/approve', methods=['POST'])
@login_required
def approve_post(post_id):
    if not current_user.is_moderator:
        flash('You do not have permission to perform this action.')
        return redirect(url_for('forums.forums'))
    post = Post.query.get_or_404(post_id)
    post.is_approved = True
    db.session.commit()
    flash('Post approved successfully.')
    return redirect(url_for('forums.moderate'))

@bp.route('/moderate/<int:post_id>/reject', methods=['POST'])
@login_required
def reject_post(post_id):
    if not current_user.is_moderator:
        flash('You do not have permission to perform this action.')
        return redirect(url_for('forums.forums'))
    post = Post.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    flash('Post rejected and deleted.')
    return redirect(url_for('forums.moderate'))
