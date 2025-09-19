const PDFDocument = require("pdfkit");
var rowBottomY = 0;
var logoInfo = {} 

const size0 = 5
const size1 = 6
const size2 = 7
const size3 = 9

class PDFDocumentWithTables extends PDFDocument {
    constructor(options) {
        super(options);
        var that = this
        logoInfo = options.logoInfo

        this.on("pageAdded", async () => {
            // rowBottomY = 100;
            await that.cabecalho()
        });
    }

    strCheck ( s ) {
        return (typeof s === 'undefined') ? "" : s 
    } 

    async cabecalho (  ) {
        var dataURI = logoInfo

        var largura = Number(dataURI.largura)
        var altura = Number(dataURI.altura)

        var max_width = 75;
        var max_height = 50;

         // Não deixa a imagem ser maior que o limite - Verifica Largura
         if (largura > max_width) {
             var tamanho_proporcional = max_width / largura;
             largura *= tamanho_proporcional;
             altura *=  tamanho_proporcional;
         }

         // Não deixa a imagem ser maior que o limite - Verifica Altura
         if(altura > max_height){
             var tamanho_proporcional = max_height / altura;
             largura *= tamanho_proporcional;
             altura *=  tamanho_proporcional;
         }

         if (!largura) largura = 10
         if (!altura) altura = 10

        if (dataURI != 'sem_logo') {
            try {
                this.image(dataURI.img, 40, 10, { fit: [largura, altura ] })
            } catch (error) {
                console.log('erro ao colocar imagem no pdf')
            }
            this.y = 10 + altura + 10
            rowBottomY = this.y 
        }
    }

    rodape (  ) {
        this.fillColor('#000').text('Página '+this.bufferedPageRange().count, 270, 810); 
        this.lineWidth(1);   
        this.moveTo(10, 800).lineTo(570, 800).fillAndStroke("#AAA");
    }

    table(table, arg0, arg1, arg2) {
        var borda = table.borda
        this.page.margins.bottom = 20
        let startX = this.page.margins.left
        let startY = this.y;
        let options = {};

        if ((typeof arg0 === "number") && (typeof arg1 === "number")) {
            startX = arg0;
            startY = arg1;

            if (typeof arg2 === "object") options = arg2;
        } else if (typeof arg0 === "object") {  options = arg0; }

        const paddingLeft = 5;
        const paddingTop = 2
        const paddingBottom = 2
        const columnCount = table.headers.length;
        const columnSpacing = options.columnSpacing || 15;
        const rowSpacing = 3 // options.rowSpacing || 3;
        const usableWidth = options.width || (this.page.width - this.page.margins.left - this.page.margins.right);
        this.titulo = table.titulo 

        this.prepareHeader = options.prepareHeader || (() => { this.cabecalho( )  });
        const prepareRow = options.prepareRow || (() => { });

        const columnAlign = function(i, tipoLinha, numeroLinha) {
            if (i == 0) return 'left';

            if (tipoLinha == 'normal') {
                if (i <= 3) return 'left'; 
                if (i == 4) return 'right';
            }
      
            if (tipoLinha == 'mesames') {
                // console.log('columnAlign', tipoLinha, i, numeroLinha )
                return "center";
                // if (i<4) { 
                //     return 'left'; 
                // } else { 
                //     return 'right';
                // }
            }

            if (tipoLinha == 'colunado') {
                if (i <= 1){ return 'left';  } else { return 'right'; }
            }

            if (tipoLinha == 'desc') {
                return "center"
            }
            
            // console.log('tipoLinha',tipoLinha)
            if (tipoLinha == 'resumo') {
                if (numeroLinha == 0) {
                    return "center"
                }
                if (i <= 1) return 'left'; 
                else return 'right';
            }

            return 'left';
        }

        const columnContainerWidth = function(i, tipoLinha, lengthRow) {
            var usableWidth1 = usableWidth 
            var columnCount1 = columnCount 
           
            if (table.tipo == 'colunado') {
                if (tipoLinha == 'desc' || tipoLinha == 'desc2' || tipoLinha == 'desc3') {
                    return 530 
                }

                return  530 / table.numCols 
            }

            if (table.tipo == 'miniTab') {
                if (tipoLinha == 'desc4') return 430;
                if (i <= 2) return 50; 
                return  330
            }

            if (table.tipo == 'quadroSuperior1' || table.tipo == 'quadroDescricao') { return 530  }

            if (table.tipo == 'resumo') {
                if (tipoLinha == 'desc') return 530;
                if (i <= 1) return 212; 
                return 106;
            }

            if (table.tipo == 'normal') {
                if (tipoLinha == 'desc' || tipoLinha == 'desc2' || tipoLinha == 'desc3') {
                    return 530
                }
                
                if (tipoLinha == 'mesames') {
                    // console.log('tipoLinha', tipoLinha, i, lengthRow )
                    if (lengthRow <= 6) {
                        if (i == 1) return 70;
                        if (i == 2) return 70; 
                        if (i == 3) return 210;
                        if (i == 4) return 90;
                        if (i == 5) return 90;
                    }
                    if (lengthRow == 8) {
                        if (i == 1) return 70;
                        if (i == 2) return 40; 
                        if (i == 3) return 125;
                        if (i == 4) return 65;
                        if (i == 5) return 65;
                        if (i == 6) return 75;
                        if (i == 7) return 90;
                    }
                    if (lengthRow == 9) {
                        if (i == 1) return 70;
                        if (i == 2) return 40; 
                        if (i == 3) return 125;
                        if (i == 4) return 60;
                        if (i == 5) return 60;
                        if (i == 6) return 60;
                        if (i == 7) return 60;
                        if (i == 8) return 55;
                    }
                }

                // if (typeof tipoLinha === 'undefined') {
                if (typeof tipoLinha === 'undefined' || tipoLinha == 'normal') {
                    if (i == 1) return 70; 
                    if (i == 2 || i == 3) return 185;
                    if (i == 4) return 90;
                }
            }

            if (columnCount1<=0) return 0 
            return usableWidth1 / columnCount1;
        }

        const SUMcolumnContainerWidth = function(i, tipoLinha, lengthRow) {
            var soma = 0
            for (var x = 1; x < i; x++) {
                soma += columnContainerWidth(x, tipoLinha, lengthRow)
            }
            return soma;
        }

        const columnWidth = function(i, tipoLinha, lengthRow) {
            return  columnContainerWidth(i, tipoLinha, lengthRow) - columnSpacing;
        }

        const computeRowHeight = (row, tipoLinha, lengthRow) => {
            let result = 0;

            row.forEach((cell, i) => {
                // não sei se a variavel "i" esta ok 
                const cellHeight = this.heightOfString(cell, {
                    width: columnWidth(i, tipoLinha, lengthRow)-5,
                    align: columnAlign(i, tipoLinha)
                });
                result = Math.max(result, cellHeight);
            });

            // console.log(row, result, rowSpacing)
            return result + rowSpacing;
        };

        const maxY = this.page.height - this.page.margins.bottom - 25;

        // Check to have enough room for header and first rows
        if (startY  > maxY) {
            this.rodape()
            this.addPage({size : 'A4'});

            startY = rowBottomY + 5
        }

        rowBottomY = startY 
        startX = 40

        // Separation line between headers and rows
        this.moveTo(startX, rowBottomY - rowSpacing * 0.5)

        table.rows.forEach((row, i2) => {
            var tipoLinha1 = row[0] 
            
            let rowHeight = computeRowHeight(row, tipoLinha1, row.length);
            // console.log(i2, rowHeight, JSON.stringify(row))

            if (table.tipo == 'miniTab') {
                rowHeight = 9.93
            }


            if (row[1] == "Total" ||  row[2] == "Total" || row[1] == "Subtotal"  || row[2] == "Subtotal" || tipoLinha1 == 'desc3') {
                this.font('Helvetica-Bold')
            } else {
                this.font('Helvetica')
            }

            if (table.tipo == 'miniTab') {
                this.fontSize(size1)
            } else {
                if (tipoLinha1 == 'desc3') {
                    startY += 10 
                    this.fontSize(size3)
                } else {
                    this.fontSize(size2)
                }
                if (tipoLinha1 == 'mesames') {
                    this.fontSize(size0)
                    rowHeight = 9
                }
            }


            // Switch to next page if we cannot go any further because the space is over.
            // For safety, consider 3 rows margin instead of just one
            if (startY + 3 * rowHeight < maxY)
                startY = rowBottomY + rowSpacing;
            else {
                this.rodape() 
                this.addPage( {  size : 'A4'} );
                startY = rowBottomY + 5
            }

            // Allow the user to override style for rows
            prepareRow(row, i2);
            let lengthRow = row.length
            // console.log(row,i2)

            var tipoLinha = row[0]
            row.forEach((cell, i) => {             
                borda = table.borda
                let bordaTipo = ''

                if (tipoLinha1 == 'desc3') {
                    startY += 4
                    borda = false
                }

                if  (tipoLinha1 == 'mesames' ) {
                    bordaTipo = 'somenteH'
                }

                if (i>0) {
                    // console.log(table, cell)
                    var startXText =  startX +  SUMcolumnContainerWidth(i, tipoLinha, lengthRow)

                    this.font('Helvetica')
                    if (i2 == 0 && (table.tipo == 'quadroSuperior1' || table.tipo == 'miniTab') ){ this.font('Helvetica-Bold')  }

                    if (table.tipo == 'colunado') {
                        if (i2 == 0 || i2==table.rows.length-1) {
                            this.font('Helvetica-Bold')
                        }  else {
                            this.font('Helvetica')
                        }
                    }

                    this.fillColor('black').text(cell, startXText + paddingLeft, startY, {
                        width: columnWidth(i, tipoLinha),
                        align: columnAlign(i, tipoLinha, i2)
                    });

                    if (borda) { 
                        // console.log('bordaTipo', bordaTipo)
                        if (bordaTipo == 'somenteH') {
                            let posX1 = columnContainerWidth(i, tipoLinha, lengthRow) + startXText
                            let posY1 = startY-(paddingTop+3)
                            let ate1 = posY1 + rowHeight + 3

                            // console.log('ate1', posY1, ate1)
                            this.moveTo(startXText, posY1).lineTo(startXText, ate1).fillAndStroke('#f5f5f5');
                            this.moveTo(posX1, posY1).lineTo(posX1, ate1).fillAndStroke('#f5f5f5');

                            // this.moveTo(startXText, posY1).lineTo(startXText, startY + rowHeight + paddingBottom +1 ).fillAndStroke('green');
                            // this.moveTo(posX1, posY1).lineTo(posX1, startY + rowHeight + paddingBottom +1 ).fillAndStroke('red');
                        } else {
                            this.rect(startXText, rowBottomY-paddingTop,  columnContainerWidth(i, tipoLinha, lengthRow),  rowHeight +paddingBottom +1 ).lineWidth(1).stroke("#eee")
                        }
                    }

                    if (table.tipo == 'quadroSuperior1') {
                        if (i2 == 0) {
                            // console.log(table)
                            this.font('Helvetica-Bold')
                            this.rect(startXText, rowBottomY-paddingTop,  columnContainerWidth(i, tipoLinha),  rowHeight +paddingBottom ).lineWidth(1)
                            this.opacity(0.1).fillOpacity(0.1).fillAndStroke("grey", "black").opacity(1) // .stroke()
                        }                    
                    }

                    if (table.tipo == 'quadroDescricao') {
                        if (i2 == 0) {
                            this.font('Helvetica-Bold')
                            this.rect(startXText, rowBottomY-paddingTop,  columnContainerWidth(i, tipoLinha),  rowHeight +paddingBottom ).lineWidth(0)
                            this.opacity(0).fillOpacity(0).fillAndStroke("white", "black").opacity(1) // .stroke()
                        }                    
                    }

                    if (table.tipo == 'miniTab') {
                        this.fontSize(size1)
                    }

                    if (table.tipo == 'resumo') {
                        if (i2 == 0) {
                            let w =  columnContainerWidth(i, tipoLinha)
                            this.rect(startXText, rowBottomY-paddingTop, w,  rowHeight +paddingBottom ).lineWidth(1)
                            this.opacity(0.1).fillOpacity(0.1).fillAndStroke("grey", "black").opacity(1);   
                        } 
                        if (i2 <= 1) {
                            this.font('Helvetica-Bold')
                        }  else {
                            this.font('Helvetica')
                        }
                    }
                }
            });

            if (tipoLinha1 == 'desc3') {
                startY += 12
            }

            // Refresh the y coordinate of the bottom of this row
            rowBottomY = Math.max(startY + rowHeight, rowBottomY);
        });

        this.x = startX;
        this.moveDown();
        // this.stroke();

        return this;
    }
}

module.exports = PDFDocumentWithTables;