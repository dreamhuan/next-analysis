import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/api/json')
  getDataSource() {
    return this.appService.getDataSource();
  }

  @Get('/api/cmp')
  getPageCmp(@Query('page') page) {
    console.log('query page: ', page);
    const cmp = this.appService.getPageCmp(page);
    return cmp;
  }

  @Get('/api/analysis')
  getAnalysisByPage(@Query('page') page) {
    console.log('query page: ', page);
    const refTree = this.appService.getAnalysisByPage(page);
    return refTree;
  }

  @Get('/api/analysisCmp')
  getAnalysisByCmp(@Query('page') page) {
    console.log('query page: ', page);
    const refTree = this.appService.getAnalysisByCmp(page);
    return refTree;
  }

  @Get('/api/graph')
  getGraphData(@Query('page') page) {
    console.log('query page: ', page);
    const graphData = this.appService.getGraphData(page);
    return graphData;
  }

  @Get('/api/allUsed')
  getAllUsedCmpFiles() {
    const pages = this.appService.getAllUsedCmpFiles()
    return pages;
  }


  @Get('/api/allUsedComp')
  getAllUsedCmp() {
    const pages = this.appService.getAllUsedCmp()
    return pages;
  }

  @Get('/api/all')
  getAllFiles() {
    const pages = this.appService.getAllFiles();
    return pages;
  }

  @Get('/api/not')
  getNotUsedFiles() {
    const pages = this.appService.getNotUsedFiles();
    return pages;
  }

  @Get('/api/i18n')
  getI18N() {
    const pages = this.appService.getI18N();
    return pages;
  }
}
