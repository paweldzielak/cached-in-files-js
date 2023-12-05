import { readFileSync, writeFileSync } from "fs";

import * as dotenv from 'dotenv'
import path from "path";
dotenv.config()

const SECRET = process.env.FILE_SECRET ?? 'secret51';
const CACHED_JSON_PATH = path.join(__dirname, '..', 'output', 'cached.json');

const encode = (plaintext: string) => {
  const enc = [];
  for (let i = 0; i < plaintext.length; i += 1) {
    const keyC = SECRET[i % SECRET.length];
    const encC = `${String.fromCharCode((plaintext[i].charCodeAt(0) + keyC.charCodeAt(0)) % 256)}`;
    enc.push(encC);
  }
  const str = enc.join('');
  return Buffer.from(str, 'binary').toString('base64');
};

const decode = (ciphertext: string) => {
  const dec = [];
  const enc = Buffer.from(ciphertext, 'base64').toString('binary');
  for (let i = 0; i < enc.length; i += 1) {
    const keyC = SECRET[i % SECRET.length];
    const decC = `${String.fromCharCode((256 + enc[i].charCodeAt(0) - keyC.charCodeAt(0)) % 256)}`;
    dec.push(decC);
  }
  return dec.join('');
};

const writeCachedFile = (data: string) => {
  try {
    writeFileSync(CACHED_JSON_PATH.replace('cached', 'uncached'), data, { encoding: 'utf-8' }) // TODO delete on production
    const encodedData = encode(data);
    writeFileSync(CACHED_JSON_PATH, encodedData, { encoding: 'utf-8' })
    return true
  } catch (e: any) {
    console.log(e);
    return false
  }
}


const readCachedFile = () => {
  try {
    const result = readFileSync(CACHED_JSON_PATH);
    const decodedResult = decode(result.toString());
    return JSON.parse(decodedResult);
  } catch (e) {
    console.log(e);
    return []
  }
}

export {
  writeCachedFile,
  readCachedFile
}
