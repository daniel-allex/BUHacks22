from flask import Flask, render_template, url_for, request, redirect, json
from flask_cors import CORS
from duckduckgo_search import ddg_news


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
    #se = text.split("\n")
    #response = json.dumps({"contents": se[0]})
    #response.headers.add('Access-Control-Allow-Origin', '*')
    #return response
    
    keywords = "Climate Change"

    r = ddg_news(keywords, region='wt-wt', safesearch='Off', time='d', max_results=5)

    example = [{
       "sentence": "Climate Change",
        "results": [{
            "error": "Interviews with dozens of officials showed the outside forces,",
            "source": r[0]["url"],
           "correct": r[0]["title"]
        },
        {
            "error": "Interviews with dozens of officials showed the outside forces,",
            "source": r[1]["url"],
           "correct": r[1]["title"]
        }]
        },
        {
       "sentence": "Showing results",
        "results": [{
            "error": "The upcoming heavy snows and freezing temperatures will be a major factor in the war, officials said.",
            "source": "https://www.politifact.com/factchecks/2020/jul/28/stella-immanuel/dont-fall-video-hydroxychloroquine-not-covid-19-cu/",
           "correct": "PolitiFact | Hydroxychloroquine is not a COVID-19 cure"
        }]
        }]
        

    return json.dumps(example)

if __name__ == "__main__":
    app.run(debug=True)

