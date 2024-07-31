#!/usr/bin/env python3
'''
    1. Basic Babel setup
'''
from flask import Flask, render_template
from flask_babel import Babel


app = Flask(__name__)
babel = Babel(app=app, default_locale='en', default_timezone='UTC')


class Config:
    '''Basic configuration class'''
    LANGUAGES = ['en', 'fr']


bable_config = Config()


@app.route('/')
def index() -> str:
    '''render a simple index.html'''
    return render_template('1-index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
