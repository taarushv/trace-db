const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const { Client } = require('pg');
const pinataSDK = require('@pinata/sdk');
const postgres_client = new Client({
    host: 'localhost',
    user: 'username',
    database: 'trace_db',
    password: 'password',
    port: 5432,
});


const exportTraces = async() => {
    postgres_client.connect()
    if(process.env.START && process.env.END){
        console.log('Starting export')
        response = await postgres_client.query(`select * FROM block_traces WHERE block_number >= ${process.env.START} AND block_number <= ${process.env.END}`);
        if (response.rows.length > 0) {
            const fileDir = `${process.env.START}-${process.env.END}.json`
            const adapter = new FileSync(fileDir)
            const db = low(adapter)
            db.defaults({ traces: [], count: 0}).write()
            db.set('traces', response.rows).write()
            db.update('count', n => response.rows.length) .write()
            if(process.env.PINATA_APIKEY && process.env.PINATA_SECRET){
                console.log('Uploading to pinata!')
                const pinata = pinataSDK(process.env.PINATA_APIKEY, process.env.PINATA_SECRET);
                const sourcePath = './' + fileDir;
                const options = {
                    pinataMetadata: {
                        name: fileDir
                    },
                    pinataOptions: {
                        cidVersion: 0
                    }
                };
                const res = await pinata.pinFromFS(sourcePath, options)
                const ipfsHash = res.IpfsHash
                console.log("Uploaded to IPFS, Hash: ", ipfsHash)
                console.log("Visit https://gateway.pinata.cloud/ipfs/"+ ipfsHash)
            }else {
                console.log("Please supply PINATA_APIKEY & PINATA_SECRET env variables to upload export to IPFS")
            }
            process.exit()
        }
    }else{
        console.log("Specify 'START' and 'END' blocks as env variables")
    }
}

exportTraces()
