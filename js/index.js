
window.ViewPrototype = (function () {

	function ViewPrototype(spainMapData, spainCropData) {
		this.spainMap = spainMapData;
		this.data = spainCropData.data;
		this.comunities = spainCropData.comunidades;
		this.specifics = spainCropData.tipos_especificos;
		this.generals = spainCropData.tipos_generales;

		this.zoneSelected = null; /* Almacena la zona para ver los datos, por defecto null, mostrará toda España */
	}

	ViewPrototype.prototype.init = function () {
		/* Se crea el menú con las diferentes zonas almacenadas en this.comunities */

		this.drawMap();

		this.drawBublesChart();
		this.updateBubblesChart();

		this.drawDonutChart();

		var thisApp = this;


		/* Dropdown menu */
		var dropdownOptions = d3.select("#zones")
            	.selectAll("div")
            	.data(this.comunities)
            		.enter()
            			.append("div")
            			.attr("class", "form-group")
            			.append("div")
            			.attr("class", "custom-control custom-radio");

        dropdownOptions.append("input")
            .attr("class", "custom-control-input")
            .attr("type", "radio")
            .attr("id", function (d, i) {
                return "zone-" + createId(d);
            })
            .attr("name", "zone")
            .attr("value", function (d, i) {
                return d;
            })
            .on("change", function () {
            	thisApp.zoneSelected = d3.select("input[name='zone']:checked").property("value");
            	$("#dropdown-button").text(thisApp.zoneSelected + " ");
            	thisApp.updateBubblesChart();

            	    d3.selectAll(".zone").attr("fill", function (d, i) {
			            var zonee = createId(d.properties.NAME_1);
			            if (createId(zonee) === createId(thisApp.zoneSelected)) {
			            	console.log("Es el mismo");
			                return "#336699";
			            } else {
			                return "#C0C0C0";
			            }
			        });
            });

        dropdownOptions.append("label")
            .attr("for", function (d, i) {
                return "zone-" + createId(d);
            })
            .attr("class", "custom-control-label unselectable check-label")
            .text(function (d) {
                return d;
            });

	};

	ViewPrototype.prototype.drawDonutChart = function () {
		var svg = d3.select("#datos-especificos")
			  		.append("svg")
			  		.attr("id", "donutchart")
					.attr("viewBox", "0 0 1200 590")
            		.attr("preserveAspectRatio", "xMidYMid meet");

            		//https://www.d3-graph-gallery.com/graph/donut_label.html
	};

	ViewPrototype.prototype.processDonutChartData = function (datos) {

		var result = [];
		for (var name in datos) {
		    if(datos[name] < 15) {
		    	result.push(name);
		    }
		}

		return result;
	};

	ViewPrototype.prototype.updateDonutChart = function (datos) {
		
		var totalHA = 0;
		var domain = [];
		for (var name in datos) {
		    totalHA += datos[name];
		    domain.push(name);
		}

		var percentages = {};
		for (var name in datos) {
		    percentages[name] = ((datos[name] * 100) / totalHA);
		}

		var result = this.processDonutChartData(percentages);
		console.log("Eliminar: " + result);
		var joinData = 0;
		var data = datos;
		for(var i=0; i< result.length; i++) {
			joinData += data[result[i]];
			delete data[result[i]];
		}

		if(joinData > 0){
			data["OTROS"] = joinData;
		}

		console.log(data);

		// set the dimensions and margins of the graph
			var width = 1200
			    height = 590
			    margin = 40

			// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
			var radius = Math.min(width, height) / 2 - margin

			var svg = d3.select("#donutchart")
        			.attr('width', '100%')
            		.attr('height', '100%')
            		.attr("viewBox", "0 0 1200 590")
            		.attr("preserveAspectRatio", "xMidYMid meet").text("");

			svg = svg.append('g')
                .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

            

			// set the color scale
			var color = d3.scaleOrdinal()
			  .domain(domain)
			  .range(d3.schemeDark2);

			// Compute the position of each group on the pie:
			var pie = d3.pie()
			  .sort(null) // Do not sort group by size
			  .value(function(d) {return d.value; })
			var data_ready = pie(d3.entries(data))

			// The arc generator
			var arc = d3.arc()
			  .innerRadius(radius * 0.5)         // This is the size of the donut hole
			  .outerRadius(radius * 0.8)

			// Another arc that won't be drawn. Just for labels positioning
			var outerArc = d3.arc()
			  .innerRadius(radius * 0.9)
			  .outerRadius(radius * 0.9)


			// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
			svg
			  .selectAll('allSlices')
			  .data(data_ready)
			  .enter()
			  .append('path')
			  .attr('d', arc)
			  .attr('fill', function(d){ return(color(d.data.key)) })
			  .attr("stroke", "white")
			  .style("stroke-width", "1px")
			  .style("opacity", 0.7)

			// Add the polylines between chart and labels:
			svg
			  .selectAll('allPolylines')
			  .data(data_ready)
			  .enter()
			  .append('polyline')
			    .attr("stroke", "black")
			    .style("fill", "none")
			    .attr("stroke-width", 1)
			    .attr('points', function(d) {
			      var posA = arc.centroid(d) // line insertion in the slice
			      var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
			      var posC = outerArc.centroid(d); // Label position = almost the same as posB
			      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
			      posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
			      
			      return [posA, posB, posC]
			    })

			// Add the polylines between chart and labels:
			svg
			  .selectAll('allLabels')
			  .data(data_ready)
			  .enter()
			  .append('text')
			    .text( function(d) { return d.data.key + " (" + ((d.data.value * 100) / totalHA).toFixed(2) + "%)"})  //  + ": " + d.data.value + " ha (" + ((d.data.value * 100) / totalHA).toFixed(2) + "%)"
			    .attr('transform', function(d) {
			        var pos = outerArc.centroid(d);
			        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
			        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
			        return 'translate(' + pos + ')';
			    })
			    .style('font-weight', 'bold')
			    .style('text-anchor', function(d) {
			        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
			        return (midangle < Math.PI ? 'start' : 'end')
			    })
	};


	ViewPrototype.prototype.drawMap = function () {
	//https://bl.ocks.org/murtra/raw/0bbe30780188756f3d11/
	//https://gist.github.com/Contrastat/6fdeed1f017286ad4d89
	//https://raw.githubusercontent.com/climboid/d3jsMaps/master/chapter-6/shapefiles/ESP_adm1.json
		//Width and height
		var thisApp = this;
			var w = 700;
			var h = 500;

		var tooltip = d3.select('#container-map').append('div')
            .attr('class', 'tooltip hidden');


			//Define map projection
      		var projection = d3.geoMercator()
      			.scale(2500)
      			.center([0, 38.5])

      		var projectionCanarias = d3.geoMercator()
	            .scale(2500)
	            .center([-17, 33])

			//Define path generator
			var path = d3.geoPath()
							 .projection(projection);

			var path_canarias = d3.geoPath()
            					.projection(projectionCanarias);

			//Create SVG
			var svg = d3.select("#container-map")
						.append("svg")
						.attr("class", "svg-map")
						.attr("viewBox", "0 0 700 500")
            			.attr("preserveAspectRatio", "xMidYMid meet")
            			.on("click", function (d) {
		                	thisApp.zoneSelected = null;
		                	thisApp.updateBubblesChart();
		                	$("#dropdown-button").text("España ");
		                	d3.select("input[id='zone-espana']").property('checked', true);
		                	d3.selectAll(".zone").attr("fill", function (d, i) {
					            return "#C0C0C0"; 
					        });
		            	})
		            	.on("mouseenter", function () {
							d3.select(".tooltip").style("display", "block")
		                        .style('left', (d3.event.pageX + 10) + 'px')
		                        .style('top', d3.event.pageY + 'px')
		                        .html("España");

		            	})
		            	.on("mouseleave", function () {
							d3.select(".tooltip").style("display", "none");
		            	})
		            	.on("mousemove", function () {
							d3.select(".tooltip").style("display", "block")
		                        .style('left', (d3.event.pageX + 10) + 'px')
		                        .style('top', d3.event.pageY + 'px');
		            	});

			
				
			svg.selectAll("path")
				.data(this.spainMap.features)
				.enter()
				.append("path")
				.attr("d", function (d, i) {
		                if (d.properties.NAME_1 === "Islas Canarias") {
		                    return path_canarias(d, i);
		                }

		                return path(d, i);
		         })
				.attr("class", function (d, i) {
	                return createId(d.properties.NAME_1) + " zone";
	            })
				.attr("id", function (d, i) {
                	return createId(d.properties.NAME_1);
            	})
				.attr("stroke", "black")
            	.attr("fill", "#C0C0C0")
	            .on("click", function () {
	                thisApp.zoneSelected = d3.select(this).data()[0].properties.NAME_1;
	                thisApp.updateBubblesChart();
	                var idComunidad = createId(d3.select(this).data()[0].properties.NAME_1);
	                d3.selectAll("#" + idComunidad).attr("fill", "#336699");

	                d3.selectAll(".zone").attr("fill", function (d, i) {
			            var zonee = createId(d.properties.NAME_1);
			            if (createId(zonee) === createId(thisApp.zoneSelected)) {
			            	console.log("Es el mismo");
			                return "#336699";
			            } else {
			                return "#C0C0C0";
			            }
			        });

			        d3.select("input[id='zone-"+createId(thisApp.zoneSelected)+"']").property('checked', true);

	                $("#dropdown-button").text(d3.select(this).data()[0].properties.NAME_1 + " ");
	                d3.event.stopPropagation();
	            })
            	.on("mouseenter", function () {
                	var idComunidad = createId(d3.select(this).data()[0].properties.NAME_1);
					d3.selectAll("#" + idComunidad).attr("fill", "#336699");
					d3.select(".tooltip").style("display", "block")
                        .style('left', (d3.event.pageX + 10) + 'px')
                        .style('top', d3.event.pageY + 'px')
                        .html(d3.select(this).data()[0].properties.NAME_1);

            	})
            	.on("mouseleave", function () {
                	var idComunidad = createId(d3.select(this).data()[0].properties.NAME_1);
                	if(d3.select(this).data()[0].properties.NAME_1 !== thisApp.zoneSelected) {
                		d3.selectAll("#" + idComunidad).attr("fill", "#C0C0C0");
                	}
					d3.select(".tooltip").style("display", "none");
					d3.select(".tooltip").html("España");
            	});

			
        	svg.append("line")          // attach a line
			    .style("stroke", "#336699")  // colour the line
			    .style("stroke-width", 3)  // colour the line
			    .attr("x1", 410)     // x position of the first end of the line
			    .attr("y1", 425)      // y position of the first end of the line
			    .attr("x2", 650)     // x position of the second end of the line
			    .attr("y2", 425); 

			svg.append("line")          // attach a line
			    .style("stroke", "#336699")  // colour the line
			    .style("stroke-width", 3)  // colour the line
			    .attr("x1", 410)     // x position of the first end of the line
			    .attr("y1", 425)      // y position of the first end of the line
			    .attr("x2", 410)     // x position of the second end of the line
			    .attr("y2", 550); 

			svg.append("line")          // attach a line
			    .style("stroke", "#336699")  // colour the line
			    .style("stroke-width", 3)  // colour the line
			    .attr("x1", 410)     // x position of the first end of the line
			    .attr("y1", 550)      // y position of the first end of the line
			    .attr("x2", 650)     // x position of the second end of the line
			    .attr("y2", 550); 

			    svg.append("line")          // attach a line
			    .style("stroke", "#336699")  // colour the line
			    .style("stroke-width", 3)  // colour the line
			    .attr("x1", 650)     // x position of the first end of the line
			    .attr("y1", 425)      // y position of the first end of the line
			    .attr("x2", 650)     // x position of the second end of the line
			    .attr("y2", 550);





	};


	ViewPrototype.prototype.drawBublesChart = function () {
		
		var tooltip = d3.select('#container-info').append('div')
            .attr('class', 'tooltip2 hidden');

		var svg = d3.select("#container-info")
			.append("svg")
			.attr("class", "svg-bubblechart")
			.attr("id", "bubblechart");
	};

	ViewPrototype.prototype.processBubblesChartData = function () {
		var datas = [];

		var labels = this.generals;

		console.log("Datos " + this.zoneSelected);

		for(var zone in this.data) {
			if(this.zoneSelected != null && this.zoneSelected !== "Ceuta y Melilla") {
				if(this.zoneSelected === zone){
					for(var i = 0; i < this.data[zone].length; i++){
						if(labels.includes(this.data[zone][i].cubierta)) {
							datas.push({
								"sector": this.data[zone][i].cubierta,
								"Total": this.data[zone][i].total	
							});
								
								
						}
					}
				}

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

	ViewPrototype.prototype.updateBubblesChart = function () {
		var datos = this.processBubblesChartData();
		
		var thisApp = this;

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
					.attr('preserveAspectRatio', 'xMinYMin meet').text("");


        var g = svg.append('g')
        			.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')		           
		            .attr("class", "bubble");

        var nodes = d3.hierarchy(dataset)
            .sum(function(d) {
            	if(d.Total != undefined){
            		return d.Total.replace(/,/g,""); 
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
                return "translate(" + (d.x + 30) + "," + d.y + ")";

            })
            .on("click", function (d) {
            	thisApp.showDataModal(d.data.sector, d.data.Total.replace(/,/g,".") + " ha");
            })
            .on("mouseenter", function (d, i) {
				d3.selectAll(createId("#circle-" + d.data.sector)).style("opacity", "0.7");   

				d3.select(".tooltip2").style("display", "block")
                        .style('left', (d3.event.pageX + 10) + 'px')
                        .style('top', d3.event.pageY + 'px')
                        .html(d.data.sector);   	
            })
            .on("mouseleave", function (d, i) {
                d3.selectAll(createId("#circle-" + d.data.sector)).style("opacity", "1");
                d3.select(".tooltip2").style("display", "none");
            })
            .on("mousemove", function () {
							d3.select(".tooltip2").style("display", "block")
		                        .style('left', (d3.event.pageX + 10) + 'px')
		                        .style('top', d3.event.pageY + 'px');
		    });

		node.append("circle")
		    .style("stroke", "#9E9E9E")  // colour the line
			.style("stroke-width", 1)  // colour the line
			.attr("id", function (d, i) {
                	return createId("circle-" + d.data.sector);
            })
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
            	if(d.data.sector){
	            	if(d.data.sector.length < (d.r / 3)){
	                	return d.data.sector;
	            	}else{
						return d.data.sector.substring(0, d.r / 6) + "...";
	            	}
            	}
            	return "";
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
            	if(d.data){
                return d.data.Total.replace(/,/g,".") + " ha";
            	}else {
            		return "";
            	}
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");

        d3.select(self.frameElement)
            .style("height", diameter + "px");


	};


	ViewPrototype.prototype.showDataModal = function (generalType, area) {

		var zone = "";
		if(this.zoneSelected != null) {
			zone += this.zoneSelected + ": ";
		}else {
			zone += "España: ";
		}

		$("#modal-title").text(zone + generalType);
		$("#area").text("Superficie total: " +area);


		//Tengo que buscar los datos de esa comunidad y del dato general los subtipos con los valores
		var data = {};

		for(var i = 0; i < this.specifics.length; i++) {
			if(this.specifics[i].tipo_general === generalType) {
				data[this.specifics[i].nombre] = 0;
			}
		}
		
		var temp = "";
		if(this.zoneSelected != null) {
			temp += this.zoneSelected;
		}else {
			temp += "España";
		}

		for(var zone in this.data) {
			if(zone === temp) {
				console.log("La zona es: " + zone);
				console.log("El tipo general es: " + generalType);
				for(var i = 0; i < this.data[zone].length; i++){
					if(data[this.data[zone][i].cubierta] !== undefined) {
						data[this.data[zone][i].cubierta] = parseInt(this.data[zone][i].total.replace(/,/g,""));
					}
				}
			}
		}





		this.updateDonutChart(data);

		$("#modalData").modal("show");
	};




	return ViewPrototype;
})();


window.createId = function(cadena) {
	var result;

	result = normalize(cadena.trim().toLowerCase().replace(/ /g, ""));

	return result;
};

var normalize = (function() {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
      to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
      mapping = {};
 
  for(var i = 0, j = from.length; i < j; i++ )
      mapping[ from.charAt( i ) ] = to.charAt( i );
 
  return function( str ) {
      var ret = [];
      for( var i = 0, j = str.length; i < j; i++ ) {
          var c = str.charAt( i );
          if( mapping.hasOwnProperty( str.charAt( i ) ) )
              ret.push( mapping[ c ] );
          else
              ret.push( c );
      }      
      return ret.join( '' );
  }
 
})();

/* El evento se dispara cuando la página terminada de cargar */
window.onload = function() {
  console.log("Página cargada");

  window.Application = new ViewPrototype(SpainMapData, SpanishCropsData);
  Application.init();
};