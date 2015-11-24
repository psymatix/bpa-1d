/* 
 * Genetic algorithm to optimise combinations
 * 
 */



//chromosomes functions i.e. schedules

//methods - mate, score, mutate


var Chromosome = function(id){
    this.score = 0; //all start with a low score
    this.id = id
   
    var $this = this; // store scope reference to the chromosome for ajax call

    //get profile objects from http request
        $.ajax({ url: "http://localhost:1337" }).done(function(msg){
                       
                           $this.sequence = ""; //string representing output profile sequence
                           $this.schedule = msg; 
                           for(var i=0; i<$this.schedule.outputBins.length;i++){
                               $this.sequence += $this.schedule.outputBins[i].capacityUsed.toString();
                            }
                            var seqDisplay = $('[data-id="' + id + '"');
                            seqDisplay.text($this.sequence);
                            seqDisplay.next(".score").text($this.score);
                            
                            seqDisplay.data("ready","yes");
                            console.log("hohoh", seqDisplay.data());
                   });

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
      var chromosome = new Chromosome(id); // chromosome is an output schedule
      this.members.push(chromosome);
      id++;
    }
    
    //set base sequence once, based on original profile in one of the members
    
    
};


Population.prototype.generation = function(){
    
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
                //not ready yet -- show when ready
                $(".sequence", $html).text(this.members[i].sequence);
                $(".score", $html).text(this.members[i].score);
                $(".sequence", $html).attr("data-ready","no");
            }
            
        $(".sequence", $html).attr("data-id",this.members[i].id);    
        displayArea.append( $html );
     
   }
   
    
};

