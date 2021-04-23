import { NestFactory } from '@nestjs/core';
import { AllExceptionFilter } from './exception.filter';
import { ResponseInterceptor } from './response.interceptor';
import { AppModule } from './app.module';
import data from './data';

console.log('PROJ_PATH: ', process.env.PROJ_PATH);
console.log('PORT: ', process.env.PORT);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  await data.init();
  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log('server start on: ', port);
}
bootstrap();
