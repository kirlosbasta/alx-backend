#!/usr/bin/env python3
'''
3. Parametrize templates
'''
from flask import Flask, render_template, request
from flask_babel import Babel, _


class Config(object):
    '''
    Basic configuration class for babel format
    '''
    LANGUAGES = ['en', 'fr']
    BABEL_DEFAULT_LOCALE = 'en'
    BABEL_DEFAULT_TIMEZONE = 'UTC'


app = Flask(__name__)
app.config.from_object(Config)
app.url_map.strict_slashes = False
babel = Babel(app)


@babel.localeselector
def get_locale() -> str:
    '''
    pick the best language match for each user
    '''
    return request.accept_languages.best_match(app.config['LANGUAGES'])


@app.route('/')
def index() -> str:
    '''
    render a simple index.html for the user
    '''
    return render_template('3-index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
