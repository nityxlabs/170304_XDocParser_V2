//NaiveBayes_170625.js

/*
Requirements
-requires CoOccurWord.js
-requires FullSent.js
-requires mathTools.js
-requires strTools_docFeed.js - need to manipulate strings
*/

function NaiveBayesV1( arrSents, dist_back, dist_forward, thresFreq ) {
    //VAR: this.arrSents = array where each element is a sentence (processed by FullSent.js)
        //as of now these sentences have common words removed (using )  & the each word is stemmed (using classStemmer - function translateWordToStem() )
    //VAR: dist_back = integer that is the number of sentences to retrieve before the current sentence
    //VAR: dist_forward = integer that is the number of sentences to retrieve after the current sentence
    //VAR: thresFreq = integer that is the threshold for words to co-occur with a specific word (if <= thresFreq, then remove)
    //this is a "scope-safe constructor", just in case the user forgets to use the "new" keyword when creating a new instance of class (this prevents making changes to the class itself)
    if ( !(this instanceof NaiveBayesV1) )
        return new NaiveBayesV1( arrSents, dist_back, dist_forward, thresFreq );

    
    //CLASS: finds co-occurring words in a document
    this.arrSents = arrSents.map( function( sent, i ) {     //sent = element in array, i = index of element
        return strTools_homogenizeText(sent);
    } );
    this.thresFreq = thresFreq;
    this.lastI = this.arrSents.length - 1;
    this.dist_back = dist_back;         //retrieve these number of sentences previous to current sentence
    this.dist_forward = dist_forward;   //retrieve these number of sentences subsequent to current sentence
    this.objCoOccur = new CoOccurWord( this.arrSents, dist_back, dist_forward, thresFreq );      //this will be used to find co-occurring words

    //TEST:: find words as classes
    // var hashClasses = this.findClassTopWords();
    [this.cfFreq, this.cfRelFreq] = this.findClassTopWords();
    // this.findClassWordPairs();
}


// function makeArrayOfTD(arrayOI,title,addName)
// {
//     //need global Array variable to store each table
//     //global variable header keeps track of what the data means in each column
//     for(v=0;v<arrayOI[0].length;v++)
//     {
//         if(addName){header+="<td>"+title+" "+v+" :: Name: "+botTypeList[v].botName+"</td>";}
//         else{header+="<td>"+title+" "+v+"</td>";}
//     }
//     //global variable tableArray keeps data from each array recorded into <td> cells
//     for(var x=0;x<arrayOI.length;x++)
//     {
//         for(var y=0;y<arrayOI[x].length;y++){
//             tableArray[x]+="<td>"+arrayOI[x][y]+"</td>";
//         }
//     }
// }

// function displayArrays()
// {
//     var displayData="<table class='arrayDisplay' border='0' cellspacing='0' cellpadding='0'><tr><td>Frame</td>";
//     //add headers to each column
//     displayData+=header;
//     displayData+="</tr>";
//     for(var d=0;d<tableArray.length;d++)
//     {
//         displayData+="<tr><td>"+d+"</td>";
//         displayData+=tableArray[d];
//         displayData+="</tr>";
//     }
//     displayData+="</table>";
//     browseAdj("excelTable").innerHTML=displayData;  
// }

/* Functions: Find word classes */

NaiveBayesV1.prototype.findClassTopWords = function() {
    //METHOD: find the top-occurring words that do not co-occur together - this is in hopes of creating distinct classes
    //PROTOCOL: Find the top-occurring words in document & all associated words 

    //find the frequency of each word in the document
    var fullStr = this.arrSents.join('.');
    var arrEWF = strTools_AllWordsFreqSortedThres( fullStr, true, this.thresFreq, true );         //arrEWF = array Each Word Frequency, which should be sorted by word frequency in descending order (greatest to least)
    var hashWordFreq = strTools_WordFreqV2( fullStr, this.thresFreq );      //need this for cfRelFreq

    //calculate the 
    var arrFreq = Object.keys( hashWordFreq ).map( function(key) { return hashWordFreq[key]; } );
    var freqAvg = mathTools_calcAverage( arrFreq );
    var freqStDev = mathTools_calcStDev( arrFreq );
    // var freqThres = freqAvg + (freqStDev/2);
    var freqThres = freqAvg;
    // var freqThres = freqAvg + freqStDev;

    //TEST:: go through each sentence & quantify the number of words in each sentence
    console.log( "NB_FCTW 1: ", arrEWF );


    //go through each co-occurring word (feature) & quantify the frequency of 
    // var TEST_COUNT = 0;      //count # of words passing threshold
    var cfFreq = {};        //cfFreq = Class-Feature Frequency, where k = class (word), v = hash where each k2 = feature (word), v2 = word frequency.
    var cfRelFreq = {};     //cfRelFreq = Class-Feature Relative Frequency, where k = class (word), v = hash where k2 = feature (word), v2 = percentage (co-occurring frequency / total frequency)
    for ( var i in arrEWF ) {       //NOTE: arrEWF is sorted in descending order
        //check if word frequency
        var wordInfo = arrEWF[i].split(':');
        if ( freqThres > parseInt(wordInfo[0]) )
            break;
        // TEST_COUNT++;       //count # of words passing threshold

        var wordOI = wordInfo[1];
        hashCOW = this.objCoOccur.findCoOccurWords( wordOI );

        //calculate the co-occurring frequency
        cfFreq[wordOI] = {};
        cfRelFreq[wordOI] = {};
        for ( var k2 in hashCOW ) {
            cfFreq[wordOI][k2] = hashCOW[k2];
            ( k2 in hashWordFreq ) ? cfRelFreq[wordOI][k2] = parseFloat( hashCOW[k2] ) / hashWordFreq[k2] : cfRelFreq[wordOI][k2] = 0;
        }
    }

    //TEST::
    // console.log( "cfFreq:\n", cfFreq );
    // console.log( "cfRelFreq:\n", cfRelFreq );
    // console.log( "NB_FCTW 1: TEST_COUNT = ", TEST_COUNT, " & freqThres = ", freqThres );

    // return {'cfFreq': cfFreq, 'cfRelFreq': cfRelFreq};
    return [cfFreq, cfRelFreq];
}

NaiveBayesV1.prototype.findClassWordPairs = function() {
    //METHOD: This finds the top co-occurring words

    //find the frequency of each word in the document
    var fullStr = strTools_removeCommonWords_SelectText( this.arrSents.join('.') );
    // var arrEWF = strTools_AllWordsFreqSorted( fullStr, true );       //arrEWF = array Each Word Frequency
    var arrEWF = strTools_AllWordsFreqSortedThres( fullStr, true, this.thresFreq, true );         //arrEWF = array Each Word Frequency

    //get top X words
    var thresTopXWords = 3;
    var topXWords = arrEWF.map( function( w, i ) {      //w = element in array, i = index 
        if (i < thresTopXWords)
            return w.split(':')[1];
    }).filter( function(x) { return x; });

    console.log( "NB_FCWP 1 - ", topXWords );

    //find the co-occurring word pairs
    var hashAllCOW = this.objCoOccur.findCoOccurWords_MultiWords( topXWords );
    console.log( "Class WordPairs:\n", hashAllCOW );
}

NaiveBayesV1.prototype.retrieveSentRadius = function( i ) {
    //VAR: i = current index in this.arrSents
    //METHOD: retrieves all sentences within certain radius range.
    var sentRadius = "";
    for ( var i2 = (i - this.dist_back); i2 <= (i + this.dist_forward); i2++ )
        if ( this.arrSents.indexOf(i2) > -1 )
        sentRadius += this.arrSents[i2];

    return sentRadius;
}


NaiveBayesV1.createClassTopWords = function( arrSents, dist_back, dist_forward ) {
    //METHOD: defines classes for Naives Bayes based on frequently occurring words

    //PROTOCOL: Find the highest occurring words -> find co-occurring words that are not common words
    //Idea for top-occurring words: find words that do not occur together

    strTools_removeCommonWords_SelectText( getText );
}


/*
Functions: group sentences together based on classes & features
*/

NaiveBayesV1.prototype.clusterV1 = function() {
    //-PROTOCOL: click on sentence -> take the words that are classes in that sentence -> go through each sentence and calculate the probability of each feature associated with class & calculate the opposite (1 - p) for the "adversarial" group -> determine which "group" (class selected vs. class not selected) has the higher probability

    //retrieve the words in the sentence

    //go through each sentence and see which sentences should be grouped together

}


/* Other Functions */
function showHashMatrix( hashMatrix ) {
    //VAR: hashMatrix = a 2D hash where k = some key, v = another hash where k2 = some key, & v2 = corresponding value
    //METHOD: displays a 2D hash as a console.table()
    var arrCells = [];
    for ( var k in hashMatrix ) {
        var cell = {'class': k, 'classFreq': hashMatrix[k]};
        for ( var k2 in hashMatrix[k] ) {
            cell[k2] = hashMatrix[k][k2];
        }
        arrCells.push( cell );
    }

    console.table( arrCells );
}

function hashMatrixForExcel( hashMatrix ) {
    //VAR: hashMatrix = a 2D hash where k = some key, v = another hash where k2 = some key, & v2 = corresponding value
    //METHOD: displays a 2D hash suitable for Microsoft Excel
    var displayHash = "<table border='0' cellspacing='0' cellpadding='0'>";

    //retrieve all keys
    var allKeys1 = Object.keys( hashMatrix );
    var getKeys2 = [];
    for ( var k1 in hashMatrix )
        getKeys2 = getKeys2.concat( Object.keys(hashMatrix[k1]) );
    //create unique array
    var allKeys2 = getKeys2.filter((v, i, a) => a.indexOf(v) === i);        //v = value, i = index, a = array referring to itself (in this case, getKeys2) 

    //create header for excel
    header = "<tr><td>Class</td>";
    for ( var k2 of allKeys2 )
        header += "<td>" + k2 + "</td>";
    header += "</tr>";
    displayHash += header;

    //fill the matrix with data to display the data
    for ( var k1 of allKeys1 ) {
        displayHash += "<tr><td>" + k1 + "</td>"
        for ( var k2 of allKeys2 )
            displayHash += "<td>" + k2 + " -> " + hashMatrix[k1][k2] + "</td>";
        displayHash += "</tr>";
    }

    displayHash += "</table>";

    return displayHash;
}