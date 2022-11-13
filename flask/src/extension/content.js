var sentenceQueue = [];
var original = true;
var totalWords = 0;
var mouseOverHighlight = false;

function highlightRelevant(data) {
    var context = document.body; // requires an element with class "context" to exist
    var instance = new Mark(context);
    var i
    var options = {
        "accuracy": "exactly",
        "separateWordSearch": false,
        "className": "MarkUp",
        "exclude": [".MarkUp", ".newsBoxes", "#headingTab", ".blockTabs", ".blockTabInfo"],
        "each": function (node) {
            // node is the marked DOM element
            var box = document.createElement('div');
            let boxStyle = box.style;
            box.className = "newsBoxes";

            //boxStyle.top = coords.bottom + "px";
            createBoxHTML(box, data, i);

            document.body.appendChild(box);

            //show box
            node.onmouseover = function (event) {
                mouseOverHighlight = true;

                //let box = node.firstElementChild.style;
                let coords = getCoords(node);
                boxStyle.width = node.offsetWidth + "px";
                boxStyle.left = coords.left + "px";
                boxStyle.top = coords.bottom + "px";
                box.style.display = 'block'; //display box
                box.style.position = "absolute"
            };

            //hide box
            node.onmouseout = function (event) {
                mouseOverHighlight = false;
                //let box = node.firstElementChild.style;
                box.style.display = 'none'; //hide box

            };

            box.onmouseenter = function (event) {
                mouseOverHighlight = true;
                box.style.display = 'block'; //display box
            };

            box.onmouseleave = function (event) {
                mouseOverHighlight = false;
                boxStyle.display = 'none'; //hide box

            };
        }
    };
    for (i = 0; i < data.length; i++) {
        instance.mark(data[i].sentence, options);
    }
}


function sendSentences(preferences) {
    //console.log("sendSentences()");
    if (original == true) {
        if (document.body.innerText.length > 50000) {
            sentenceQueue.push(document.body.innerText.substring(0, 50000));
            totalWords = 50000;
        }
        else {
            sentenceQueue.push(document.body.innerText);
            totalWords = document.body.innerText.length;
        }
    }
    var body = "";
    if (sentenceQueue.length > 0) {
        body = sentenceQueue.pop(0)
    }
    var sentences = {"contents": body,
                    "topics": preferences};
    var formattedSentences = JSON.stringify(sentences);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "http://localhost:5000/request", false);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(formattedSentences);
    //console.log("we requested");
    return JSON.parse(xmlHttp.responseText);
    
 }

function updatePage(preferences) {
    console.log("test");
    var relevanceData = sendSentences(preferences);
    highlightRelevant(relevanceData);
    sentenceQueue = [];
    if (original == true) {
        initiateAddedNodes();
    }
    original = false;
    chrome.runtime.sendMessage({
        type: "pageUpdated"
    });
}

function getCoords(node) {
    let box = node.getBoundingClientRect();

    return {
        top: box.top + window.pageYOffset,
        right: box.right + window.pageXOffset,
        bottom: box.bottom + window.pageYOffset,
        left: box.left + window.pageXOffset
    };
}

function createBoxHTML(box, data, index) {

    var header = document.createElement('center');
    header.id = "headingTab";
    header.innerText = "Relevant News";
    box.appendChild(header);

    for (var i = 0; i < data[index].results.length; i++) {
        var button = document.createElement('a');
        button.href = data[index].results[i].source;
        button.target = "_blank";
        button.className = "blockTabs";
        button.innerText = data[index].results[i].correct;
        box.appendChild(button);
    }
}

function initiateAddedNodes() {
    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (!mutation.addedNodes)
                return

            for (let i = 0; i < mutation.addedNodes.length; i++) {
                let node = mutation.addedNodes[i]
                if (node.innerText && node.className != "newsBoxes" && node.className != "MarkUp") {
                    if (node.innerText.split(" ").length > 7) {
                        sentenceQueue.push(node.innerText);
                        totalWords = totalWords + node.innerText.length;
                    }
                }
            }
        })
    })

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    })
}

chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.type == "checkPage") {
            updatePage(request.preferences);
        }
        else if (request.type == "checkLength") {
            if (document.body.innerText.length > 50000) {
                chrome.runtime.sendMessage({
                    type: "lengthChecked",
                    tooLong: true
                });
            } else {
                chrome.runtime.sendMessage({
                    type: "lengthChecked",
                    tooLong: false
                });
            }
        }
    });
