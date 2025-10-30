
	const cu = require('./calcUtil.js');


    // var x = cu.calcJuros( '30/09/2023', '31/08/2024', 1,  's', true)
    // console.log( x )

    // var x = cu.calcJuros( '30/09/2023', '30/09/2024', 1,  's', true)
    // console.log( x )

    // var x = cu.diasQuebrados( '30/09/2023', '30/09/2024')
    // console.log('diasQuebrados', x )

    // var x = cu.mesesInteiros( '30/09/2023', '30/09/2024')
    // console.log('mesesInteiros', x ) 

    var d = '01/03/1967' 
    console.log(d, cu.dia2intMesAno( d) )

    var d = '01/03/1986' 
    console.log(d, cu.dia2intMesAno( d) )

    var d = '01/01/1989' 
    console.log(d, cu.dia2intMesAno( d) )

    var d = '01/08/1993' 
    console.log(d, cu.dia2intMesAno( d) )

    var d = '01/07/1994' 
    console.log(d, cu.dia2intMesAno( d) )