/* 
 * Genetic algorithm to optimise combinations
 * 
 */



//chromosomes functions i.e. schedules

//reusable objects from server side, watch changes in properties and replicate them here


var item = function(size){
    var i = {};
    i.size = parseInt(size);
    i.used = false;
    i.bin = null;
    i.unpacked = false;
    i.unpackBin = null;
    i.packPosition = null;
    i.unpackPosition = null;
    i.misfit = false;
    i.unpackmisfit = false;
    return i;
};



var bin = function(id, size, capacityUsed){
    var b = {};
    b.id = id;
    b.size = parseInt(size);
    b.capacityUsed = capacityUsed ? parseInt(capacityUsed) : 0;
    b.open = true;
    b.items = [];
    b.position = null; // for time period in profile
    b.totalPacked = 0;
    b.totalUnpacked = 0;
    
    return b;
    
};


//methods - mate, score, mutate


var Chromosome = function(id, src, template){
    
    //id
    //src = output bin list
    // template = another chromosome for copying constants
    
    this.score = 0; //all start with a low score
    this.id = id;
   
    var $this = this; // store scope reference to the chromosome for ajax call
    if(src == "ajax" || typeof src == "undefined"){
    
        //get profile objects from http request
        $.ajax({ url: "http://localhost:1337" }).done(function(msg){
                       
                           $this.sequence = ""; //string representing output profile sequence for display
                           $this.schedule = msg; 
                           $this.sequence = $this.stringifySchedule();
                           $this.scoreFunction();
                     
                   });
                   
    }else if(typeof src =="object"){
        //create object here and use src as output bins schedule;
        
        this.schedule = {};
        this.schedule.outputBins = src;
        this.items = []; //list of items as a result of this formation
        
        //copy other properties from refObj -- check ref 
        
        this.schedule.originalBins = template.schedule.originalBins.slice(); 
        this.schedule.parameters = {}; // -- parameters
       
        //prevent referential copying
        for(var prop in template.schedule.parameters){
            if (template.schedule.parameters.hasOwnProperty(prop)) {
                    if(!$.isArray(template.schedule.parameters[prop])){
                        this.schedule.parameters[prop] = template.schedule.parameters[prop];
                    }else{
                        this.schedule.parameters[prop] = template.schedule.parameters[prop].slice();
                    }
                }
                 
              
        }
       
        //compute items, packed and unpacked, bins, misfits etc, parameters object update
        //loop through original bins and make comparison
        var diff = 0, diffArray = [];
        for (var i=0; i<this.schedule.originalBins.length; i++){
            //check if it is charging or discharging +ve is charge, -ve Discharge
          diff = this.schedule.outputBins[i].capacityUsed - this.schedule.originalBins[i].capacityUsed; 
          //fill up array to show difference from original value
          diffArray.push(diff);
         
         //clear out bin items and place if there is a need
         this.schedule.outputBins[i].items = [];
         
         //generate items
            if(diff>0){
                var it = new item(diff);
                it.bin = i;
                it.packPosition =  this.schedule.outputBins[i].position;
                it.used = true;
                
                //add it to the items array for this bin and the items array for the schedule
                
            }else if(diff < 0){
                
                console.log(diff);
            }
            
        }
        
         console.log(diffArray);
        
        //compute sequence and score
        
    }
};

Chromosome.prototype.scoreFunction = function(){
  
  //1. peak shaving amount
  //2. difference between peak and trough
  var $this = this;
  var $bp = this.schedule;
  
   var originalProfile = $bp.originalBins.slice(); // copy of original profile for analysis
   var finalProfile = $bp.outputBins.slice(); //copy of final profile
  
   //sort peaks to run calculation 
   var sortPeaks = function(p){
      //descending
      p.sort(function(a,b){ return b.capacityUsed - a.capacityUsed;});
  };
  
 sortPeaks(originalProfile); sortPeaks(finalProfile);
 
 //1. peak shave amount
 
 var peakshaveamount = Number( originalProfile[0].capacityUsed ) - Number( finalProfile[0].capacityUsed );
 
 //2. levelling amount -- difference between the highest and lowest demand
 
 var leveldiff = Number( finalProfile[0].capacityUsed ) -  Number( finalProfile[ finalProfile.length -1 ].capacityUsed );
 
 //3. unique demands -- perhaps only on integer forms
 var uniqueDemands = []; var diff = 0, diffArray = [];
 
 for(var i = 0; i<finalProfile.length; i++){
    if(uniqueDemands.indexOf( finalProfile[i].capacityUsed ) == -1 ){
        uniqueDemands.push(finalProfile[i].capacityUsed);
    }
    
    //store diff of charge or discharge
    diff = finalProfile[i].capacityUsed - originalProfile[i].capacityUsed;
    diffArray.push(diff);
    
 }
 
 var uniqueDemandsCount = uniqueDemands.length;
 var diffsequence = diffArray.join(",");
 $this.scoreComponents = {"peakShaveAmount":peakshaveamount, "levelling":leveldiff, "uniqueDemands":uniqueDemands, "diffsequence":diffsequence};
 
  $this.score = peakshaveamount + Math.pow(uniqueDemandsCount, -1) + Math.pow(leveldiff, -1);
  
  //add component for feasibility of solution based on battery capacity and demand limit
  
};


Chromosome.prototype.stringifySchedule = function(){
  var sequencestr = "";
    for(var i=0; i<this.schedule.outputBins.length;i++){
           sequencestr += this.schedule.outputBins[i].capacityUsed.toString();
        }
    return sequencestr;
};


Chromosome.prototype.mate = function(chromodeux){
    /*
     * 1. Swap profiles at center point
     * 2. Calculate or Re-assign items
     * 3. calculate other parameters such as total packed and total unpacked for new schedules
     */
  
  
  var pivot = Math.round(this.schedule.outputBins.length / 2); // mate at center point of length
  
  var child1 = this.schedule.outputBins.slice(), child2 = chromodeux.schedule.outputBins.slice(); 
  
    //remove second half of 1 and first half of 2
   var child1_half = child1.splice(pivot), child2_half = child2.splice(pivot);
   
   //swap each others wives -- moral dilemma lol
  child1 = child1.concat(child2_half); 
  child2 = child2.concat(child1_half);
   console.log(this);
   //make them into chromosome objects by using template of the already made chromosomes
   var child1Chromosome = new Chromosome(0,child1,this), child2Chromosome = new Chromosome(0,child2,this);
  
  //change properties of original profile to see impact on other objectss
   


};





/* 
 * Population methods: populate, sort, kill
 */

var Population = function(size,maxGeneration){
    
    this.size = size;
    this.members = []; // populate with chromosomes
    this.generationNumber = 0; // initialize generation count at zero
    this.maxGeneration = maxGeneration;// stop trying after 1000 generations
    this.baseSequence  = null; // sequence representing original bins, useful base for computing score of new ones 
    this.topscore = 0;
    this.topscoreGeneration = null;
    this.generationTolerance = 20;
    
    //add new members until target size is reached
    id=0;
    while(size--){
      var chromosome = new Chromosome(id, "ajax"); // chromosome is an output schedule
      this.members.push(chromosome);
      id++;
    }
    
    //set base sequence once, based on original profile in one of the members
    
    
};


Population.prototype.generation = function(){
    
     for (var i = 0; i < this.members.length; i++) {
           this.members[i].scoreFunction();   
        };

        this.sort();
        this.display();
        
        if(this.members[0].score > this.topscore){
            this.topscore = this.members[0].score;
            this.topscoreGeneration = this.generationNumber;
        }
        
        var children = this.members[0].mate(this.members[1]);
        this.members.splice(this.members.length - 2, 2, children[0], children[1]);

        this.generationNumber++;
        
        var scope = this; // local reference for population object
        
        if((this.generationNumber < this.maxGeneration) && ((this.generationNumber - this.topscoreGeneration) < this.generationTolerance)){
            //keep going while generation number is less than max generation 
            //keep going if topscore doesn't change up to a number of generations -- tolerance
            
            setTimeout(function() { scope.generation(); } , 20);
        }
    
};

Population.prototype.sort = function(){
    //sort with the highest scored chromosomes on top
    this.members.sort(function(a, b) {
                return b.score - a.score;
        });
     
     //attach key as id after sort -- important for display
    for(i=0; i<this.members.length;i++){
       this.members[i].id = i;  
    }
        
};




Population.prototype.display = function(){
  //show current generation sequence, score, base sequence and generation count
   var displayArea = $("#generationList"),
           $template = "<ul>" + $(".chromosomeInfo").eq(0).html() + "</ul>";
   
   displayArea.empty(); 
   for(var i=0; i<this.members.length; i++){

        $html = ""; //reset
        $html =  $.parseHTML($template);
            
        if(typeof this.members[i].sequence != "undefined"){  
            
                var $chromosome =  this.members[i]; //chromosome ref
                
                //not ready yet -- show when ready
                $(".sequence", $html).text($chromosome.sequence);
                $(".score", $html).text($chromosome.score);
                
                //score components
                $('[data-component-type="peak_shave"]', $html).text($chromosome.scoreComponents.peakShaveAmount);
                $('[data-component-type="unique_demands"]', $html).text($chromosome.scoreComponents.uniqueDemands.length);
                $('[data-component-type="levelling"]', $html).text($chromosome.scoreComponents.levelling);
                $('[data-component-type="diffsequence"]', $html).text($chromosome.scoreComponents.diffsequence);
                
            //set flag
                $(".sequence", $html).attr("data-ready","yes");
            }else{
                //set flag and add a listener function to check when it is ready -- custom event?
                
                $(".sequence", $html).attr("data-ready","no");
                
            }
            
        $(".sequence", $html).attr("data-id",this.members[i].id);    
        displayArea.append( $html );
     
   }
   
    
};

