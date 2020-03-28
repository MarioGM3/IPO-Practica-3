

window.MapController = (function () {

	function MapController(mapData, placesData) {
		this.mapData = mapData;
		this.placesData = placesData;
	}

	MapController.prototype.init = function() {
		this.drawMap();
	};

	MapController.prototype.drawMap = function() {
		
        // Define map projection
        var projection = d3.geoMercator()
            .scale(18000)
            .center([-5.5, 40.8])

		

        // Define path generator
        var path = d3.geoPath()
            .projection(projection);
        
		var width = 700;
      	var height = 500;

        // Create SVG
        var svg = d3.select(".container-map")
            .append("svg")
             .attr("width", width)
      		.attr("height", height)
            .attr("class", "svg-map clickable")
            .attr("viewBox", "0 0 700 500")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .on("mouseenter", function () {
            })
            .on("mouseleave", function () {
            })
            .on("mousemove", function () {
                
            }).on("click", function () {
                
            }).on("wheel.zoom",function(){
		        var currScale = projection.scale();
		        var newScale = currScale - 8*event.deltaY;
		        if(newScale > 18000 && newScale < 100000) {
			        var currTranslate = projection.translate();
			        var coords = projection.invert([event.offsetX, event.offsetY]);
			        projection.scale(newScale);
			        var newPos = projection(coords);

			        projection.translate([currTranslate[0] + (event.offsetX - newPos[0]), currTranslate[1] + (event.offsetY - newPos[1])]);
			        d3.selectAll("path").attr("d", path);

			    }

		    }).call(d3.drag().on("drag", function(){
		        var currTranslate = projection.translate();
		        projection.translate([currTranslate[0] + d3.event.dx, currTranslate[1] + d3.event.dy]);
		        d3.selectAll("path").attr("d", path);
		    }));

      
        svg.selectAll("path")
            .data(this.mapData.features)
            .enter()
            .append("path")
            .attr("d", function (d, i) {
                return path(d, i);
            })
            .attr("class", function (d, i) {

            }).attr("stroke", "black")
			.attr("stroke-width", "3px")
            .attr("fill", "white");
        

        var marks = [];
        for(var i = 0; i < this.placesData.length; i++) {
        	if(this.placesData[i].latitud && this.placesData[i].longitud) {
        		marks.push({
        			"long" : getLongitude(this.placesData[i].longitud),
        			"lat"  : getLatitude(this.placesData[i].latitud)
        		});				
        	}
        }


        svg.selectAll(".marks")
						    .data(marks)
						    .enter()
						    .append("image")
						    .attr('class','mark')
						    .attr('width', 40)
						    .attr('height', 40)
						    .attr("xlink:href",'https://cdn3.iconfinder.com/data/icons/softwaredemo/PNG/24x24/DrawingPin1_Blue.png')
						    .attr("transform", function(d) { return "translate(" + projection([d.long,d.lat]) + ")"; });
			
			
       	    


       	   
	};

	function getLongitude(l){
		var cifras = l.length - 1;
		var num = l / Math.pow(10, cifras - 1);
		return num;
	}

	function getLatitude(l){
		var cifras = l.length;
		var num = l / Math.pow(10, cifras - 2);
		return num;
	}

	function getTranslation(transform) {
	  // Create a dummy g for calculation purposes only. This will never
	  // be appended to the DOM and will be discarded once this function 
	  // returns.
	  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
	  
	  // Set the transform attribute to the provided string value.
	  g.setAttributeNS(null, "transform", transform);
	  
	  // consolidate the SVGTransformList containing all transformations
	  // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
	  // its SVGMatrix. 
	  var matrix = g.transform.baseVal.consolidate().matrix;
	  
	  // As per definition values e and f are the ones for the translation.
	  return [matrix.e, matrix.f];
	}

	return MapController;
})();

