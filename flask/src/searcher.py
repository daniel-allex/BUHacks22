import json 

f=open('output.json')

data=json.load(f)


#for k,v in data.items():
    #print(v)
    
def search(contents,topics):
    first=True
    #for content in contents:
    for topic in topics:
        print(data["" + topic])

    print(contents[12].text)
    content=contents[12].text
    firstMatch=0
    lastMatch=0
    for topic in topics:
        print(data[topic])
        s=content.split()
        for word in s:
            print(word)
            if word in data[topic] and first:
                print("we got till here")
                firstMatch=s.index(word)
                first=False 
            if word in data[topic]:
                lastMatch=s.index(word)

    return " ".join(s[firstMatch:lastMatch+1]),s[firstMatch],s[lastMatch]

    

    




f.close()