var Client = Client || {};

Client.init = function(){
  //compute btn
                $("#computeBtn").click(function(e){
                    console.log("hi");
                     $.ajax({
                         url: "http://localhost:1337",
                         }).done(function(msg){
                             console.log(msg);
                             
                            //summary
                             Client.showSummary(msg);
                             
                             //charts 
                             
                                //original bins 
                                Client.plotChart(msg.originalBins, {"id": "originalProfileChart", "width": 400, "height": 200});
                                
                                 //charging bins 
                                Client.plotChart(msg.packedBins, {"id": "chargingProfileChart", "width": 400, "height": 200});
                                
                                //originalBins inverted
                                
                                 Client.plotChart(msg.originalBinsInverted, {"id": "originalProfileInvertedChart", "width": 400, "height": 200});
                                
                                 //discharging bins 
                                Client.plotChart(msg.inverseBins, {"id": "dischargingProfileChart", "width": 400, "height": 200});
                                
                                 //output bins 
                                Client.plotChart(msg.outputBins, {"id": "outputProfileChart", "width": 400, "height": 200});
                                
                          
                                
                             
                         });
                    
                    e.preventDefault();
                    
                });
                   
};



Client.showSummary = function($res){
  
  var originalProfile = $res.originalBins.slice(); // copy of original profile for analysis
  var finalProfile = $res.outputBins.slice(); //copy of final profile
  //sort function
  var sortPeaks = function(p){
      //descending
      p.sort(function(a,b){ return b.capacityUsed - a.capacityUsed;});
  };
  
  //show original peak
  sortPeaks(originalProfile);
  $('[data-show="originalPeak"]').text(originalProfile[0].capacityUsed + " at " + originalProfile[0].position);
  
  //show final peak
  sortPeaks(finalProfile);
  $('[data-show="finalPeak"]').text(finalProfile[0].capacityUsed + " at " + finalProfile[0].position);
  
  //total possible kWh
  var maxkWh = $res.parameters.binSize * $res.originalBins.length;
  $('[data-show="maxEnergy"]').text(maxkWh + "kWh");
  
    //total energy delivered initially
  var totalkwhOriginal = totalkwhFinal = 0;
  $res.originalBins.forEach(function(v){
      //just add up since they are in one hour blocks, otherwise each bin will be multiplied by it's number of hrs
      totalkwhOriginal += v.capacityUsed;
  });

  var totalkwhOriginalPct = (totalkwhOriginal / maxkWh) * 100; 
  
  $('[data-show="originalEnergy"]').text(totalkwhOriginal + "kWh/ " + totalkwhOriginalPct.toFixed(2) + "%");
  
  
  //total energy delivered finally
  $res.outputBins.forEach(function(v){
      totalkwhFinal += v.capacityUsed;
  });

 var totalkwhFinalPct = (totalkwhFinal / maxkWh) * 100; 
 
  $('[data-show="finalEnergy"]').text(totalkwhFinal + "kWh/ "+ totalkwhFinalPct.toFixed(2) + "%");
  
  
  //storage combination
  
  $('[data-show="storageCombination"]').text($res.parameters.items.join(","));
  
  //storage charged
  $('[data-show="storageCharged"]').text($res.totalPacked + "kWh");
  
  //storage discharged
  $('[data-show="storageDischarged"]').text($res.totalUnpacked + "kWh");
  
  //storage unused in charge
  $('[data-show="packMisfits"]').text(function(){
                                            var ret = ""; 
                                            $res.packMisfits.forEach(function(v){
                                                    ret += v.size + ",";
                                             }); 
                                             return ret;

                                        });
                                        
                                        //storage unused in charge
  $('[data-show="unpackMisfits"]').text(function(){
                                            var ret = ""; 
                                            $res.unpackMisfits.forEach(function(v){
                                                    ret += v.size + ",";
                                             }); 
                                             return ret;

                                        });
  
};

Client.plotChart = function(dataset, $elemdata){
    
    var margin = {top: 20, right: 30, bottom: 30, left: 40};
    
    var width = $elemdata.width - margin.left - margin.right,
            height = $elemdata.height - margin.top - margin.bottom; // 40 for x-axis fix this later
            console.log(height);
    
    //prepare data
    var data = dataset.map(function(v){
        return +v.capacityUsed; //force to be a number
    });
    
    var labels = dataset.map(function(v){
        return v.position;
    });
    
    var y = d3.scale.linear()
            .domain([0,10]) // maximum is 10
            .range([height,0]);
    
    var x = d3.scale.ordinal()
            .domain(dataset.map(function(d) {  return d.position; })) //labels for each hour
            .rangeRoundBands([0, width], .1);
            //.range(data);
    
    var chart = d3.select("#"+$elemdata.id)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
     var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    
    chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
            
    var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");
        
    chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);
    
            
    var bar = chart.selectAll(".bar")
               .data(dataset)
               .enter()
               .append("g") 
               .attr("class", "bar")
             
       
    bar.append("rect")
               .attr("transform", function(d,i){ return "translate (" + x(d.position) + "," +  y(d.capacityUsed) + ")"; })
               .attr("height", function(d) { return height - y(d.capacityUsed); })
               .attr("width", x.rangeBand());    
    
    bar.append("text")
        .attr("x",  function(d){ return  x(d.position) + (x.rangeBand() / 2);})
        .attr("y", function(d){ return y(d.capacityUsed) + 3;})
        .attr("dy", ".75em")
        .text(function(d) { return d.capacityUsed; });

   
    
    
    
    
    
};

