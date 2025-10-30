
function formataN(n) {
	var x = Number(n)
    console.log(x)
    let r = (x<10) ? '0'+x.toString() : x.toString()
    console.log(r)
	return  r
}


function  agora() {
	var currentdate = new Date(); 
	return  `${formataN(currentdate.getFullYear())}${formataN(currentdate.getMonth()+1)}${formataN(currentdate.getDate())}${formataN(currentdate.getHours())}${formataN(currentdate.getMinutes())}` 


console.log( agora() )