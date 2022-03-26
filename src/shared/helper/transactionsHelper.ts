import { TRANSACTION_MODE, TRANSACTION_TYPES } from '@shared/constants';
import { findIndex } from 'lodash';
import * as moment from 'moment';


export const getTransactionAmountFromMessage = (messageArray:Array<any>): number => {
    let transactionAmount = NaN;
    const firstRsOccurence = findIndex(messageArray, (word) => word.match(/rs/g));
    const INROccurence = findIndex(messageArray, (word) => word.match(/inr/g));
    //If rs is present
    const indexToBeUsed = firstRsOccurence >= 0 ? firstRsOccurence : INROccurence >=0 ? INROccurence : null;
    const stringToBeCheckedForCurrency = firstRsOccurence >= 0 ? 'rs.' : INROccurence >=0 ? 'inr' : null;
    if(indexToBeUsed)
    {
        //If the next element to rs
        if(!isNaN(parseFloat(messageArray[indexToBeUsed+1]))){
            transactionAmount = messageArray[indexToBeUsed+1];
        }
        else{
            const amountWithRsString = messageArray[indexToBeUsed];
            transactionAmount = parseFloat(amountWithRsString.split(stringToBeCheckedForCurrency).pop());
        }
    }
    //If no rs is present try for INR
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
    } else if(['deposited','salary'].some(word => messageArray.includes(word))){
        transactionMode = TRANSACTION_MODE.FUND_TRANSFER;
    }
    else {
        transactionMode = null;
    }
    return transactionMode;
}

export const getTransactionTypeFromMessage = (messageArray: Array<string>): string => {
    let transactionType = '';
    if(['debited','spent'].some(word => {
    return messageArray.includes(word);})){
        transactionType = TRANSACTION_TYPES.DEBIT;
    }
    else if(['credited'].some(word => messageArray.includes(word))){
        transactionType = TRANSACTION_TYPES.CREDIT;
    }
    else if(['deposited','salary'].some(word => messageArray.includes(word))){
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
            const transactionDestinationInitial = messageArray[firstVPAoccurence+1];
            const stringAfterAtSymbol = transactionDestinationInitial.split('@').pop();
            const indexOfNonAlphabet = stringAfterAtSymbol.search(/[^a-z]/i);
            const finalStringAfterAtSymbol = stringAfterAtSymbol.substring(0,indexOfNonAlphabet);
            const transactionArr = transactionDestinationInitial.split('@');
            transactionArr[1] = finalStringAfterAtSymbol;
            transactionDestination = transactionArr.join('@');
        } else if(transactionType === TRANSACTION_TYPES.CREDIT) {
            transactionDestination = messageArray[firstVPAoccurence+1];
        }
    }
    else if(transactionMode === TRANSACTION_MODE.FUND_TRANSFER){
        if(transactionType === TRANSACTION_TYPES.CREDIT){
        const messageWithoutEmptyStrings = messageArray.filter((word) => word);
            const firstFToccurence = findIndex(messageWithoutEmptyStrings, (word) => word === 'ft');
            const transactionSourceEndingIndex = findIndex(messageWithoutEmptyStrings, (word )=> word.includes('xxxxxxxxxx'))
            const transactionSourceInitial = messageWithoutEmptyStrings.slice(firstFToccurence+1, transactionSourceEndingIndex+1);
            transactionSource = transactionSourceInitial.join(' ');
            const firstACOccurence = findIndex(messageWithoutEmptyStrings, (word) => word === 'a/c');
            transactionDestination = messageWithoutEmptyStrings[firstACOccurence+1];
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

export const getTransactionDate = (messageArray:Array<string>): string => {
    try{
    const formatOfDateFromMessage = {
        isDDMMYY: 0,
        isYYYYMMDD:0,
        isDDMMMYY: 0
    }
    const dateTransformedStrings = messageArray.map((word)=> word.substring(0,10))
    const transactionDate = dateTransformedStrings.find((word) => {
        const dates = {
              DDMMYYYY: moment(word.replace(/\./g,''),'DD-MM-YY', true),
            YYYYMMDD: moment(word.replace(/\./g,''),'YYYY-MM-DD', true),
            DDMMMYY: moment(word.replace(/\./g,''),'DD-MMM-YY', true)
        };
        if(dates.DDMMYYYY.isValid()){
            formatOfDateFromMessage.isDDMMYY = 1;
        }
        else if(dates.YYYYMMDD.isValid()){
            formatOfDateFromMessage.isYYYYMMDD = 1
        }else if(dates.DDMMMYY.isValid()){
            formatOfDateFromMessage.isDDMMMYY = 1
        }
        return dates.DDMMYYYY.isValid() || dates.YYYYMMDD.isValid() || dates.DDMMMYY.isValid();
     });
     if(formatOfDateFromMessage.isDDMMYY)
     return moment(transactionDate, 'DD-MM-YY').format('YYYY-MM-DD');
     else if(formatOfDateFromMessage.isYYYYMMDD)
     return moment(transactionDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
     else if(formatOfDateFromMessage.isDDMMMYY)
     return moment(transactionDate, 'DD-MMM-YY').format('YYYY-MM-DD');
    }
    catch(error)
    {
        console.log(error);
    }
}

export const getTransactionId = (messageArray:Array<string>): string => {
    try{
        const messagesWithoutEmptyStrings = messageArray.filter((ele) => ele);
        const firstRefNOOccurence = findIndex(messagesWithoutEmptyStrings, (word) => word === 'no');
        if(firstRefNOOccurence<=0){
            return null;
        }
        const initialTransactionId = messagesWithoutEmptyStrings[firstRefNOOccurence+1];
        const transactionId = initialTransactionId ? initialTransactionId.replace(/\D/g,'') : null;
        return transactionId;
    }catch(error) {
        console.log(error);
        throw error;
    }
}
