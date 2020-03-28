
window.ViewPrototype = (function () {

	function ViewPrototype(spainMapData, spainCropData) {
		this.spainMapData = spainMapData;
		this.data = spainCropData.data;
		this.comunities = spainCropData.comunidades;
		this.specifics = spainCropData.tipos_especificos;
		this.generals = spainCropData.tipos_generales;

		this.zoneSelected = null; /* Almacena la zona para ver los datos, por defecto null, mostrará toda España */
	}

	ViewPrototype.prototype.init = function () {
		/* Se cre el menú con las diferentes zonas almacenadas en this.comunities */

		this.drawBarsChart();


		this.updateBarsChart();

	};

	ViewPrototype.prototype.drawBarsChart = function () {
		var svg = d3.select("#container-info")
			.append("svg")
			.attr("class", "svg-bubblechart")
			.attr("id", "bubblechart")
			.attr("preserveAspectRatio", "xMidYMid meet");
	};

	ViewPrototype.prototype.processBarsChartData = function () {
		var datas = [];

		var labels = this.generals;

		for(var zone in this.data) {
			if(this.zoneSelected != null) {



			}else {
				if(zone === "España") {
					console.log("Datos españa");
					for(var i = 0; i < this.data[zone].length; i++){
						if(labels.includes(this.data[zone][i].cubierta)) {
							datas.push({
								"sector": this.data[zone][i].cubierta,
								"Total": this.data[zone][i].total	
							});
								
								
						}
					}
				}
			}
		}

		return datas;
	};

	ViewPrototype.prototype.updateBarsChart = function () {
		var datos = this.processBarsChartData();
		
		dataset = {
            "children": datos
        };

        var margin = {
            top: 40,
            right: 30,
            bottom: 40,
            left: 80
        };

        var diameter = 800;
        var width = diameter - margin.left - margin.right;
        var height = diameter - margin.top - margin.bottom;

        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var bubble = d3.pack(dataset)
            .size([diameter, diameter])
            .padding(1.5);


        var svg = d3.select('#bubblechart')
        			.attr('width', '100%')
            		.attr('height', '100%')
					.attr('viewBox', (margin.left + margin.right) + ' ' + (margin.bottom) + ' ' + diameter + ' ' + diameter)
					.attr('preserveAspectRatio', 'xMinYMin meet');


        var g = svg.append('g')
        			.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')		           
		            .attr("class", "bubble");

        var nodes = d3.hierarchy(dataset)
            .sum(function(d) {
            	if(d.Total != undefined){
            		return d.Total.replace(",","").replace(",",""); 
            	}else {
            		return 0;
            	}
             
         });

        var node = g.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";

            }).on("click", function (d) {
                alert(d.data.sector + ": " + d.data.Total.replace(",",".").replace(",",".") + " ha");
            });

		node.append("circle")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return color(i);
            });
        
		node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
            	console.log("Nombre: " + d.data.sector.length + ", Radio: " + d.r);
            	if(d.data.sector.length < (d.r / 3)){
            		console.log("Nombre devuelto: " + d.data.sector);
                	return d.data.sector;
            	}else{
            		console.log("Nombre devuelto cortado: " + d.data.sector.substring(0, d.r / 6) + "...");
					return d.data.sector.substring(0, d.r / 6) + "...";
            	}
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");
       

		node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Total.replace(",",".").replace(",",".") + " ha";
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");

        d3.select(self.frameElement)
            .style("height", diameter + "px");


	};





	return ViewPrototype;
})();


/* El evento se dispara cuando la página terminada de cargar */
window.onload = function() {
  console.log("Página cargada");

  window.Application = new ViewPrototype(SpanishCropsData, SpanishCropsData);
  Application.init();
};