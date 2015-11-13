/* 
 * Genetic algorithm to optimise combinations
 * 
 */

/* 
 * Population methods: populate, sort, kill
 */

var Population = function(size){
    
    this.size = size;
    this.members = []; // populate with chromosomes
    this.generation = 0; // initialize generation count at zero
    this.maxGeneration = 1000;// stop trying after 1000 generations
    this.baseSequence  = []; // sequence representing original bins, useful base for computing score of new ones 
    
    
};


Population.prototype.populate = function(targetsize){
    //add new members until target size is reached
    while(targetsize--){
      var chromosome = new Chromosome();
      this.members.push(chromosome);
    }
    
};

Population.prototype.sort = function(){
    //sort with the highest scored chromosomes on top
    this.members.sort(function(a, b) {
                return a.score - b.score;
        });
};




//chromosomes functions i.e. schedules

var Chromosome = function(){
    this.score = 0; //all start with a low score
    
    //sequence
    
    
    
};
