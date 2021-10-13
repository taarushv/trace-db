Usage
=====

## Sync node (mainnet)

Fork that adds `trace_blockRange` and `trace_specificBlocks` rpc methods (no need to resync existing erigon node)

ex: 

To get traces for blocks in the range 11406500-11406550

`curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"trace_blockRange","params":[11406500,11406550],"id":67}' http://localhost:8545/`

To get traces for blocks 100, 200, and 300

`curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"trace_specificBlocks","params":[[100, 200, 300]],"id":67}' http://localhost:8545/`


```sh
git clone --recurse-submodules -j8 https://github.com/taarushv/erigon-trace-fork.git
cd erigon-trace-fork
make erigon
./build/bin/erigon
```
## Start custom rpc daemon

```sh
make rpcdaemon && ./build/bin/rpcdaemon --chaindata ~/.local/share/erigon/chaindata/  --http.api=eth,web3,trace  --http.addr 0.0.0.0 --http.vhosts=*  --http.corsdomain=* --http.port 8545 --rpc.gascap=10000000000000000000 --ws
```

## Start script to scrape traces into the database

Start postgres db container 

```sh
sudo docker-compose up -d
```

Install requirements

```sh
yarn
```

Scrape block traces

```sh
START=1 END=100 yarn start
```


## Export traces into .json and upload to IPFS

```
PINATA_APIKEY=XYZ PINATA_SECRET=ABC START=1 END=100 node src/export.js 
```


Response: 

```sh
Starting export
Uploading to pinata!
Uploaded to IPFS, Hash:  QmPNbDiHAWMfcsFxzZq6BULjKJHkZ3bfD1813SNbeD3Pcw
Visit https://gateway.pinata.cloud/ipfs/QmPNbDiHAWMfcsFxzZq6BULjKJHkZ3bfD1813SNbeD3Pcw
```

Stop container and delete database 

```sh
sudo docker-compose down && sudo rm -rf trace-database/
```