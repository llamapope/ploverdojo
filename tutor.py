import jinja2
import os
import webapp2

from google.appengine.ext import db
from google.appengine.api import users


template_directory = os.path.join(os.path.dirname(__file__), 'templates')
jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(template_directory), autoescape=True)


def render_template(template, **template_values):
    """Renders the given template with the given template_values"""
    # retrieve the html template
    t = jinja_environment.get_template(template)

    # render the html template with th given dictionary
    return t.render(template_values)



### CLASSES

class Disciple(db.Model):
    """Models a disciple of the dojo."""
    user_id = db.StringProperty();
    tutor_max_lesson = db.IntegerProperty();
    tutor_current_lesson = db.StringProperty();



### HANDLERS

class BaseHandler(webapp2.RequestHandler):
    """Represents a handler which contains functions necessary for multiple handlers"""
    def write_template(self, template, **template_values):
        """Function to write out the given template with the given
        template_values"""
        self.response.out.write(render_template(template, **template_values))

    def set_cookie(self, name, value):
        """Function to set an http cookie"""
        self.response.headers.add_header('Set-Cookie', '%s=%s; Path=/' % (name, value))

    def get_cookie(self, name):
        """Function to get the value of a named parameter of an http cookie"""
        return self.request.cookies.get(name)

        
class TutorPage(BaseHandler):
    def get(self):
        user = users.get_current_user()

        if user:
            logoutURL = users.create_logout_url(self.request.uri)

            disciple = db.GqlQuery("SELECT * FROM Disciple " +
                                   "WHERE user_id = :1 ",
                                   user.user_id())
            disciple = disciple.get()

            if not disciple:
                disciple = Disciple(user_id = user.user_id(), tutor_max_lesson = 0, tutor_current_lesson = "0.0")
                disciple.put()

            template_values = {
                'logoutURL': logoutURL
            }

            self.set_cookie('currentLesson', str(disciple.tutor_current_lesson))
            self.set_cookie('maxLesson', str(disciple.tutor_max_lesson))
            self.write_template('tutor.html', **template_values)
        else:
            loginURL = users.create_login_url(self.request.uri)
            
            self.redirect(loginURL)

    def post(self):
        current_lesson = self.request.get('ploverdojo_currentlesson')
        max_lesson = self.request.get('ploverdojo_maxlesson')
        user = users.get_current_user()
        
        disciple = db.GqlQuery("SELECT * FROM Disciple " +
                               "WHERE user_id = :1 ",
                               user.user_id())
        disciple = disciple.get()

        disciple.tutor_max_lesson = int(max_lesson)
        disciple.tutor_current_lesson = current_lesson
        disciple.put()
           
        self.set_cookie('currentLesson', str(disciple.tutor_current_lesson))
            
   
### ROUTER

app = webapp2.WSGIApplication([('/tutor/?', TutorPage)],
                              debug=True)