const PDFDocument = require("pdfkit");
var rowBottomY = 0;
var logoInfo = {} 

class PDFDocumentWithTables extends PDFDocument {
    constructor(options) {
        super(options);
        var that = this
        logoInfo = options.logoInfo

        this.on("pageAdded", async () => {
            await that.cabecalho()
        });
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

        // this.title = 'RESUMO E TOTALIZAÇÃO DO CÁLCULO'
        if (this.title) {
            this.font('Helvetica-Bold')
            this.fontSize(14)

            let widthOfString = this.widthOfString(this.title)
            let p = (590 - widthOfString) / 2
            // console.log(p, widthOfString, this.title)
            
            this.fillColor('#000').text(this.title, p, 36); 
            this.lineWidth(1);   
            this.moveTo(40, 58).lineTo(558, 58).fillAndStroke("#AAA");
            this.y += 20
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
        // console.log(options)
        const paddingLeft = options.paddingLeft ;
        const paddingTop = options.paddingTop
        const paddingBottom = options.paddingBottom
        const columnSpacing = options.columnSpacing 
        const rowSpacing = options.rowSpacing 
        this.title = options.title

        const SUMcolumnContainerWidth = function(i, tipoLinha) {
            var soma = 0
            for (var x = 1; x < i; x++) {
                soma += table.columnContainerWidth(x, tipoLinha)
            }
            return soma;
        }

        const columnWidth = function(i, tipoLinha) {
            return  table.columnContainerWidth(i, tipoLinha) - columnSpacing;
        }

        const computeRowHeight = (row, tipoLinha) => {
            let result = 0;
            row.forEach((cell, i) => {
                let cellHeight = this.heightOfString(cell, {
                    width: columnWidth(i, tipoLinha)-5,
                    align: table.columnAlign(i, tipoLinha)
                });
                result = Math.max(result, cellHeight);
            });
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
            let tipoLinha = row[0] 
            let rowHeight = computeRowHeight(row, tipoLinha);
            if (tipoLinha.altura) rowHeight = tipoLinha.altura 

            if (startY + 3 * rowHeight < maxY)
                startY = rowBottomY + rowSpacing;
            else {
                this.rodape() 
                this.addPage( {  size : 'A4'} );
                startY = rowBottomY + 5
            }

            row.forEach((cell, i) => {                         
                if (i>0) {
                    var startXText =  startX +  SUMcolumnContainerWidth(i, tipoLinha)
                    this.font(tipoLinha.font)
                    this.fontSize(tipoLinha.fontSize)
                    this.fillColor('black').text(cell, startXText + paddingLeft, startY, {
                        width: columnWidth(i, tipoLinha),
                        align: table.columnAlign(i, tipoLinha, i2)
                    });

                    if (borda && !tipoLinha.fundoCinza) { 
                       this.rect(startXText, rowBottomY-paddingTop,  table.columnContainerWidth(i, tipoLinha),  rowHeight +paddingBottom +1 ).lineWidth(0.5).stroke("#eee")
                    }

                    if (tipoLinha.fundoCinza) {
                        this.rect(startXText, rowBottomY-paddingTop, table.columnContainerWidth(i, tipoLinha),  rowHeight +paddingBottom ).lineWidth(0.5)
                        this.opacity(0.1).fillOpacity(0.1).fillAndStroke("grey", "black").opacity(1);   
                    } 
                }
            });

            // Refresh the y coordinate of the bottom of this row
            rowBottomY = Math.max(startY + rowHeight, rowBottomY);
        });

        this.x = startX;
        this.moveDown();
        return this;
    }
}

module.exports = PDFDocumentWithTables;