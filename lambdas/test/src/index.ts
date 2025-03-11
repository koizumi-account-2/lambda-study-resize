import {Handler} from 'aws-lambda'
 
 export const handler:Handler = (event)=>{
     console.log("呼ばれました");
     console.log('%o',event)
 }