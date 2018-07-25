//HighlightDoc.js - HighlightDoc_171208.js
"use strict";

/*
Requirements
-requires FullSent.js

Notes
-this class is similar to “Nityxlabs/170310_DocFeed_FIB_js/Classes/MultiTextDisplay_170407.js"

Next Steps: Develop functions that can be used to find words, highlight words, and highlight sentences
    -Q: is there way a to click word and make it a part of my search without making each word a "button" (e.g. <span>)?
    -Need to figure out how to compare sentences in terms of similarity
        -IDEA 1: find words including highlight sentences vs. words excluded --> make 2 groups for some sort of clustering algorithm (is their such a thing as adversial clustering??)
*/

function HighlightDoc( arrSents ) {
    /*
    Args:
        -arrSents = create by class FullSent
    */
    //Scope-safe constructor
    if ( !(this instanceof HighlightDoc) )
        return new HighlightDoc( arrSents );

    this.arrSents = arrSents;
    this.listWords = [];        //record words that will be searched in this.arrSents
    this.wordColors = {};        //hash where key = word, value = hsla color      
}

//NEED TO TEST THIS FUNCTION
HighlightDoc.assignWordColors = function( listWords ) {
    //METHOD: assigns a color to each word (most likely using hsla)
    var numColors = 340 / listWords.length;     //I don't want to make it exactly 360 because I don't want the first & last word to be the same color
    
    //create array of colors for words
    var hslaStr = "";
    var hashWordColors = {};
    for (var i in listWords) {
        hslaStr = "hsla(" + (numColors * i) + ", 100%, 50%, 1)";
        hashWordColors[ listWords[i] ]  = hslaStr;
    }

    return hashWordColors;
}

HighlightDoc.isWordPresent = function( str, fullStr, modifiers ) {
    /*
    VAR: str = the string to search for in larger string "fullStr"
    VAR: fullStr = string that is the entire string that will be searched to see if word is present
    VAR: modifiers = regExp modifiers such as "g" = global, "i" = case-insensitive
    METHOD: searches for "str" in "fullStr". Returns true if "str" is present & false if it is not
    OUTPUT: this function will return the occurrence of "searchStr" if it occurs in string "strDB", else will return null if string is not found.
    NOTE: can't use certain special characters in regular expression, such as *
    NOTE: can use the following special characters, ">>", "}}", ":", ";"
    */
    var regExp = new RegExp( str, modifiers );
    return fullStr.match( regExp );
}

HighlightDoc.oneWordPresent = function( listWords, fullStr, modifiers ) {
    /* 
    Similar to HighlightDoc.allWordsPresentt(), but checks if only 1 of all words are present in fullStr 
    VAR: listWords = array of words that will be searched
    VAR: fullStr = string that is the entire string that will be searched to see if word is present
    VAR: modifiers = regExp modifiers such as "g" = global, "i" = case-insensitive
    */
    for ( var w of listWords ) {
        var regExp = new RegExp( w, modifiers );
        if ( regExp.test( fullStr ) )
            return true;
    }
    //this means all the words are present
    return false;
}

HighlightDoc.countUniqueWordsPresent = function( listWords, fullStr, modifiers ) {
    /*
    Counts how many of the words are present in "listWords" in "fullStr". If a word occurs more than once in "fullStr", it still only counts it 1x
    VAR: listWords = array of words that will be searched
    VAR: fullStr = string that is the entire string that will be searched to see if word is present
    VAR: modifiers = regExp modifiers such as "g" = global, "i" = case-insensitive
    */
    var count = 0;
    for ( var w of listWords ) {
        var regExp = new RegExp( w, modifiers );
        if ( regExp.test( fullStr ) )
            count++;
    }

    return count;
}

HighlightDoc.allWordsPresent = function( listWords, fullStr, modifiers ) {
    /* 
    Similar to HighlightDoc.isWordPresent(), but checks if all words are present in fullStr 
    VAR: listWords = array of words that will be searched
    VAR: fullStr = string that is the entire string that will be searched to see if word is present
    VAR: modifiers = regExp modifiers such as "g" = global, "i" = case-insensitive
    */
    for ( var w of listWords ) {
        var regExp = new RegExp( w, modifiers );
        if ( !( regExp.test( fullStr ) ) )
            return false;
    }
    //this means all the words are present
    return true;
}

HighlightDoc.findWordsPresent = function( listWords, fullStr, modifiers ) {
    /*
    Returns a list of words from "listWords" that is present in "fullStr"
    VAR: listWords = array of words that will be searched
    VAR: fullStr = string that is the entire string that will be searched to see if word is present
    VAR: modifiers = regExp modifiers such as "g" = global, "i" = case-insensitive
    */
    var wordsPresent = listWords.map( function( w, i ) {
        var regExp = new RegExp( w, modifiers );
        if ( regExp.test( fullStr ) )
            return w;
    } ).filter( function(x){ return x; } );

    return wordsPresent;
}

HighlightDoc.findFullWordFromRegExp = function( fullStr, regEx ) {
    /*
    finds all matches of 'regEx' in the string 'fullStr'
    Args:
        -fullStr = string that will be searched into
        -regEx = instance of a regular expression. Some important tips:
            -do not use ".*" for wildcard but instead just use "*": this is because using ".*" will match to the entire string of "fullStr" instead of finding multiple matches that match to 'regEx'
            -need to have 'g' (meaning global) to find all instances of 'regEx' in 'fullStr'
    */
    var match;
    var allMatches = [];
    while ( match = regEx.exec( fullStr ) ) {
        var index1 = match.index;
        // var index2 = fullStr.indexOf( ' ', index1 );     //this is an obsolete version of string
        // var index2 = fullStr.regexIndexOf( /[\s\.\?!,;:\(\)\[\]]/, index1 );
        // var index2 = fullStr.regexIndexOf( /[\W]/, index1 );        //the "\W" considers all character that are non-word character. Equivalent to [^A-Za-z0-9_]
        var index2 = fullStr.regexIndexOf( /[^A-Za-z0-9_\-]/, index1 );        //same as "\W" but also considers "-"
        

        //if a blank space is found
        if ( index2 > -1 )
            allMatches.push( fullStr.substring( index1, index2 ).trim() );
    }

    console.log( "allMatches = ", allMatches );
    return allMatches;
}


/* Functions: control words that will be searched */
HighlightDoc.prototype.addWord = function( w ) { 
    /* appends word to list words & assigns new colors to each word */
    this.listWords.push( w );
    this.wordColors = HighlightDoc.assignWordColors( this.listWords );
}
HighlightDoc.prototype.clearWordList = function() { 
    /* removes all record words & associated colors */
    this.listWords = [];
    this.wordColors = {}; 
}

/* Functions: find words in document */
HighlightDoc.prototype.findWords = function( statAll ) {
    /* 
    returns the sentence indices that contain the words in 'this.listWords'
    VAR: statAll = boolean where 'true' means all words from 'this.listWords' needs to be present, and 'false' means only 1 of the words from 'this.listWords' needs to be present
    */
    var present;
    var sentI = [];     //records all sentences that contain one
    //go throuh
    for ( var i in this.arrSents ){
        ( statAll ) ? present = HighlightDoc.allWordsPresent( this.listWords, this.arrSents[i], 'gi' ) : present = HighlightDoc.oneWordPresent( this.listWords, this.arrSents[i], 'gi' )
        //if word is present, then record sentence index
        if ( present )
            sentI.push( i );
    }

    return sentI;
}

HighlightDoc.prototype.countUniquePresence = function( ) {
    /*
    counts the number of words from "this.listWords" (not frequency of each word) that occur in each sentence in "this.arrSents"
    */
    var hashCount = {};     //records unique words present in each sentence across the entire document, key = sentence index, value = count for how many unique words occur in each sentence
    for ( var i in this.arrSents )
        hashCount[i] = HighlightDoc.countUniqueWordsPresent( this.listWords, this.arrSents[i], 'gi' );

    return hashCount;
}

HighlightDoc.prototype.wordsPerSent = function( statAll ) {
    /*
    returns a hash where key = sentence index, value = array of words from "this.listWords" 
    VAR: statAll = boolean where 'true' means all words from 'this.listWords' needs to be present, and 'false' means only 1 of the words from 'this.listWords' needs to be present
    */
    var hashSentIWords = {};        //key = sentence index, value = array of words contain

    //find the words that each sentence contains
    var listSentI = this.findWords( statAll );

    //record the words that present in each sentence
    if ( statAll ) {
        for (var i of listSentI)
            hashSentIWords[i] = this.listWords;
    }
    else {
        for (var i of listSentI)
            hashSentIWords[i] = HighlightDoc.findWordsPresent( this.listWords, this.arrSents[i], 'gi' );
    }

    return hashSentIWords;
}

HighlightDoc.prototype.highlightEachWordInText = function ( word, getText ) {
    /*
    Highlights all words associated with 'word' in getText. Usually use this if there is a "*" in word (this is a regular expression wildcard)
    Args:
        -word = string that will be used to highlight words in 
    */
    var regExp, cssHL, wordHL; 
    var objRegExp = new RegExp( word, 'gi' );
    var listMatches = HighlightDoc.findFullWordFromRegExp( getText, objRegExp );
    //sort list of matches so I highlight the longer words first because I think there is a chance for shorter words to be in the longer words
    listMatches.sort( function( a, b) {
        // ASC  -> a.length - b.length
        // DESC -> b.length - a.length
        return b.length - a.length;
    });

    //create text version that highlights the words
    cssHL = "color:#111111;-moz-border-radius:3px;-webkit-border-radius:3px;padding:1px;";
    listMatches.forEach( function( w, i ) {
        regExp = new RegExp( "\\b" + w + "\\b", 'gi' );
        wordHL = "<span style = 'background-color:" + this.wordColors[word] + ";" + cssHL + "'>" + w + "</span>";
        getText = getText.replace( regExp, wordHL );
    }.bind( this ) );

    return getText;
}

/* Functions: modify document by highlighting words and sentences */
HighlightDoc.prototype.highlightWordsInText = function( listWords, getText ) {
    /*
    returns the string 'strSent' with each word in 'listWords' highlighted.
    Args:
        -listWords = array of words that should be in string 'strSent'. (this should be computed by function HighlightDoc.prototype.wordsPerSent() )
        -getText = string that should contain all words in "listWords" where each word will be highlighted
    Note:
        -this function assumes that the words in 'listWords' is also present in hash 'this.wordColors', else an error will occur.
    */
    var wordHL, objRegExp;

    //create text version that highlights the words
    var cssHL = "color:#111111;-moz-border-radius:3px;-webkit-border-radius:3px;padding:1px;";
    // var that = this;     //don't need this since I'm using .bind( this )
    listWords.forEach( function( w, i ) {
        if ( /\*/.test( w ) )       //this is if there is a wildcard '*' present
            getText = this.highlightEachWordInText( w, getText );
        else {
            objRegExp = new RegExp( w, 'gi' );
            wordHL = "<span style = 'background-color:" + this.wordColors[w] + ";" + cssHL + "'>" + w + "</span>";
            getText = getText.replace( objRegExp, wordHL );
        }
    }.bind( this ) );       //NOTE: Need to use .bind( this ) as "this" in .forEach refers to "Window" object instead of "MultiTextDisplay" is  using .bind(this) replaces the use of "var that = this;"

    return getText;
} 

HighlightDoc.prototype.highlightFoundWords = function( allStat ) {
    /*
    highlights the words in each sentence by the function "HighlightDoc.prototype.wordsPerSent()"
    VAR: statAll = boolean where 'true' means all words from 'this.listWords' needs to be present, and 'false' means only 1 of the words from 'this.listWords' needs to be present
    */
    var arrSents = this.arrSents.slice();       //clone the array so the original array of sentences is not affected
    //find the words contained in each sentence
    var hashSentIWords = this.wordsPerSent( allStat );

    //highlight words in each sentence
    for (var i in hashSentIWords)
        arrSents[i] = this.highlightWordsInText( hashSentIWords[i], arrSents[i] );

    return arrSents;
}

HighlightDoc.prototype.highlightSentences = function( withWords, allStat ) {
    /*
    highlights the sentences that contains the words of interest
    VAR: withWord = boolean where 'true' means will highlight words as well as sentences & 'false' means will just highlight sentences
    VAR: statAll = boolean where 'true' means all words from 'this.listWords' needs to be present, and 'false' means only 1 of the words from 'this.listWords' needs to be present
    */
    //determine if I need to retrieve array of sentences with or without highlighted words
    var arrSents;
    ( withWords ) ? arrSents = this.highlightFoundWords( allStat ) : arrSents = this.arrSents.slice();      //clone the array so the original array of sentences is not affected

    //find the sentences that contains the words and highlight those sentences
    var hslaColor = "hsla(159, 100%, 50%, 0.5)";
    var cssHL = "background-color: " + hslaColor + ";color:#111111;-moz-border-radius:3px;-webkit-border-radius:3px;padding:1px;";
    var sentI = this.findWords( allStat );
    for ( var i of sentI )
        arrSents[i] = "<span style = '" + cssHL + "'>" + arrSents[i] + "</span>";

    return arrSents;
}

HighlightDoc.prototype.highlightSentencesUniqueWords = function( withWords, countThres ) {
    /*
    Highlights the sentences based on count of unique words present in each each sentence
    VAR: withWord = boolean where 'true' means will highlight words as well as sentences & 'false' means will just highlight sentences
    VAR: countThres = integer that is the threshold for which sentences should be highlighted. If this value is null, then the default should be -1 so 
    */
    countThres = countThres || -1;

    //determine if I need to retrieve array of sentences with or without highlighted words
    var arrSents;
    ( withWords ) ? arrSents = this.highlightFoundWords( false ) : arrSents = this.arrSents.slice();      //clone the array so the original array of sentences is not affected

    //calculate unique word count per sentence in the document
    var hashCount = this.countUniquePresence();
    var maxCount = Math.max.apply( null, Object.values( hashCount ) );
    var numColors = 340 / maxCount;

    //TEST::
    console.log( "hSUW: maxCount = ", maxCount );
    console.log( "hSUW: hashCount = ", hashCount );
    
    //highlight each sentence according to count of unique words per sentence
    var cssHL = "color:#111111;-moz-border-radius:3px;-webkit-border-radius:3px;padding:1px;"; 
    for ( var i in hashCount ) {
        if ( hashCount[i] >= countThres ) {
            var hslaStr = "hsla(" + (numColors * hashCount[i]) + ", 100%, 50%, 0.5)";
            arrSents[i] = "<span style = 'background-color:" + hslaStr + ";" + cssHL + "'>" + arrSents[i] + "</span>";

            //TEST:: shows the sentence index with the sentence
            // arrSents[i] = "<span style = 'background-color:" + hslaStr + ";" + cssHL + "'>[" + i + "] " + arrSents[i] + "</span>";
        }
    }

    //create gradient legend
    var legend = "<table border = '0' cellpadding = '5' cellspacing = '10'><tr><td>Legend</td></tr>";
    for ( var c = this.listWords.length; c >= countThres; c-- ) {
        if (c > maxCount) {     //this means the max count in "hashCount" is lower than the theoretical max
            legend+= "<tr><td><div style = '" + cssHL + "'>--- " + c + " ---</div></td></tr>";
        }
        else {
            var hslaStr = "hsla(" + (numColors * c) + ", 100%, 50%, 0.5)";
            legend+= "<tr><td><div style = 'background-color:" + hslaStr + ";" + cssHL + "'>" + c + "</div></td></tr>";
        }
    }
    legend+= "</table>";

    return [arrSents, legend];
}

/* Other functions */
String.prototype.regexIndexOf = function( regex, startpos ) {
    /*
    this should work like str.indexOf(), but uses regular expression instead of just string. I DID NOT WRITE THIS FUNCTION.
    Source: https://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expr
    */
    var indexOf = this.substring( startpos || 0 ).search( regex );
    return ( indexOf > -1 ) ? (indexOf + (startpos || 0)) : indexOf;
}

String.prototype.regexLastIndexOf = function(regex, startpos) {
    /*
    this finds the last index of a string using regex. I DID NOT WRITE THIS FUNCTION.
    Source: https://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expr
    */
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if(typeof (startpos) == "undefined") {
        startpos = this.length;
    } else if(startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = this.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    while((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
}


function checkAsteriskPos( searchWord ) {
    /*
    Determines where "*" occurs in the search query "searchWord". Can be any of the following combinations: "*word", "word*", or "*word*"
    */
    var score = 0;
    //Method 1 to find characters at start & end of string
    // if ( searchWord.charAt( 0 ).match( /[\*\+]/ ) )
    //     score += 1;
    // if ( searchWord.charAt( searchWord.charAt( searchWord.length - 1 ) ).match( /[\*\+]/ ) )
    //     score += 2;

    //Method 2 to find characters at start & end of string
    if ( searchWord.match( /^[\*\+]/ ) )
        score += 1;
    if ( searchWord.match( /[\*\+]$/ ) )
        score += 2;

    return score;
}

function formatQueryWord( searchWord, flags ) {
    /*
    Formats search word "getWord"
    Args:
        -getWord = string that may or may not contain "*" at beginning or end of search word: "*word", "word*", or "*word*"
        -flags = string that is flags for regular expression "g" (global), "i" (case-insensitive)
    */
    var regExp, searchWord2;
    flags = flags || "gi";
    var score = checkAsteriskPos( searchWord );

    //TEST::
    console.log( "query!!!!: ", searchWord, " & score = ", score );

    switch (score) {
        case 3:         //score 3 means asterisks on both sides, so do not include boundaries "\b"
            searchWord2 = searchWord.substring( 1, searchWord.length - 1 );
            regExp = new RegExp( searchWord2, flags );
            break;
        case 2:         //score 2 means asterisks at end of search query, so do not include boundaries "\b" at end
            searchWord2 = searchWord.substring( 0, searchWord.length - 1  );
            regExp = new RegExp( "\\b" + searchWord2, flags );
            break;
        case 1:         //score 1 means asterisks at start of search query, so do not include boundaries "\b" at start
            searchWord2 = searchWord.substring( 1 );
            regExp = new RegExp( searchWord2 + "\\b", flags );
            break;
        default:
            regExp = new RegExp( "\\b" + searchWord + "\\b", flags );
    }

    return regExp;
}