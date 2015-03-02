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
    // properties to be dynamically added include Cost, index, 
 
    var chromosome = {};
    chromosome.sequence = sequence; 
     if(sequence.length < 1 || sequence === ''){
        
               chromosome.sequence = ssApp.randomSequence( ssApp.chromosomeLength );
               var seqStr = chromosome.sequence.toString(), seqArr, seqStrArr, totSum, runSum;
              
               seqStrArr = seqStr.split("");
               
               seqArr = seqStrArr.map(function(v){return parseInt(v);});
               seqArr.sort(function(a, b){ return a - b; }); 
               console.log(seqArr);
               
              
                //3 ways to check if this chromosome is worth keeping:

                //1. if total sum is greater than target continue, means a solution may be inside
                //2. if sum so far + sum of remaining greater than target continue
                //3. if runnning sum so far plus next number is less than target continue

                //only test 1 and 3 can easily be performed in this scenario, and if it fails any of the 2 it can be discarded
               // check total Sum
                totSum = seqArr.reduce(function(previousValue, currentValue, index, array){ return previousValue + currentValue; });
                
                chromosome.totSum = totSum;
               /*   */
    }
     
    
    chromosome.cost = 9999; // set default cost to very high cost
    return chromosome;
    
  
   
   // return "hi";
};
 


ssApp.populate = function(size){
    // creates a population from scratch or augments current population
    
    for(i = 0; i < parseInt(size); i++){
  
     var c = ssApp.chromosome("");
   
   //    ssApp.population.push( ssApp.chromosome("") ); 
      ssApp.population.push(c);
      
    }
     
    ssApp.generationCount++;

};


 ssApp.sortFn = function(a, b){
        return a.cost - b.cost; //change this
    };

ssApp.generation = function(){
    
    // creates a new generation based on the current generation mating or failing a test woefully
   for(i = 0; i < ssApp.population.length; i++){
       var chromosome =  ssApp.population[i];
        if(chromosome.cost <= ssApp.tolerance){
            ssApp.population.sort( ssApp.sortFn );
            ssApp.display(); 
            return true; // stop process
        }
        
        ssApp.costcompare( chromosome );
       
    }
    
    
    
    
    /*
   
    
    ssApp.population.sort( ssApp.sortFn );
    
    //mate only the fittest 2 - make this more than one set of 2
    
    var offSpring = ssApp.mate(ssApp.population[0], ssApp.population[1]);
    
    ssApp.population.splice(ssApp.population.length - offSpring.length, offSpring.length, offSpring[0], offSpring[1]); // make this a step function to be dynamic
    
    
    //mutate before next generation
    $.each(ssApp.population, function(i,j){
        ssApp.mutate(j);
     });
     
    ssApp.generationCount++;
  
    ssApp.population.sort( ssApp.sortFn );
    ssApp.display();
  
    if(ssApp.generationCount < 3000){
        setTimeout(ssApp.generation(), 500);
    }
   */
    
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
        ssApp.populate(ssApp.populationSize);
        console.log(ssApp.population);
        
      
      
        
};

ssApp.init();

