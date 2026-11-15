import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const records=JSON.parse(readFileSync(resolve('lib/datasets.json'),'utf8'));
test('guide contains 50-100 named NASA products',()=>assert.ok(records.length>=50 && records.length<=100));
test('each guide item has meaningful fields',()=>{for(const d of records){assert.ok(d.category && d.name && d.description && d.use && d.query);assert.ok(d.description.length>45)}});
test('unique dataset entries',()=>assert.equal(new Set(records.map(r=>r.name)).size,records.length));
test('NASA catalog URLs can be constructed',()=>{for(const d of records){const url=new URL(`https://search.earthdata.nasa.gov/search?q=${encodeURIComponent(d.query)}`);assert.equal(url.hostname,'search.earthdata.nasa.gov')}});
