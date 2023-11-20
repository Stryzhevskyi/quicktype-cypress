const express = require('express');
const cors = require('cors');
const helmet = require('helmet')
const bodyParser = require('body-parser')
const parseArgs = require('minimist')
const sourceMap = require('source-map');
const fetchImport = import('node-fetch');
const quicktype = require('quicktype-core');
let fetch;

fetchImport.then((m) => {
  fetch = m.default;
});

let server;
const argv = {
  port: 8001,
  ...parseArgs(process.argv.slice(2)),
};

const requests = new Map();
const sourceFiles = new Map();

const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.json({limit: '50mb'}));

app.get('/', (req, res) => {
  res.send('OK');
});

app.post('/request', async (req, res) => {
  const {column, line, reqBody, resBody, sourceUrl, url} = req.body;

  const sourceLocation = await getSourceLocation({ sourceUrl, line, column });
  const json = await quicktypeJSON("ts", "Person", JSON.stringify(resBody));
  console.log(json.lines);

  res.status(200);
  res.send(sourceLocation);
});

function start(port = argv.port) {
  server = app.listen(port, () => {
    console.log(`Type server is listening on port ${port}`);
  });
}

function stop() {
  if (server) {
    server.close(() => console.log('Type server stopped'));
  }

  Object.values(sourceFiles).forEach((v) => {
    v.consumer.destroy();
  });
}

async function getSourceLocation({sourceUrl, line, column}) {
  if (!sourceFiles.has(sourceUrl)) {
    await fetch(sourceUrl).then((res) => res.text()).then((text) => {
      const mapName = text.match(/\/\/# sourceMappingURL=(.*)/)[1];
      const mapUrl = sourceUrl.split('/').slice(0, -1).concat(mapName).join('/');
      return fetch(mapUrl).then((res) => res.json()).then((sMap) => {
        return sourceMap.SourceMapConsumer.with(sMap, null, (consumer) => {
          sourceFiles.set(sourceUrl, {
            consumer,
          })
        });
      })
    });
  }

  return sourceFiles.get(sourceUrl).consumer.originalPositionFor({line, column});
}

async function quicktypeJSON(targetLanguage, typeName, jsonString) {
  const jsonInput = quicktype.jsonInputForTargetLanguage(targetLanguage);

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString]
  });

  const inputData = new quicktype.InputData();
  inputData.addInput(jsonInput);

  return await quicktype.quicktype({
    inputData,
    lang: targetLanguage,
    debugPrintGatherNames: false,
    debugPrintGraph: false,
    debugPrintReconstitution: false,
    debugPrintSchemaResolving: false,
    debugPrintTimes: false,
    debugPrintTransformations: false,
    rendererOptions: {
      justTypes: true,
    },
    justTypes: true,
  });
}

start();
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

module.exports = {
  start,
  stop,
}

// export const tsFlowOptions = Object.assign({}, javaScriptOptions, {
//   justTypes: new BooleanOption("just-types", "Interfaces only", false),
//   nicePropertyNames: new BooleanOption("nice-property-names", "Transform property names to be JavaScripty", false),
//   declareUnions: new BooleanOption("explicit-unions", "Explicitly name unions", false),
//   preferUnions: new BooleanOption("prefer-unions", "Use union type instead of enum", false),
//   preferTypes: new BooleanOption("prefer-types", "Use types instead of interfaces", false),
//   preferConstValues: new BooleanOption(
//     "prefer-const-values",
//     "Use string instead of enum for string enums with single value",
//     false
//   )
// });
