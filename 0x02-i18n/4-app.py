#!/usr/bin/env python3
'''
    4. Force locale with URL parameter
'''
from flask import Flask, render_template, request
from flask_babel import Babel, _
from typing import Union



class Config:
    '''
    Basic configuration class for babel format
    '''
    LANGUAGES = ['en', 'fr']
    BABEL_DEFAULT_LOCALE = 'en'
    BABEL_DEFAULT_TIMEZONE = 'UTC'


app = Flask(__name__)
app.config.from_object(Config)
babel = Babel(app)


@babel.localeselector
def get_locale() -> Union[str, None]:
    '''
    pick the best language match for each user
    '''
    locale = request.args.get('locale')
    if locale and locale in app.config['LANGUAGES']:
        return locale
    return request.accept_languages.best_match(app.config['LANGUAGES'])


@app.route('/')
def index() -> str:
    '''
    render a simple index.html for the user
    '''
    return render_template('4-index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
