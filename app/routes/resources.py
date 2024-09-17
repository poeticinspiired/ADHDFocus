from flask import Blueprint, render_template

bp = Blueprint('resources', __name__)

@bp.route('/resources')
def resources():
    # In a real application, you might want to fetch this data from a database
    adhd_resources = [
        {
            "title": "Understanding ADHD",
            "description": "An overview of ADHD symptoms, diagnosis, and treatment options.",
            "link": "https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd"
        },
        {
            "title": "ADHD Coping Strategies",
            "description": "Practical tips and techniques for managing ADHD symptoms in daily life.",
            "link": "https://www.additudemag.com/category/manage-adhd-life/"
        },
        {
            "title": "ADHD and Productivity",
            "description": "How to boost productivity and manage time effectively with ADHD.",
            "link": "https://www.verywellmind.com/adhd-productivity-tips-4174569"
        }
    ]
    return render_template('resources.html', resources=adhd_resources)
