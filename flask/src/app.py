from flask import Flask, render_template, url_for, request, redirect, json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    print("loaded")
    return render_template('index.html')

@app.route("/request", methods=["POST"])
def handleRequest():
    print("requested")
    text = request.get_json()["contents"]
    print(text)
    #se = text.split("\n")
    #response = json.dumps({"contents": se[0]})
    #response.headers.add('Access-Control-Allow-Origin', '*')
    #return response
    example = [{
       "sentence": "Showing results",
        "results": [{
            "error": "He did not make an AI",
            "source": "https://www.politifact.com/factchecks/2020/jul/28/stella-immanuel/dont-fall-video-hydroxychloroquine-not-covid-19-cu/",
           "correct": "PolitiFact | Hydroxychloroquine is not a COVID-19 cure"
        }]
        }]

    return json.dumps(example)

if __name__ == "__main__":
    app.run(debug=True)

