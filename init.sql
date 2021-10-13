CREATE TABLE block_traces(
    block_number int,
    raw_traces json
);

CREATE index blocks_num_idx ON block_traces(block_number);