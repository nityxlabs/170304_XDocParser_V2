//Class FullSent
//METHOD: splits a document into full, complete sentences

function FullSent( strText, numSentThres ) {
    //VAR: strText = string that is the document that will be analyzed
    //VAR: numSentThres = integer that is the threshold value for the number of characters that should be in a sentence
    //METHOD: this is a class that will manipulate a document
    if ( !(this instanceof FullSent) )
        return new FullSent( strText, numSentThres );

    
    //STEP: save the initial parameters for this object
    this.delimEOS = ". ";       //delimEOS  =  delimiter End Of Sentence. The string that will be appended to the end of each sentence.
    this.numSentThres = numSentThres;

    //need to consider the space between "Ph." & "D" as the function "setDoc_organizeOrigText()" adds ". " to incomplete sentences
    this.arrStrEndings = [ " Mrs", " Ms", " Mr", " Dr", " Ph", " Ph. D", " al" ];

    //process the text to separate into individual, complete sentences
    this.arrCompSent = this.makeFullSent( strText );

    //create stemmmer class
    // this.stemmer = new classStemmer(strText, stemMinLen, minSimThres);
    // this.arrCompSent_stem = this.stemmer.translateWordToStem(this.arrCompSent);

    //TEST:: 
    // var dispArr = arrTools_showArr_ConsoleLog( this.arrCompSent );
    // console.log( "full sent = " + dispArr );
};


FullSent.escapeRegExp = function( str ) {
    //METHOD: this function will return a string where all escapable characters will be escaped, so then it can be used with "new RegExp"
    //SOURCE: http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
    // return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\<\>\:\"\'\=\!\/]/g, "\\$&");
}

FullSent.strMatch = function( searchStr, strDB, modifiers ) {
    //VARS: searchStr = the string to search for in larger string "strDB"; modifiers = regExp modifiers such as "g" = global, "i" = case-insensitive
    //METHOD: searches for "str" in "strDB". Returns true if "str" is present & false if it is not
    //OUTPUT: this function will return the occurrence of "searchStr" if it occurs in string "strDB", else will return null if string is not found.
    //NOTE: can't use certain special characters in regular expression, such as *
    //NOTE: can use the following special characters, ">>", "}}", ":", ";"
    var reSearchStr = new RegExp(searchStr,modifiers);
    var strPresent = strDB.match(reSearchStr);
    return strPresent;
}

FullSent.prototype = {
    constructor: FullSent,

    makeFullSent: function( getText ) {    //formerly setDoc_makeCompleteSentences 
        //VAR: getText = a string of text that will be split into sentences 
        //METHOD: this function will split the document into full, individual sentences
        var arrSent = this.docToSent( getText );
        //this variable will compile the temporary sentence until a "whole" sentence is formed ( a "whole" sentence is determined by the function "this.checkSentAttr" )
        var tempCompileSent = "";
        //this variable will record the full sentences and separate the sentences 
        // var strFullSent = "";
        
        //go through each sentence to see if each array element is a complete sentence
        var arrCompSent = [];
        for( var a = 0; a < arrSent.length; a++ ) {
            //remove blanks at the ends of the sentence
            arrSent[a] = arrSent[a].trim();
            //make sure there is text in the array element, else I can skip that element
            if( /\S/.test( arrSent[a] ) && ( a < arrSent.length - 1 ) ) {
                //add the sentence to the compile variable "tempCompileSent" & check if "tempCompileSent" is a complete sentence
                tempCompileSent += arrSent[a] + " ";
               
                //statNS = status New Sentence - is the next sentence a new sentence
                var statNS = this.checkSentAttr( tempCompileSent, arrSent[ a + 1 ] );     
                
                //if true, then add this "full sentence" to the variable recording full sentences
                if(statNS) {
                    arrCompSent.push( tempCompileSent );
                    tempCompileSent = "";
                }
            }
            //this is the last sentence
            else if( /\S/.test( arrSent[a] ) && ( a === arrSent.length - 1 ) ) {
                tempCompileSent += arrSent[a];        //add the last sentence to the compile variable, as "tempCompileSent"
                arrCompSent.push( tempCompileSent );
            }
        }

        return arrCompSent;
    },

    docToSent: function( getText ) {       //formerly: docSplitAllEP
        //METHOD: splits a body of string into an array of individual sentences ( NOTE: splitAllEP = split All End Punctuations )
        //split the document by ".", "!", & "?"
        var arrSent = getText.split(/[.!?]/);
        //remove blank sentences
        arrSent = arrSent.filter(function(x) { return /\S/.test(x); });
        // arrSent = arrTools_removeBlanks(arrSent);

        //STEP: retrieve the end punctuation for each sentence
        for (var s in arrSent) {
            arrSent[s] = $.trim(arrSent[s]);
            //if array element has word characters, then check
            var arrSent_escape = FullSent.escapeRegExp( arrSent[s] );        //need to escape characters else an error will occur with string.search
            var getPunc = getText.charAt(getText.search(arrSent_escape) + arrSent[s].length);
            arrSent[s] += getPunc;
        }

        return arrSent;
    },

    //checkSentAttr = check Sentence Attributes
    checkSentAttr: function( currSent, nextSent ) {      //formerly "setDoc_checkSentComplete"
        //VAR: currSent = string that will be checked, specifically length & first character capitalized
        //VAR: nextSent = next sentence after currSent in the document
        //METHOD: checks if a sentence is a complete sentence or not, specifically if a sentence passes the length threshold and the first letter is capitalized
        currSent = currSent.trim();
        var sentStat = false;
        
        //STEP: check if the first character is capitalized & is a word character (e.g. not 0-9,-!&% etc.)
        //The "lax" algorithm does not exclude spaces, numbers whereas the "strict" function does.
        // var firstCharCap = strTools_checkFirstCharCap_Lax(currSent);
        var firstCharCap = this.checkFirstChar_v2( nextSent );
        var statSentEnd = this.checkSentEnd( currSent );       //check to see if the ending of the sentence could nullify if the sentence is a complete sentence or not
        if( ( currSent.length >= this.numSentThres ) && ( firstCharCap ) && ( statSentEnd === null ) ){ sentStat = true; }

        return sentStat;
    },

    findFirstWordChar( getStr ) {
        //VARS: getStr = a string parameter that will be checked to see if the first character is a capital letter
        //METHOD: Find the first character that is a word character
        var firstChar = getStr.match( /[A-Za-z]/ );
        return firstChar;
    },

    checkFirstChar: function( getStr ) {      //same as function "strTools_checkFirstCharCap_Strict()"
        //VARS: getStr = a string parameter that will be checked to see if the first character is a capital letter
        //METHOD: this function will be "true" if the first character of a string "getStr" is capital.
        //NOTE: for curly double & single quotation marks, need to use Unicode to identify them in regular expression. \u201C = left double quotation marks, \u201D = right double quotation marks, \u2018 = left single quotation mark, \u2019 = right single quotation mark
        getStr = getStr.trim();       //remove blanks from both ends of the string
        //COMPARISON 2: this compare ACCEPTS characters between A-Z & single & double quotations
        //NOTE: for curly double & single quotation marks, need to use Unicode to identify them in regular expression
        var getStat = false;

        if( ( getStr[0] === getStr[0].toUpperCase() ) && ( getStr[0].match(/[A-Z\[\"\'\u201C\u201D\u2018\u2019]/i) ) )
            getStat = true;       //NOTE: added "[" as it is used for references within a paper (e.g. car is red. [1] But the other car is blue.)

        return getStat;     
    },

    checkFirstChar_v2: function( getStr ) {      //same as function "strTools_checkFirstCharCap_Strict()"
        //VARS: getStr = a string parameter that will be checked to see if the first character is a capital letter
        //METHOD: similar to FullSent's function checkFirstChar(), but will find the first word character using function findFirstWordChar() to see if it is capitalized or not. 
        //NOTE: for curly double & single quotation marks, need to use Unicode to identify them in regular expression. \u201C = left double quotation marks, \u201D = right double quotation marks, \u2018 = left single quotation mark, \u2019 = right single quotation mark
        var firstChar = this.findFirstWordChar( getStr );       //this should return a hash
        if ( firstChar == null )
            return false;

        var getStat = false;
        if( ( firstChar[0] === firstChar[0].toUpperCase() ) && ( firstChar[0].match(/[A-Z\[\"\'\u201C\u201D\u2018\u2019]/i) ) )
            getStat = true;       //NOTE: added "[" as it is used for references within a paper (e.g. car is red. [1] But the other car is blue.)

        return getStat;     
    },

    checkSentEnd: function( currSent ) {        //formerly "setDoc_checkSentComplete_endSent"
        //VAR: currSent = this is a string that will be checked (specifically, length & first character capitalized)
        //METHOD: check if the end of a sentence ends in a string that could invalidate a sentence being a full sentence (e.g. Mrs., Ms., Mr., Dr.)
        //OUTPUT: if no matches are found between "currSent" and any of the elements of "arrStrEndings", then this function will return "null". Else if there is a match found, the string that was matched will be returned (e.g. if string ends in "said the Dr", the " Dr" will be returned)

        var strMatchEnd = null;       //boolean that will record if there is match between the strings. If there is a match, break out of the loop 
        for(var x in this.arrStrEndings) {
            //retrieve the last characters in the sentence
            var sentLastNChar = currSent.substring( currSent.length - this.arrStrEndings[x].length );
            //check to see if there is a match between the strings
            var strMatchEnd = FullSent.strMatch( this.arrStrEndings[x], sentLastNChar, "i" );     //this disregards case-sensitivity
            if( strMatchEnd != null ){ break; }
        }

        return strMatchEnd;
    },

    toString: function() {
        //METHOD: prints out all sentences

    }
}

//Other functions
function arrayNoBlanks (strArr) {
    //METHOD: returns an array with word characters in each element, removes all blanks
    return strArr.filter(function(x) { return /\S/.test(x); });
}

