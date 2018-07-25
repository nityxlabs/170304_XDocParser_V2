//CLASS 4 - Stemmer Algorithm//
function escapeRegExp(str) {
    //METHOD: this function will return a string where all escapable characters will be escaped, so then it can be used with "new RegExp"
    //SOURCE: http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
    // return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\<\>\:\"\'\=\!\/]/g, "\\$&");
}

String.prototype.wordSimilarityV1 = function(compareWord, minSim)
{
    //VAR: compareWord = string that will be compared to the word contained in "this"
    //VAR: minSim (minimum similarity) = a decimal number between 0 to 1 comparing the similarity between the two strings "this" & "compareWord".
    //METHOD: this function will compare how similar the string in "this" is to the "secondWord", and will return true if the similarity between both words is greater than or equal to minSim, else returns false

    //STEP: sort the string from shortest to longest. Make both words lowercase as do not want letter casing affecting letter comparison
    var arrStr = [ this.toLowerCase(), compareWord.toLowerCase() ];
    arrStr = arrStr.sort(function (a, b) {return a.length - b.length;});

    //STEP: check if the string can possibly be larger than the minimum similarity
    if((arrStr[0].length/arrStr[1].length)<minSim)
        return false;

    //STEP: compare the characters between both strings
    var arrWS = arrStr[0].split("");          //arrWS = array Word Short. An array that contains each letter of the short word
    var arrWL = arrStr[1].split("");          //arrWL = array Word Long. An array that contains each letter of the long word
    var countSim = 0;     //countSim = variable that will count the number of the same characters in the same position
    for(var c in arrWS)
        if( arrWS[c] === arrWL[c] )     //compare each letter & record how many of the characters are the same
            countSim++;

    //STEP: returns true if the similarity is  >=  minSim, else returns false
    return ( countSim / arrWL.length ) >= minSim;
};

function stemmer_removePreSufFix(wordOI,arrPrefix,arrSuffix)
{
    //VAR: wordOI (word Of Interest) = word that will be checked to see if any prefixes or suffixes are present
    //VAR: arrPrefix = array that contains known prefixes. Note that this has to be in order from longest to shortest as some of the long prefixes could contain a short prefix, therefore do not want remove a short prefix when in actuality a long prefix was the correct prefix (e.g. "a" -> "ab", "anti")
    //VAR: arrSuffix = array that contains known suffixes. Note that this has to be in order from longest to shortest as some of the long suffixes could contain a short suffix, therefore do not want remove a short suffix when in actuality a long suffix was the correct suffix (e.g. "a" -> "ab", "anti")
    //METHOD: this function will remove any prefixes and suffixes the string
    //OUTPUT: this function will return string "wordOI" without any prefixes or suffixes

    //STEP: go through all the prefixes to see if they are present in the word "wordOI"
    for(var x in arrPrefix)
    {
        var boolStrPres = strTools_checkPrefix(arrPrefix[x],wordOI);
        if(boolStrPres)
        {
            var prefixLen = arrPrefix[x].length;
            wordOI = wordOI.substr(prefixLen);
            break;          //need to get out of loop once prefix is found because there is no such thing as multiple prefixes
        }
    }

    //STEP: go through all the suffixes to see if they are present in the word "wordOI"
    for(var x in arrSuffix)
    {
        var boolStrPres = strTools_checkSuffix(arrSuffix[x],wordOI);
        //TEST: console.log("aPS Suffix 1: "+wordOI+" | arrSuffix[x] = "+arrSuffix[x]+" || boolStrPres = "+boolStrPres);
        if(boolStrPres)
        {
            var suffixLen = arrSuffix[x].length;
            var wordOI_pos = wordOI.length-arrSuffix[x].length;       //find where to begin at the end of the string
            wordOI = wordOI.substr(0,wordOI_pos);
            break;          //need to get out of loop once suffix is found because there is no such thing as multiple suffixes
        }
    }

    return wordOI;
}


function classStemmer( docText, stemMinLen, minSimThres )
{
    //VAR: docText = string that is the document that will be analyzed
    //VAR: stemMinLen = the minimum character length for considering stems
    //VAR: stemMinThres = the minimum similarity threshold for a word to be considered similar to the word being compared to
    //CLASS: this class is responsible for identifying words that are similar based on the root word
    this.stemMinLen = stemMinLen;     //this is the minimum character length for considering stems
    this.minSimThres = minSimThres;           //minSim = the minimum similarity threshold for a word to be considered similar to the word being compared to
    this.hashOWS = {};        //hashOWS = hash Original Word to Stem, key = original word, value = stem word
    this.hashSOW = {};        //hashSOW = hash Stem to Original Word, key = stem word, value = array of original word

    //STEP: retrieve all the words in the document, excluding the common words
    var arrWords = strTools_retrieveDocWords(docText,true);
    
    //STEP: for each word, find words that contain prefix & suffix and remove the prefix & suffix
    var arrTemp = this.trackPreSufFix( arrWords );
    var hashWordPSfix = arrTemp[0];       //hashWordPSfix = hash Word Prefix + Suffix. This hash will have the original word as the key and the value will be word with the modified word (modified words = prefix + suffix removed)
    var arrModWords = arrTemp[1];         //arrWordPSfix = array Word Prefix + Suffix. This array will record all the modified words (modified words = prefix + suffix removed)

    //sort the array of modified words from shortest word to longest word
    arrModWords = strTools_orderWordsByLen( arrModWords, this.stemMinLen, -1, false );

    //STEP: compare the similarity of each word to other words in the list, record the words that meet or surpass the similarity threshold, and then remove the words found
    var hashWordStems = this.compareStems( arrModWords );

    //STEP: find the original word & the defined stem, and record both of them in both hashes "hashOWS" & "hashSOW"
    for(var k in hashWordPSfix)     //k = the original word, hashWordPSfix = the modified word
    {
        //STEP: record original word & corresponding stem word
        var modWord = hashWordPSfix[k];
        //check if the word has a stem - if not (i.e. if undefined), then skip this iteration of the loop
        if( !hashWordStems.hasOwnProperty( modWord ) )      
            continue;

        var wordStem = hashWordStems[modWord];
        this.hashOWS[k] = wordStem;
        
        //STEP: need to check if the key exists in the hash "this.hashSOW" - if not, then create array
        if(!this.hashSOW.hasOwnProperty(wordStem))
            this.hashSOW[wordStem] = [];
        //push word into array for corresponding word stem
        this.hashSOW[wordStem].push(k);
    }
};

classStemmer.prototype.trackPreSufFix = function( arrWords )
{
    //VAR: arrWords = array of words. It does not need to be sorted but it would help
    //METHOD: this function will modified each word to remove any potential prefix and suffix & record each original word & their corresponding string with the prefix & suffix removed
    //OUTPUT: will return 2 outputs - hashWordPSfix & arrWordPSfix
    //OUTPUT: hashWordPSfix = hash Word Prefix + Suffix. This hash will have the original word as the key and the value will be word with the modified word (modified words = prefix + suffix removed)
    //OUTPUT: arrWordPSfix = array Word Prefix + Suffix. This array will record all the modified words (modified words = prefix + suffix removed)

    //STEP: prepare the list of known prefixes & suffixes 
    var strPrefix = "a,ab,anti,de,dis,ex,il,in,mis,non,pre,re,un";
    var strSuffix = "able,al,ed,er,est,less,ness,ful,ible,ing,s,ly,logy,ology,tion,ion";
    //create string of prefixes & suffixes in an array
    var arrPrefix = strPrefix.split( "," );
    var arrSuffix = strSuffix.split( "," );
    //need to order from longest to shortest as some of the short strings could be contained in the long strings (e.g. "a" -> "ab", "anti")
    arrPrefix = strTools_orderWordsByLen( arrPrefix, 0, 0, true );
    arrSuffix = strTools_orderWordsByLen( arrSuffix, 0, 0, true );

    //STEP: go through each word and remove the prefix & suffix and record the modified words and the original word
    var hashWordPSfix = {};       //hashWordPSfix = hash Word Prefix + Suffix. This hash will have the original word as the key and the value will be word with the modified word (modified words = prefix + suffix removed)
    var arrWordPSfix = [];            //arrWordPSfix = array Word Prefix + Suffix. This array will record all the modified words (modified words = prefix + suffix removed)
    for(var w in arrWords)
        hashWordPSfix[arrWords[w]] = stemmer_removePreSufFix( arrWords[w], arrPrefix, arrSuffix );

    //STEP: retrieve all the modified words - these are all words with the prefix & suffixes removed
    var arrModWords = Object.keys( hashWordPSfix ).map( function( key ) { return hashWordPSfix[ key ]; } );
    arrModWords = jQuery.unique( arrModWords );

    return [ hashWordPSfix, arrModWords ];
};

classStemmer.prototype.compareStems = function(arrModWords)
{
    //VAR: arrModWords (array Modified Words) = an array of words where the prefix & suffix have been removed and has been sorted from shortest word to longest word
    //METHOD: this function will compare the stem words in the array "arrModWords" to find if stems are similar enough to each other
    //OUTPUT: hash that contains the similar word (key) and its stem (value). Therefore, there will be a unique key, but different keys can have the same value.
    var hashWordStems = {};       //hashWordStems = hash will record the stem word & corresponding words associated with the stem. Key = modified word, value = the stem word that is common between this string and other strings
    //STEP: go through each word in the array, comparing the stems, and then removing words that are similar enough to the stem
    for(var i in arrModWords) {
        //STEP: compare the word in arrModWords[i] to each word (arrModWords[j])
        var j = i;        //only compare the words
        for ( var j in arrModWords ) {
            //STEP: compare the two words, and if it is more similar than the threshold "minSimThres", then record the word in hashWordStems & record the index as to remove that word later
            var boolSim = arrModWords[i].wordSimilarityV1( arrModWords[j], this.minSimThres );
            if(boolSim) {     //if true, then record the word & the stem
                //STEP: check if stem "arrModWords[i]" has another stem, if so then keep traversing 
                if( hashWordStems.hasOwnProperty(arrModWords[i]) && ( arrModWords[i] != hashWordStems[arrModWords[i]] ) ) {
                    var rootStem = hashWordStems[arrModWords[i]];
                    while( hashWordStems.hasOwnProperty(rootStem) && ( rootStem != hashWordStems[rootStem] ) ) 
                        rootStem = hashWordStems[rootStem];
                }
                else {
                    var rootStem = arrModWords[i];
                }
                //assign stem word (value) to the modified word (key)
                hashWordStems[arrModWords[j]] = rootStem;
            }
        }
    }

    return hashWordStems;
};

classStemmer.prototype.translateWordToStem = function(arrSents)
{
    //VAR: arrSents = array of sentences where each element is a sentence
    //METHOD: this function will convert each word in the sentences in array "arrSents" to their respective stem words

    //STEP: go through each sentence, and convert each word to its respective stem
    var arrStemSent = [];
    for(var s in arrSents)
    {
        //STEP: homogenize text & split sentence into individual words
        var homogenSent = strTools_homogenizeTextV0(arrSents[s]);
        var arrSW = homogenSent.split(" ");       //arrSW = array Sentence Words
        
        //STEP: go through each word & see if there is a stem associated with the original word
        var arrSS = [];           //arrSS = array Sentence Stems
        for(var w in arrSW)
        {
            arrSW[w] = $.trim(arrSW[w]);
            if(this.hashOWS[arrSW[w]])      //if original word has stem associated with it, then assign stem word
                arrSS.push(this.hashOWS[arrSW[w]])
            // else         //else if word has not stem associated with it (usually these are words not included for stems, such as common words)
            //  arrSS.push(arrSW[w]);
        }

        //STEP: convert array of stem words into a sentence and assign to 
        var strSS = arrSS.join(" ");      //strSS = string Sentence Stems
        arrStemSent.push(strSS);
    }

    return arrStemSent;
};

classStemmer.prototype.showListWordStems = function( inputStr ) {
    //VAR: inputStr = string that will be used to match to keys in this.hashOWS 
    //METHOD: finds keys in hashOWS (hash Original Word to Stem) that are similar to string 'inputStr'
    var hashMatches = {};
    var regEx = new RegExp( inputStr, 'i' );
    for (var k in this.hashOWS) {
        //if 'inputStr' is in original word, then save it
        if ( k.search(regEx) > -1 )
            hashMatches[k] = this.hashOWS[k];
    }

    return hashMatches;
}
//END: DEFINE CLASSES HERE//