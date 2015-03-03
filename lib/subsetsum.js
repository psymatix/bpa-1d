/* 
 * Modifiede Subset sum problem solution using Backtracking techniques
 * Gene: integer in number string
 * Chromosome: candidate set that could contain sum
 * Target: number to be added up to
 */


function SubsetSum(){
    

//var ssApp = ssApp || {};
var ssApp = this;

ssApp.population = []; 
ssApp.generationCount = 0; 
ssApp.tolerance = 2;

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
    if(ssApp.testChromosomeSum(chromosome)){ // test 1
        
        if(ssApp.runningTotal(chromosome)){ // test 3 and sum augmentation
            
            chromosome.finalSum = chromosome.combination.reduce(function(previousValue, currentValue, index, array){ return previousValue + currentValue; });
            return chromosome;
            
        }else{
            
            return false;
        
        }
        
    }else{
       //call this function again till it finds a good one
        return false;
    }
    
  
   
   // return "hi";
};


ssApp.testChromosomeSum = function(chromosome){
    
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


ssApp.runningTotal = function(chromosome){
    
    //tests running sum of integers in sequence
    //creates combination to meet the target number
    
    var runsum = 0,  bullseye = false; 
    chromosome.combination = [];
    
    for(i=0; i<chromosome.seqArr.length; i++){
        
        if((runsum+chromosome.seqArr[i]) < ssApp.targetSum ){
            runsum += chromosome.seqArr[i];
            chromosome.combination.push(chromosome.seqArr[i]);
            
        }else{
            
          // check if we've reached the target or within tolerance levels to augment
            if(runsum === ssApp.targetSum){
                bullseye = true;
                chromosome.subsetfound = true;
                break;
            }else if((ssApp.chromosomeLength - chromosome.combination.length) < ssApp.tolerance){
                // sum is less than target and needs to be augmented to hit target
                var augment = ssApp.targetSum - runsum;
                chromosome.combination.push( augment );
                chromosome.subsetfound = false; 
                bullseye = true;
                break;
                
            }else{
                
                //sum greater than target and out of tolerance range 
                bullseye = false;
                break;
                
            }
            
       }// if less than target
        
    }// for loop
    
    return bullseye;
    
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


ssApp.init = function(chromosomeLength, populationSize, targetSum){
    
        //function to generate population of candidate combinations
        // some constants
        
        ssApp.chromosomeLength = chromosomeLength;  // number of digits 
        ssApp.populationSize = populationSize; 
        ssApp.targetSum = targetSum;
      
        ssApp.populate(ssApp.populationSize);
        
    
        return ssApp.population;
      
      
      
      
        
};


}


module.exports = SubsetSum;
