/* 
 * Subset sum problem solution using GA
 * and Backtracking techniques
 * Gene: integer in number string
 * Chromosome: candidate set that could contain sum
 * Target: number to be added up to
 */



var ssApp = ssApp || {};


ssApp.population = []; 
ssApp.generationCount = 0; 
ssApp.tolerance = 2;
ssApp.mutationChance = 0.5;
ssApp.breakPoint = 5;

ssApp.randomSequence = function(l){
    
    //generates a random sequence of given length
    
    var rangeMin = "1", rangeMax = "8", sequence;
        while(rangeMin.length < l){
          rangeMin += "0"; rangeMax += "9";
          }
   rangeMin = parseInt(rangeMin); rangeMax = parseInt(rangeMax);
   sequence = Math.floor( rangeMin + Math.random()*rangeMax );
   return sequence;
};
            
ssApp.chromosome = function(sequence){
    
    //forms a chromosome object i.e. a candidate string
    // properties to be dynamically added include seqArr
     
 
    var chromosome = {};
    chromosome.sequence = sequence; 
     if(sequence.length < 1 || sequence === ''){
        
               chromosome.sequence = ssApp.randomSequence( ssApp.chromosomeLength );
               var seqStr = chromosome.sequence.toString(), seqArr, seqStrArr;
               seqStrArr = seqStr.split("");
               seqArr = seqStrArr.map(function(v){return parseInt(v);});
               seqArr.sort(function(a, b){ return a - b; }); 
              
               chromosome.seqArr = seqArr;
           
    }
     
    
    chromosome.cost = 9999; // set default cost to very high cost
    
     //3 ways to check if this chromosome is worth keeping, according to backtracking algorithms:

        //1. if total sum is greater than target continue, means a solution may be inside
        //2. if sum so far + sum of remaining greater than target continue
        //3. if runnning sum so far plus next number is less than target continue

    //only test 1 and 3 can easily be performed in this scenario, and if it fails any of the 2 it can be discarded
    if(ssApp.testChromosome(chromosome)){
    
        return chromosome;
    }else{
       //call this function again till it finds a good one
        return false;
    }
    
  
   
   // return "hi";
};


ssApp.testChromosome = function(chromosome){
    
    
    // this function checks total Sum
    
    var totSum;
    
    totSum = chromosome.seqArr.reduce(function(previousValue, currentValue, index, array){ return previousValue + currentValue; });
    chromosome.totSum = totSum;
  
    if(totSum < ssApp.targetSum ){
        return false;
    }else {
        
        return true;
    }
    
    
};


ssApp.populate = function(size){
    // creates a population from scratch or augments current population
    
   while(ssApp.population.length < parseInt(size)){
       var c = ssApp.chromosome("");
       if(c){
                ssApp.population.push( c );
            }
    }
     
    ssApp.generationCount++;

};


 ssApp.sortFn = function(a, b){
        return a.cost - b.cost; //change this
    };


ssApp.display = function(){
    
    $("#viewer").empty();
    $("#viewer").ssAppend("Generation " + ssApp.generationCount + "<br>");
    
    $.each(ssApp.population, function(i,j){
        $("#viewer").ssAppend(j.sequence + " " + j.cost + "<br>");
    });
    
};

console.reset = function () {
    return process.stdout.write('\033c');
}; 

ssApp.init = function(){
    
        // some constants
        ssApp.chromosomeLength = 6;  // number of digits 
        ssApp.populationSize = 10; 
        ssApp.targetSum = 18;
        ssApp.populate(ssApp.populationSize);
        console.log(ssApp.population);
        
      
      
        
};

ssApp.init();

