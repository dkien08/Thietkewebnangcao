const express=require('express')
const port =9000;
const app=express();
app.listen(port,
    ()=>{
    const test =port;
    console.log("port is listening",test)
})