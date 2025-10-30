

let x = `(echo '[{\"dia\":\"01/01/2010\",\"valor\":10000}, {\"dia\":\"01/02/2010\",\"valor\":20000}]' | jq -c)`

let y = JSON.parse(x)
