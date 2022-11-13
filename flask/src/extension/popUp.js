var countDown = 0;
var currentStatus;
var setup = false;
var startTimer;
var button;
var UNSELECTED = '#9e9e9e';

var topics = {'Tech': {'color': '#1976d2'},
       'Finance': {'color': '#e53935'},
       'World': {'color': '#fb8c00'},
       'Politics': {'color': '#7b1fa2'},
       'Space': {'color': '#00796b'},
       'Healthcare': {'color': '#43a047'},
       'Science': {'color': '#039be5'},
       'Fashion': {'color': '#ec407a'},
       'Food': {'color': '#ef5350'},
       'Sports': {'color': '#ffc107'},
       'Music': {'color': '#8d6e63'},
       'Art': {'color': '#5c6bc0'},
       'Entertainment': {'color': '#7cb342'},
       'Environment': {'color': '#607d8b'},
       'Shopping': {'color': '#f44336'},
       'Writing': {'color': '#673ab7'},
       'Law': {'color': '#673ab7'},
       'Government': {'color': '#00897b'},
       'Education': {'color': '#7cb342'},
       'Transportation': {'color': '#fb8c00'},
       'Military': {'color': '#1e88e5'}};

function onScanRequest() {
    let params = {
        active: true,
        currentWindow: true
    }

    chrome.tabs.query(params, gotTabs);
    let chosen = [];

    for (let key in topics) {
        if (topics[key]['preference']) {
            chosen.push(key);
        }
    }
    console.log(chosen);

    function gotTabs(tabs) {
        if (countDown <= 0) {
            chrome.runtime.sendMessage({ type: 'tryScan', tab: tabs[0].id, preferences: chosen });
        }
    }
}

function updateButtonColor(key) {
    let btn = topics[key]['element'];
    if (topics[key]['preference']) {
        btn.style.backgroundColor = topics[key]['color'];
    }
    else {
        btn.style.backgroundColor = UNSELECTED;
    }
}

function checkLength() {
    let params = {
        active: true,
        currentWindow: true
    }

    chrome.tabs.query(params, gotTabs);

    function gotTabs(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'checkLength' });
    }
}

function loadButtons() {
    var holder = document.getElementById('topicsHolder');

    for (let key in topics) {
        let btn = document.createElement('a');
        btn.classList.add('topicButton');
        topics[key]['element'] = btn;
        btn.innerHTML = key;
        holder.appendChild(btn);

        btn.onclick = function start() {
            console.log('generated button clicked');
            topics[key]['preference'] = !topics[key]['preference'];
            save = {}
            for (let k in topics) {
                save[k] = topics[k]['preference'];
            }
            chrome.storage.sync.set(save, function() {});

            updateButtonColor(key);
        }
    }
}

function timer() {
   countDown--;
    currentStatus.innerText = 'Please wait ' + countDown + ' seconds';

   if (countDown <= 0) {
       clearInterval(startTimer);
       currentStatus.innerText = 'Ready to Scan';
       currentStatus.style.color = '#43a047';
   }
}

document.addEventListener('DOMContentLoaded', function () {
    button = document.getElementById('ScanButton');
    currentStatus = document.getElementById('currentStatus');
    percentAddOn = document.getElementById('limitWarning');
    loadButtons();
    let keys = Object.keys(topics);
    chrome.storage.sync.get(keys, function(data) {
        for (let key in data) {
            if (data === 'undefined') {
                topics[key]['preference'] = false;
            }
            else {
                topics[key]['preference'] = data[key];
            }
            updateButtonColor(key);
        }
    });

    checkLength();
});

chrome.runtime.onMessage.addListener(
    function (request) {
        console.log(request.type);
        if (request.type == 'lengthChecked') {
            if (request.tooLong == true) {
                percentAddOn.innerText = 'First 50,000 Characters';
            }
            if (setup == false) {
                setup = true;
                currentStatus.innerText = 'Ready to Scan';
                currentStatus.style.color = '#43a047';
                chrome.runtime.sendMessage({ type: 'setUp' });
                button.onclick = function start() {
                    onScanRequest();
                }
            }

        }
        else if (request.type == 'setStatus') {
            if (request.status == 'Check_Page') {
                currentStatus.innerText = 'Scanning Page...';
                currentStatus.style.color = 'black';
            }
            else if (request.status == 'startTimer') {
                if (countDown <= 0) {
                    countDown = request.seconds;
                    currentStatus.innerText = 'Please wait ' + countDown + ' seconds';
                    currentStatus.style.color = '#e53935';
                    startTimer = setInterval(timer, 1000);

                }
            }
        }    
    });