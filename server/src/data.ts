import * as path from 'path';
import * as fs from 'fs';
import { IData, TCompMapping } from './types';

const projPath = process.env.PROJ_PATH;
const filePath = projPath
  ? path.resolve(projPath, 'next-analysis.json')
  : path.resolve(__dirname, '../../next-analysis.json');

class Data {
  analysis: IData;
  cmpUsedMapping: TCompMapping;

  async init() {
    const content = await fs.promises.readFile(filePath);
    this.analysis = JSON.parse(content.toString());
  }
}

const data = new Data();

export default data;
