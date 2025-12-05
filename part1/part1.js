const fs = require("node:fs");
const path = require("node:path");
const { createGzip } = require("node:zlib");

//function to create a stream (to apply DRY princible)
const createStream = (path, type, options) => {
  if (type === "read") return fs.createReadStream(path, options);
  else if (type === "write") return fs.createWriteStream(path, options);
  else throw new Error("unknown type");
};

//1. Use a readable stream to read a file in chunks and log each chunk.
const bigDataPath = path.resolve("./big.txt");

const readStream1 = createStream(bigDataPath, "read", {
  encoding: "utf-8",
  highWaterMark: 10,
});

readStream1.on("data", (chunk) => {
  console.log("======================================================");
  console.log({ chunk });
});

readStream1.on("end", () => {
  console.log("Read stream1 is ended.");
  readStream1.close();
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log(
  "-------------------------------------------------------------------------------------------------------------------------"
);

//2. Use readable and writable streams to copy content from one file to another.
const soursePath = path.resolve("./source.txt");
const distPath = path.resolve("./dist.txt");

const readStream2 = createStream(soursePath, "read", {
  encoding: "utf-8",
  highWaterMark: 10,
});

const writeStream2 = createStream(distPath, "write", {
  encoding: "utf-8",
  highWaterMark: 10,
});

readStream2.on("data", (chunk) => {
  console.log(
    "==============================================================="
  );
  console.log({ chunk });
  writeStream2.write(chunk);
});

readStream2.on("end", () => {
  console.log("Read and write stream2 is ended");
  readStream2.close();
  writeStream2.close();
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log(
  "-------------------------------------------------------------------------------------------------------------------------"
);

//3. Create a pipeline that reads a file, compresses it, and writes it to another file.
const zibPath = path.resolve("./result.txt.gz");

const readStream3 = createStream(bigDataPath, "read", {});
const writeStream3 = createStream(zibPath, "write", {});

const zib = createGzip();

readStream3.pipe(zib).pipe(writeStream3);

console.log(
  "-------------------------------------------------------------------------------------------------------------------------"
);
