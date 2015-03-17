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
                             Client.plotChart(msg.originalBins, {"id": "originalProfileChart", "width": 400, "height": 200});
                             
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
  
  
};

Client.plotChart = function(dataset, $elemdata){
    
    //prepare data
    var data = dataset.map(function(v){
        return +v.capacityUsed; //force to be a number
    });
    
    var labels = dataset.map(function(v){
        return v.position;
    });
    
    var y = d3.scale.linear()
            .domain([0,10])
            .range([$elemdata.height,0]);
    
    var chart = d3.select("#"+$elemdata.id)
            .attr("width", $elemdata.width)
            .attr("height", $elemdata.height);
    
    var barWidth = $elemdata.width / data.length;
    var bar = chart.selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d,i){ return "translate (" + i * barWidth + ",0)"; });
    
    bar.append("rect")
            .attr("y", function(d){return d; })
            .attr("height", function(d){ return $elemdata.height - d;})
            .attr("width", barWidth - 1);
            
    bar.append("text")
         .attr("x", barWidth / 2)
        .attr("y", function(d) { return y(d) + 3; })
        .attr("dy", ".75em")
        .text(function(d) { return d; });
            
    
    
    
    
    
};

