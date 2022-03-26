import { TRANSACTION_MODE, TRANSACTION_TYPES } from '@shared/constants';
import { findIndex } from 'lodash';
import * as moment from 'moment';


export const getTransactionAmountFromMessage = (messageArray:Array<any>): number => {
    let transactionAmount = NaN;
    const firstRsOccurence = findIndex(messageArray, (word) => word.match(/rs/g));
    
    //If rs is present
    if(firstRsOccurence >= 0)
    {
        //If the next element to rs
        if(!isNaN(parseFloat(messageArray[firstRsOccurence+1]))){
            transactionAmount = messageArray[firstRsOccurence+1];
        }
        else{
            const amountWithRsString = messageArray[firstRsOccurence];
            transactionAmount = parseFloat(amountWithRsString.split('rs.').pop());
        }
    }
    return transactionAmount;
    // To check if array 
    //arr1.every(elem => arr2.includes(elem))
}

export const getTransactionModeFromMessage = (messageArray:Array<string>): string => {
    let transactionMode = '';
    if(['debit','card'].every(word => messageArray.includes(word))){
        transactionMode = TRANSACTION_MODE.DEBIT_CARD;
    } else if(['credit','card'].every(word => messageArray.includes(word))){
        transactionMode = TRANSACTION_MODE.CREDIT_CARD;
    } else if(['upi','ref'].some(word => messageArray.includes(word))){
        transactionMode = TRANSACTION_MODE.UPI;
    } else {
        transactionMode = null;
    }
    return transactionMode;
}

export const getTransactionTypeFromMessage = (messageArray): string => {
    let transactionType = '';
    if(['debited','spent'].some(word => {
        console.log(messageArray.includes(word))
    return messageArray.includes(word);})){
        transactionType = TRANSACTION_TYPES.DEBIT;
    }
    else if(['credited'].some(word => messageArray.includes(word))){
        transactionType = TRANSACTION_TYPES.CREDIT;
    }

    return transactionType;
}

export const getTransactionSourceAndDestination = (messageArray:Array<string> , transactionType: string,transactionMode: string): {transactionSource: string, transactionDestination: string} => {
    let transactionSource = null, transactionDestination = null;
    //UPI 
    //source From a/c id last 4 digits
    //destination VPA address
    if(transactionMode === TRANSACTION_MODE.UPI){
        const firstACOccurence = findIndex(messageArray, (word) => word === 'a/c');
        const firstVPAoccurence = findIndex(messageArray, (word) => word === 'vpa');
        transactionSource = messageArray[firstACOccurence+1];
        if(transactionType === TRANSACTION_TYPES.DEBIT){
            //TODO: Get transaction destination
            let transactionDestinationInitial = messageArray[firstVPAoccurence+1];
            let stringAfterAtSymbol = transactionDestinationInitial.split('@').pop();
            let indexOfNonAlphabet = stringAfterAtSymbol.search(/[^a-z]/i);
            let finalStringAfterAtSymbol = stringAfterAtSymbol.substring(0,indexOfNonAlphabet);
            let transactionArr = transactionDestinationInitial.split('@');
            transactionArr[1] = finalStringAfterAtSymbol;
            transactionDestination = transactionArr.join('@');
        } else if(transactionType === TRANSACTION_TYPES.CREDIT) {
            transactionDestination = messageArray[firstVPAoccurence+1];
        }
    }
    else{
        const firstCardOccurence = findIndex(messageArray, (word) => word === 'card');
        transactionSource = messageArray[firstCardOccurence+1];
        const transactionSoureIndex = firstCardOccurence + 1;
        const afterSource = messageArray.slice(transactionSoureIndex+2);
        const wordONoccurence = findIndex(afterSource, (word) => word === 'on');
        transactionDestination = afterSource.slice(0, wordONoccurence).join(' ');
    }
    // To check if array 
    // Check for debit card or credit card
    //arr1.every(elem => arr2.includes(elem))
    return {transactionSource: transactionSource, transactionDestination: transactionDestination};
}

export const getTransactionDate = (messageArray:Array<string>) => {
    try{
    let formatOfDateFromMessage = {
        isDDMMYY: 0,
        isYYYYMMDD:0
    }
    const dateTransformedStrings = messageArray.map((word)=> word.substring(0,10))
    const transactionDate = dateTransformedStrings.find((word) => {
        console.log(word.replace(/\./g,''));
        //Should handle
        let dates = {
              ddMMYYYY: moment(word.replace(/\./g,''),'DD-MM-YY', true),
            YYYYMMDD: moment(word.replace(/\./g,''),'YYYY-MM-DD', true)
        };
        if(dates.ddMMYYYY.isValid()){
            formatOfDateFromMessage.isDDMMYY = 1;
        }
        else if(dates.YYYYMMDD.isValid()){
            formatOfDateFromMessage.isYYYYMMDD = 1
        }
        console.log(dates.ddMMYYYY.isValid() || dates.YYYYMMDD.isValid());
        return dates.ddMMYYYY.isValid() || dates.YYYYMMDD.isValid();
     });
     if(formatOfDateFromMessage.isDDMMYY)
     return moment(transactionDate, 'DD-MM-YY').format('YYYY-MM-DD');
     else if(formatOfDateFromMessage.isYYYYMMDD)
     return moment(transactionDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
    }
    catch(error)
    {
        console.log(error);
    }
}

export const getTransactionId = (messageArray:Array<string>) => {
    try{
        const messagesWithoutEmptyStrings = messageArray.filter((ele) => ele);
        const firstRefNOOccurence = findIndex(messagesWithoutEmptyStrings, (word) => word === 'no');
        let initialTransactionId = messagesWithoutEmptyStrings[firstRefNOOccurence+1];
        let transactionId = initialTransactionId ? initialTransactionId.replace(/\D/g,'') : null;
        return transactionId;
    }catch(error) {

    }
}
