import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Request,
  Response,
  UsePipes,
  Get,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AuthTokenResponse,
  CollectionInfoDto,
  TokenInfoDto,
  GetAuthTokenDto,
} from './dto';
import { Response as ExpressResponse } from 'express';
import { AuthGuard } from '../auth/jwt';
import { ApiService } from './api.service';
import { ChainType, InputRequest } from '../../types';
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
  async getAuthToken(
    @Body() body: GetAuthTokenDto,
  ): Promise<AuthTokenResponse> {
    return this.apiService.getAuthToken(body);
  }

  @UsePipes(createValidationPipe())
  @Post('build-token')
  @ApiBody({ type: TokenInfoDto })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  async buildToken(@Request() req: InputRequest, @Body() body: TokenInfoDto) {
    const { jwtPayload } = req;
    return this.apiService.buildToken(jwtPayload.address, body);
  }

  @UsePipes(createValidationPipe())
  @Post('build-collection')
  @ApiBody({ type: CollectionInfoDto })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  async buildCollection(
    @Request() req: InputRequest,
    @Body() body: CollectionInfoDto,
  ) {
    const { jwtPayload } = req;
    return this.apiService.buildCollection(jwtPayload.address, body);
  }

  @UsePipes(createValidationPipe())
  @Get('common/:chain/:collectionId/:tokenId')
  getTokenImage(
    @Response() res: ExpressResponse,
    @Param() tokenInfo: TokenInfoDto,
  ) {
    const tokenImageUrl = this.apiService.getTokenImage(tokenInfo);

    res.redirect(tokenImageUrl);
  }
}
