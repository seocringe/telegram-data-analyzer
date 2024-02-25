const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const JSONStream = require("JSONStream");

// Assuming meta_parser, text_parser, post_meta, beautify are defined elsewhere.
const meta_parser = require("./metadata_parser");
const text_parser = require("./text_parser");
const post_meta = require("./post_meta");
const beautify = require("./beautify");

const use_config = async (config) => {
  let config_data;
  try {
    config_data = JSON.parse(config);
  } catch (err) {
    throw new Error("The config.json has some errors:\n" + err);
  }

  try {
    console.time("analyze-text");
    const filePath = path.join(__dirname, ...config_data.filepath);

    let stream = JSONStream.parse(["chats", "list", true]);
    stream.on("data", function (data) {
      // Process the data with your custom logic...
    });

    // ... Additional event listeners as in your original code ...

    // Create a read stream and apply regex replacement before piping to JSONStream
    const readStream = fs.createReadStream(filePath, { encoding: "utf8" });
    const transformStream = new require("stream").Transform({
      transform(chunk, encoding, callback) {
        let data = chunk.toString();
        // Apply regex replacement for escape sequences
        data = data.replace(
          /\x([0-9A-Fa-f]{2})/g,
          (match, hex) => `\\u${parseInt(hex, 16).toString(16).padStart(4, "0")}`
        );
        this.push(data);
        callback();
      },
    });

    // Use pipeline to manage streams and their events/errors
    pipeline(readStream, transformStream, stream, (err) => {
      if (err) {
        console.error("Pipeline failed", err);
      } else {
        console.log("Pipeline succeeded");
        console.timeEnd("analyze-text");
      }
    });
  } catch (err) {
    throw err;
  }
};

fs.readFile(path.join(__dirname, "config.json"), async (err, data) => {
  if (err) throw err;

  await use_config(data);
});
