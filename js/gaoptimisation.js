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
    b.capacityUsed = capacityUsed ? Number(capacityUsed) : 0;
    b.open = true;
    b.items = [];
    b.position = null; // for time period in profile
    b.totalPacked = 0;
    b.totalUnpacked = 0;
    
    return b;
    
};


var copyObj = function(srcobj, destobj){
      //prevent referential copying
        for(var prop in srcobj){
            if (srcobj.hasOwnProperty(prop)) {
                    if(!$.isArray(srcobj[prop])){
                        destobj[prop] = srcobj[prop];
                    }else{
                        destobj[prop] = srcobj[prop].slice();
                    }
                }
                 
              
        }
    
}

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
                           $this.scoreFunction();
                                             
                   });
                     //console.log($this);
    }else if(typeof src =="object"){
        //create object here and use src as output bins schedule;
        
        this.schedule = {};
        this.schedule.outputBins = src.slice();
        
        //copy other properties from refObj without copying references
        
        this.schedule.originalBins = template.schedule.originalBins.slice(); 
        this.schedule.parameters = {}; // -- parameters
       
        //prevent referential copying
        copyObj(template.schedule.parameters, this.schedule.parameters);
       
        //compute items, packed and unpacked, bins, misfits etc, 
        
        this.arrangeItems();
       
        //compute sequence and score
        
         this.scoreFunction();
     }
};

Chromosome.prototype.arrangeItems = function(){
        
        this.items = []; //list of items as a result of this formation
        
        //loop through original bins and make comparison
        var diff = 0, diffArray = [], difftotal = 0;
        for (var i=0; i<this.schedule.originalBins.length; i++){
            //check if it is charging or discharging +ve is charge, -ve Discharge
          diff = this.schedule.outputBins[i].capacityUsed - this.schedule.originalBins[i].capacityUsed; 
          //fill up array to show difference from original value
          diffArray.push(diff); difftotal += diff;
         
         //clear out all bin items and place if there is a need
         this.schedule.outputBins[i].items = []; dischargeItems = [];
         
         //generate items
            if(diff>0){
                var it = new item(diff);
                it.bin = i;
                it.packPosition =  this.schedule.outputBins[i].position;
                it.used = true;
                
                //add it to the items array for this bin and the items array for the schedule
                this.schedule.outputBins[i].items.push(it);
                this.items.push(it);
                
            }else if(diff < 0){
                
                //discharge section
                //scan through already packed items and select from there for unpack if it hasn't been unpacked yet
                
              var dischargeObj = {"bin": i, "size": diff};
              dischargeItems.push(dischargeObj);
               
            }
           
        }
        
    
};

Chromosome.prototype.scoreFunction = function(){
  
  //1. peak shaving amount
  //2. difference between peak and trough
  var $this = this;
  var $bp = this.schedule;
  
  var originalProfile = $bp.originalBins.slice(); // copy of original profile for analysis
  var finalProfile = $bp.outputBins.slice(); //copy of final profile
  
  
 //feasibility flags
 
 //1. make sure not more than the peak ess rating is used
 //2. make sure the sum of energy charged or discharged is not more than the ess capacity
 //3. make sure the amount of energy removed from ess is not more than the amount stored
 
 var peakViolation = capacityViolation = chargeBalanceViolation = false;
  var diff = 0, diffArray = [], difftotal = 0, chargeSum = 0; 
  
  for(var j=0; j<originalProfile.length; j++ ){
        //store diff of charge or discharge
    diff = finalProfile[j].capacityUsed - originalProfile[j].capacityUsed;
    diffArray.push(diff);
    difftotal += diff; // running diff sum -- for chargeBalanceViolation
    chargeSum = (diff > 0) ? (chargeSum + diff) : chargeSum;
    
    pvcheck = (Math.abs(diff) <= this.schedule.parameters.peak) ? false : true; // peak violation check
    peakViolation = peakViolation || pvcheck; // logical operator, once true cannot be false 
  
  }
  
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
 var uniqueDemands = [];
 
 for(var i = 0; i<finalProfile.length; i++){
    if(uniqueDemands.indexOf( finalProfile[i].capacityUsed ) == -1 ){
        uniqueDemands.push(finalProfile[i].capacityUsed);
    }
    
  
    
 }
 
 var uniqueDemandsCount = uniqueDemands.length;
 var diffsequence = diffArray.join(",");
 
  $this.scoreComponents = {"peakShaveAmount":peakshaveamount, "levelling":leveldiff, "uniqueDemands":uniqueDemands, "diffsequence":diffsequence};
 
 // $this.score = peakshaveamount + Math.pow(uniqueDemandsCount, -1) + Math.pow(leveldiff, -1); <-- considers all 3
 $this.score = peakshaveamount + Math.pow(leveldiff, -1); 
//  $this.score = peakshaveamount;
  
  //check feasibility of solution based on battery capacity and demand limit and charge schedule etc
  
chargeBalanceViolation = (difftotal < 0) ? true : false; // if difftotal < 0 then we're discharging energy that hasn't been stored
capacityViolation = (chargeSum > $this.schedule.parameters.esscapacity) ? true :  false; //check that ess total capacity hasn't been exceeded in this solution

 //check SOC in future and also if there is still available capacity
  
   if(peakViolation || chargeBalanceViolation || capacityViolation){
      $this.score = 0;
  }
  
  //stringifySchedule each time score is calculated
   this.sequence = this.stringifySchedule();
};


Chromosome.prototype.stringifySchedule = function(){
  var sequencestr = "";
    for(var i=0; i<this.schedule.outputBins.length;i++){
           sequencestr += this.schedule.outputBins[i].capacityUsed.toString() + " ";
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
  
  //var child1 = this.schedule.outputBins.slice(), child2 = chromodeux.schedule.outputBins.slice(); 
  var child1 = [], child2 = []; 
  for(var i = 0; i<this.schedule.outputBins.length; i++){
       //prevent referential copying
       //child1 is copied from this , child 2 is copied from chromodeux
      var c1Obj = {}, c2Obj = {};
      copyObj(this.schedule.outputBins[i], c1Obj); copyObj(chromodeux.schedule.outputBins[i], c2Obj);
      child1.push(c1Obj); child2.push(c2Obj);
  }
    //remove second half of 1 and first half of 2
   var child1_half = child1.splice(pivot), child2_half = child2.splice(pivot);
   
   //swap each others wives -- moral dilemma lol
  child1 = child1.concat(child2_half); 
  child2 = child2.concat(child1_half);
 
  //make them into chromosome objects by using template of the already made chromosomes
   var child1Chromosome = new Chromosome(0,child1,this), child2Chromosome = new Chromosome(0,child2,this);
  
  //change properties of original profile to see impact on other objectss
 
   return [child1Chromosome, child2Chromosome];

};


Chromosome.prototype.mutate = function(chance){
   
   // decide whether to mutate or not 
    if(Math.random() > chance){
        return;
    }
   
   //make mutation more drastic by randomizing the number of indices that can be mutated / number of times mutation should modify this chromosome
   var mutateIndexCount = 0;
   mutateIndexCount = 1;// mutateIndexCount = Math.ceil( Math.random() * this.schedule.outputBins.length ); // ceil because this is a number selection rather than an index selection
   //possibility of mutating more than one index
   
   for (var i=0; i < mutateIndexCount ; i++){
    //pick a random point in the output bins and shake things up
    var index = Math.floor( Math.random() * this.schedule.outputBins.length );
    var oldCapacityUsed = this.schedule.outputBins[ index ].capacityUsed,
            newCapacityUsed = Math.random() * this.schedule.parameters.binSize ;
    
            newCapacityUsed = Number.isInteger(oldCapacityUsed) ? Math.ceil(newCapacityUsed) : newCapacityUsed.toFixed(2); //can be interger or float
            
    //place a random capacity in that bin and see if that makes a difference    
    this.schedule.outputBins[ index ].capacityUsed = newCapacityUsed;
   }
    //compute items
    this.arrangeItems();
};



/* 
 * Population methods: populate, sort, kill
 */

var Population = function(size,maxGeneration, generationTolerance){
    
    this.size = size;
    this.members = []; // populate with chromosomes
    this.generationNumber = 0; // initialize generation count at zero
    this.maxGeneration = maxGeneration;// stop trying after 1000 generations
    this.baseSequence  = null; // sequence representing original bins, useful base for computing score of new ones 
    this.topscore = 0;
    this.topscoreGeneration = null;
    this.generationTolerance = generationTolerance;
    
    //add new members until target size is reached
    // generations are updated by external call to generation method
    
    id=0;
    while(size--){
      var chromosome = new Chromosome(id, "ajax", false); // chromosome is an output schedule
      this.members.push(chromosome); 
      id++;
    }
    //set base sequence once, based on original profile in one of the members

};


Population.prototype.generation = function(){
    
    //1. Calculate the score for each chromosome in this generation
    
    
     for (var i = 0; i < this.members.length; i++) {
         //mutate by chance here -- 0.5 is 50% chance of mutation
         this.members[i].mutate(0.25);
         
         //calculate score for everyone
          this.members[i].scoreFunction();   
        };

    //2. Sort in descending order of score from the highest to the lowest
    
        this.sort();
        this.display();
        
        if(this.members[0].score > this.topscore){
            this.topscore = this.members[0].score; 
            this.topscoreGeneration = this.generationNumber;
        }
        
    //3. Mate the two fittest chromosomes to get two offspring, and elminate the weakest in the population
        
        var children = this.members[0].mate(this.members[1]);
        //compare scores of offspring with weakest
        if(this.members[this.members.length - 2].score < children[0].score){
            this.members.splice(this.members.length - 2, 1, children[0]);
        }
        
        
        if(this.members[this.members.length - 1].score < children[1].score){
            this.members.splice(this.members.length - 1, 1, children[1]);
        }
        
        //this.members.splice(this.members.length - 2, 2, children[0], children[1]);
        
        
    //4. Mating creates new generation so update count
        this.generationNumber++;
        
        var scope = this; // local reference for population object
      
    //5. check if maximum allowed number of generations is reached or topscore has not changed for a given number of generations
 
        if((this.generationNumber < this.maxGeneration) && ((this.generationNumber - this.topscoreGeneration) < this.generationTolerance) && this.generationTolerance != null){
            //keep going while generation number is less than max generation 
            //keep going if topscore doesn't change up to a number of generations -- tolerance
         
            setTimeout(function() { scope.generation(); } , 20);
        }else{
             this.display();
        }
 /*
this.display();*/
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
   $("#generationNumber").text(this.generationNumber);
   $("#topScoreGeneration").text(this.topscoreGeneration);
   
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

