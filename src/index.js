const { Client } = require('pg');
const format = require('pg-format');

const { ethers } = require("ethers");
const RPC = 'http://localhost:8545/'

const provider = new ethers.providers.JsonRpcProvider(RPC)

const postgres_client = new Client({
    host: 'localhost',
    user: 'username',
    database: 'trace_db',
    password: 'password',
    port: 5432,
});

postgres_client.connect();

const storeRangeTraces = (rangeTraces, block) => {
    console.time(`inserted into db for ${block}-${block + 49} range`)
    postgres_client.query(format('INSERT INTO block_traces(block_number, raw_traces) VALUES %L', rangeTraces),[], (err, result)=>{
        if (err) {
            console.log(err)
        } else {
            console.timeEnd(`inserted into db for ${block}-${block + 49} range`)
        }
    })

}

const fetchRangeTraces = async(startBlock, endBlock) => {
    var final = []
    console.time(`fetched traces for ${startBlock}-${endBlock}`)
    const res = await provider.send("trace_blockRange", [startBlock, endBlock])
    console.timeEnd(`fetched traces for ${startBlock}-${endBlock}`)
    for(var i=startBlock;i<=endBlock; i++){
        const traces = JSON.stringify(res[i-startBlock])
        final.push([i, traces])
    }
    storeRangeTraces(final, startBlock)
}


const main = async() => {
    if (process.env.START && process.env.END){
        const startBlock = parseInt(process.env.START)
        const endBlock = parseInt(process.env.END)
        for(var i=startBlock;i<endBlock;i=i+50){
            await fetchRangeTraces(i + 1, i + 50)
            const percentage = [(i-startBlock)/(endBlock-startBlock)] * 100
            console.log(`${percentage.toFixed(2)}% backfilling done`)
            console.log('********')
        }
        console.log("100% done - backfilling completed")
    }else{
        console.log("Please provide START/END environment variables")
        process.exit()
    }
}

main()