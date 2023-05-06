import os
from flask import Flask, render_template, request
from werkzeug.utils import secure_filename
import speech_recognition as sr
import randomTextGen as rt
import test2 as tt
import requests
import json


app = Flask(__name__)
name_file = ""
randtext = ""
resultpage = ""
r = sr.Recognizer()

def checkText(text):
    text = text.strip()
    if tt.VoiceAuth().loginSuccess(name_file):
        return "success"
        #  return redirect("https://projecctbook.netlify.app")
    else:
        return "failure"
        # return redirect("https://projecctbook.netlify.app")
    
@app.route("/home")
def index():
    global randtext
    dt = requests.get("http://localhost:8000/getdata")
    dic = json.loads(dt.text)
    print(type(dic))

    randtext = rt.randText().getText()
    return render_template('index.html',text = randtext,email = dic['data1'],type = dic['data2'])

@app.route("/reg")
def regindex():
    global randtext
    dt = requests.get("http://localhost:8000/regdata")
    dic = json.loads(dt.text)
    print(type(dic))
    randtext = rt.randText().getText()
    return render_template('index.html',text = randtext,email = dic['data1'],type = dic['data2'])



@app.route('/result', methods=['POST'])
def result():
    if 'data' in request.files:
        file = request.files['data']
        type = request.form['action']

        global name_file
        name_file = request.form['username']
        name_file = secure_filename(name_file)
        print(type)
        if type == 'login':
            name_file += ".flac"
            name_file = "test/" + name_file
            file.save(name_file)
            
        else:
            name_file += ".flac"
            name_file = "train/" + name_file
            file.save(name_file)
            tt.VoiceAuth().register_user(name_file)

        print(name_file)
    return 'Success'

@app.route("/audioTotext")
def home():
    global name_file
    
    with sr.AudioFile(name_file) as source:
            audio_data = r.record(source)
            text = r.recognize_google(audio_data)
    return checkText(text)

if __name__ == "__main__":
    app.run(debug=True)