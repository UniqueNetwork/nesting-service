import { Body, Controller, Inject, Post, UseGuards, Req, UsePipes, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthTokenResponse, BuildCollectionDto, BuildTokenDto, GetAuthTokenDto } from './dto';
import { AuthGuard } from '../auth/jwt';
import { ApiService } from './api.service';
import { createValidationPipe } from './validation';

@ApiTags('Api')
@Controller('api/')
export class ApiController {
  @Inject(ApiService)
  private apiService: ApiService;

  @UsePipes(createValidationPipe())
  @Get('configuration')
  async getConfiguration() {
    return this.apiService.getConfiguration();
  }

  @UsePipes(createValidationPipe())
  @Post('get-auth-token')
  @ApiBody({ type: GetAuthTokenDto })
  @ApiResponse({ type: AuthTokenResponse })
  async getAuthToken(@Body() body: GetAuthTokenDto): Promise<AuthTokenResponse> {
    return this.apiService.getAuthToken(body);
  }

  @UsePipes(createValidationPipe())
  @Post('build-token')
  @ApiBody({ type: BuildTokenDto })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  async buildToken(@Req() req: Request, @Body() body: BuildTokenDto) {
    const { jwtPayload } = req;
    return this.apiService.buildToken(jwtPayload.address, body);
  }

  @UsePipes(createValidationPipe())
  @Post('build-collection')
  @ApiBody({ type: BuildCollectionDto })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  async buildCollection(@Req() req: Request, @Body() body: BuildCollectionDto) {
    const { jwtPayload } = req;
    return this.apiService.buildCollection(jwtPayload.address, body);
  }
}
