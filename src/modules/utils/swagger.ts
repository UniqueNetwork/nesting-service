import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { ApiModule } from '../api';
import { INestApplication } from '@nestjs/common';

const runInfoFile = './config/run-info.txt';
const runInfo = fs.existsSync(runInfoFile)
  ? fs.readFileSync(runInfoFile).toString()
  : '';
console.log('runInfo', runInfo);

export function addSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .addSecurity('JWT', {
      description: 'Example: <code>Bearer {token here}</code>',
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
    })
    .setTitle('CityHelp')
    .setDescription(
      `<pre>
Build date: ${new Date().toString()}

${runInfo}
</pre>`,
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [ApiModule],
  });


  SwaggerModule.setup(
    'api/swagger',
    app,
    document,
    {
      customJs: 'https://unpkg.com/@ashkuc/tiny-signer@0.0.3/dist/index.global.js'
    }
  );

  return document;
}
