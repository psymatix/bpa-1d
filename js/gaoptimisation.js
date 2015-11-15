/* 
 * Genetic algorithm to optimise combinations
 * 
 */

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
    while(size--){
      var chromosome = new Chromosome(); // chromosome is an output schedule
      this.members.push(chromosome);
    }
    
    //set base sequence once, based on original profile in one of the members
    
    
};


Population.prototype.populate = function(size){
    //add new members from scratch  
    while(size--){
      
        if(this.members.length < this.size){
            var chromosome = new Chromosome(); // chromosome is an output schedule
            this.members.push(chromosome);
        }
      
    }
    
};

Popualation.prototype.generation = function(){
    
     for (var i = 0; i < this.members.length; i++) {
                this.members[i].getscore();    
        }

        this.sort();
        this.display();
        
        if(this.members[0].score > this.topscore){
            this.topscore = this.members[0].score;
            this.topscoreGeneration = this.generationNumber;
        }
        
        var children = this.members[0].mate(this.members[1]);
        this.members.splice(this.members.length - 2, 2, children[0], children[1]);

        this.generationNumber++;
        var scope = this;
        if((this.generationNumber < this.maxGeneration) && ((this.generationNumber - this.topscoreGeneration) < this.generationTolerance)){
            //keep going while generation number is less than max generation 
            //keep going if topscore doesn't change up to a number of generations -- tolerance
            
            setTimeout(function() { scope.generation(); } , 20);
        }
    
};

Population.prototype.sort = function(){
    //sort with the highest scored chromosomes on top
    this.members.sort(function(a, b) {
                return a.score - b.score;
        });
};

Population.prototype.display = function(){
  //show current generation sequence, score, base sequence and generation count
   var displayElem = $("#display");
   
    
};


//chromosomes functions i.e. schedules

//methods - mate, score, mutate


var Chromosome = function(){
    this.score = 0; //all start with a low score
    
    this.sequence = ""; //string representing output profile sequence
    
    //get profile objects from http request
        $.ajax({ url: "http://localhost:1337" }).done(function(msg){
                             this.schedule = msg;
                         });
    
    for(var i=0; i<this.schedule.outputBins.length;i++){
        this.sequence += this.schedule.outputBins[i].capacityUsed.toString();
    }
    
    console.log(this.sequence);
    
    
    
    
};
