import json 

f=open('/Users/harshilkhara/Desktop/BUHacks22/flask/output.json')

data=json.load(f)


#for k,v in data.items():
    #print(v)
    
def search(contents,topics):
    first=True 
    #contents=contents.split()
    for content in contents:
        for topic in topics:
            for word in content:
                s=content.split()
                if word in data[topic] and first:
                    firstMatch=s.index(word)
                    first=False 
                if word in data[topic]:
                    lastMatch=s.index(word)

        return " ".join(content[firstMatch:lastMatch+1]),content[firstMatch],content[lastMatch]

    




f.close()