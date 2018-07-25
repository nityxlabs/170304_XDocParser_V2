//CoOccurWord.js

/*
Requirements
-requires FullSent.js
-requires PhraseWords.js
-requires strTools_docFeed.js - need to manipulate strings
*/

function CoOccurWord(arrSents, dist_back, dist_forward, thresFreq) {
    //VAR: this.arrSents = array where each element is a sentence (processed by FullSent.js)
    //VAR: dist_back = integer that is the number of sentences to retrieve before the current sentence
    //VAR: dist_forward = integer that is the number of sentences to retrieve after the current sentence
    //VAR: thresFreq = integer that is the threshold for words to co-occur with a specific word (if <= thresFreq, then remove)
    //Scope-safe constructor
    if ( !(this instanceof CoOccurWord) )
        return new CoOccurWord(arrSents, dist_back, dist_forward, thresFreq);

    //CLASS: finds co-occurring words in a document
    this.arrSents = arrSents;
    this.thresFreq = thresFreq;
    this.lastI = this.arrSents.length - 1;
    this.dist_back = dist_back;         //retrieve these number of sentences previous to current sentence
    this.dist_forward = dist_forward;   //retrieve these number of sentences subsequent to current sentence
}

CoOccurWord.prototype = {
    constructor: CoOccurWord,

    setPerimeter: function( dist_back, dist_forward ) {
        //METHOD: resets the properties
        this.dist_back = dist_back;
        this.dist_forward = dist_forward;
    },

    findSentI: function( word ) {
        //METHOD: retrieve the sentence indices that contain
        //make regular expression form of word
        var regExp = new RegExp('\\b' + word + '\\b', 'i');

        return this.arrSents.map( function(sent, i) {
            if ( sent.search(regExp) > -1 )
                return i;
        } ).filter( function(x) { return x; } );
    },

    //BM1
    findSentI_SelectSent: function( word, arrSentI ) {
        /*
        VAR: word = string that is a word, will be used to see which sentences contain this word
        VAR: arrSentI = array of sentence indices (array of integers). If null, then will go through all sentences
        METHOD: finds which sentences contain the word and return the indices that contain word in the confines of sentence indices "arrSentI"
        */
        arrSentI = arrSentI || Array.apply( null, {length: this.arrSents.length - 1}).map( Number.call, Number );

        //TEST::
        // console.log( "fSI_SS: arrSentI = ", arrSentI );

        var regExp = new RegExp('\\b' + word + '\\b', 'i');
        var that = this;        //need to do this because "this" is not defined in the .map() function (or more like "this" is referring to the Window Object or something, not sure)
        return arrSentI.map( function( value, index ) {
            if ( that.arrSents[index].search(regExp) > -1 )
                return index; 
        } ).filter( function(x) { return x; } );
    },

    radiusSentI: function(indices) {
        //VAR: indices = array of indices for each sentence
        //METHOD: returns sentence indices with radius applied
        if ( (this.dist_back == 0) && (this.dist_forward == 0) )
            return indices;

        var rangeI = [];

        for ( var i of indices ) {
            //get starting sentence index
            var startI = i - this.dist_back;
            if ( startI < 0 )
                startI = 0;
            //get ending sentence index
            var endI = i + this.dist_forward;
            if ( endI > this.lastI )
                endI = this.lastI;

            //add range to javascript array
            for ( var i2 = startI; i2 <= endI; i2++ )
                rangeI.push(i2);
        }

        //make unique array, sort, & return
        var uniqI = [];
        for (var i of rangeI)
            if ( uniqI.indexOf(i) == -1 )
                uniqI.push(i)

        return uniqI.sort();
    },

    findCoOccurWords: function(word) {
        //VAR: word = string that will be the hub word, find other words co-occurring with this word
        //METHOD: retrieves all words that co-occur with the word in the variable 'word'. Returns a hash where the key = co-occurring word, value = integer that is the frequency of co-occurrence. This hash will be filtered by threshold ""

        //retrieve all sentences that contain word
        var arrSentI = this.findSentI(word);

        //take into consideration the perimeter around a specific sentence
        arrSentI = this.radiusSentI(arrSentI);

        //TEST::
        console.log( "COW TEST:: FCOOW - ", arrSentI );

        //find individual words that co-occur with word of interest: retrieve all sentences, remove all non-words characters, split into individual words, homogenize words, then quantify each word
        var hashCOW = {};       //hashCOW = hash Co-Occurring Words. key = co-occurring word, value = integer that is the frequency of co-occurrence
        for (var i of arrSentI) {
            var sentWords = this.arrSents[i].toLowerCase().split(' ');
            for (var eachWord of sentWords)
                (eachWord in hashCOW)? hashCOW[eachWord] += 1 : hashCOW[eachWord] = 1;
        }

        //apply threshold
        hashCOW = this.applyThreshold( hashCOW, this.thresFreq );

        return hashCOW;
    },

    findCoOccurWords_MultiWords: function( arrWords, threshold ) {
        //VAR: word = array where each word will be searched through all sentences in this.arrSents
        //VAR: threshold = integer that, if > 0, will be used to remove any co-occurring words 
        //METHOD: this will return a hash of co-occurring words & how frequently they co-occur together

        threshold = threshold || 0;

        console.log( "COW_MW: threshold = ", threshold );

        var hashAllCOW = {};        //records all the 
        for ( var i in arrWords ) {
            var hashCOW = this.findCoOccurWords( arrWords[i] );

            for (var k in hashCOW) {
                var k2 = arrWords[i] + ":" + k;
                hashAllCOW[k2] = hashCOW[k];
            }

            //TEST::
            console.log( "COW_MW i = ", i, " -> ", arrWords[i] );
        }

        //TEST::
        console.log( "COW_MW 2: hashAllCOW = ", hashAllCOW );

        //sort from greatest to least
        hashAllCOW = obj_sortByVal( hashAllCOW, true );
        if (threshold > 0)
            hashAllCOW = applyThreshold( hashAllCOW, threshold );

        return hashAllCOW;
    },

    retrieveSentences: function( arrSentI ) {
        /*
        VAR: arrSentI = array of sentence indices that will be used to retrieve sentences
        METHOD: retrieve sentences based on a list of sentence indices in "arrSentI"
        OUTPUT: returns an array where each element is the sentence corresponding to the indices in array "arrSentI"
        */
        var that = this;
        return arrSentI.map( function( value, index ) {
            return that.arrSents[value];
        });
    },

    applyThreshold: function(obj, threshold) {
        //VAR: obj = hash where key = anything, value = integer. Usually this will be a hash recording co-occurring (key) & how often each word occurs (value), so this function will remove co-occurring words that occur <= threshold.
        //METHOD: returns object that only contains phrases about a threshold value
        for (var w in obj)
            if (obj[w] <= threshold)
                delete obj[w];

        return obj;
    },

    matchAllWords: function(arrWords) {
        //VAR: arrWords = array of words
        //METHOD: returns all sentence indices that contains all words in array 'arrWords'
        //record all sentence indices
        var arrMatches = [];
        for ( var i = 0; i < this.arrSents.length; i++ )
            arrMatches.push(i);

        //find all sentence indices that contain each word
        for (var word of arrWords) {
            //find sentence indices in 'arrMatches' that contain 'word'
            var newMatches = [];
            var regEx = new RegExp(word, 'i');
            for ( var i of arrMatches )
                if ( this.arrSents[i].search( regEx ) > -1 )
                    newMatches.push(i);

            //record matches as to search again in the next loop
            arrMatches = newMatches;
        }

        return arrMatches;
    },

    betweenWords: function(index, wordA, wordB) {
        //VAR: index = index of sentence in this.arrSents
        //VAR: wordA & wordB = strings that will be the words used to find words in between 
        //METHOD: finds the words in between 2 words. Assumes that the index contains both words
        
        //TEST:: console.log("betweenWords: wordA = ", wordA, " & wordB = ", wordB);

        //split sentence into individual words & find position of wordA & wordB
        var sentWords = this.arrSents[index].toLowerCase().split(' ');
        var posA = sentWords.indexOf( wordA.toLowerCase() );
        var posB = sentWords.indexOf( wordB.toLowerCase() );
        var posRange = [posA, posB].sort( function(a, b) { return a - b; } );

        //extract words & turn into a string
        var arrSub = sentWords.slice( posRange[0], posRange[1] + 1 );

        return arrSub.join(' ');
    },

    allBetweenWords: function(wordA, wordB) {
        //METHOD: retrieves all words between string 'wordA' & 'wordB' from all sentences
        //find all sentences that contain all words in 
        var arrWords = [wordA, wordB];
        var arrMatches = this.matchAllWords(arrWords);

        //retrieve all between words
        var allBetweens = [];
        for (var i of arrMatches)
            allBetweens.push( this.betweenWords(i, wordA, wordB) );

        return allBetweens;
    },

    findMostCommonWords_SelectSent( arrSentI, topX ) {
        /*
        METHODS: retrieves the most common words in select sentence indices
        Args:
            -arrSentI = an array of integers that refers to the sentence indices in document
            -topX = integer, number of top words to return from strTools_AllWordsFreqSortedTop()
        Returns:
            -returns output from strTools_AllWordsFreqSortedTopX(), which an array where each element is "# of occurrences of a word:word" (e.g. 23:car)
        */
        arrSentI = arrSentI || Array.apply( null, {length: this.arrSents.length - 1}).map( Number.call, Number );
        var arrSents = this.retrieveSentences( arrSentI );
        var strSents = arrSents.join( ' ' );

        var topWords = strTools_AllWordsFreqSortedTopX( strSents, topX, true, true );

        return topWords;
    },

    /* Clustering Method 1: Hierarchical Clustering */
    findCoOccurWords_Hierarchy: function( word, threshold ) {
        /*
        THIS FUNCTION IS NOT COMPLETE!!!
        VAR: strWords = words in a string separated by the delimiter ":"
        VAR: threshold = integer that, if > 0, will be used to remove any co-occurring words 
        METHOD: looks for words co-occurring with all words in "strWords" starting with the first word in "strWords", and then narrowing down the results with each word
        */
        threshold = threshold || 0;

        //retrieve sentences that contain word
        this.findSentI_SelectSent( word );

        //find the sentences that contain this word
        var arrSentI = this.findSentI( word );

        for ( var i in arrWords ) {
            //retrieve all sentences that contain word
            var arrSentI = this.findSentI( word );
            //take into consideration the perimeter around a specific sentence
            arrSentI = this.radiusSentI( arrSentI );
        }
    },
}