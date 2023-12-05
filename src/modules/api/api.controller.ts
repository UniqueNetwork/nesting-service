import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthTokenResponse, BuildTokenDto, GetAuthTokenDto } from './dto';
import { AuthGuard } from '../auth/jwt';
import { ApiService } from './api.service';
import { InputRequest } from '../../types';

@ApiTags('Api')
@Controller('api/')
export class ApiController {
  @Inject(ApiService)
  private apiService: ApiService;

  @Post('get-auth-token')
  @ApiBody({ type: GetAuthTokenDto })
  @ApiResponse({ type: AuthTokenResponse })
  async getAuthToken(
    @Body() body: GetAuthTokenDto,
  ): Promise<AuthTokenResponse> {
    return this.apiService.getAuthToken(body);
  }

  @Post('build-token')
  @ApiBody({ type: BuildTokenDto })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  async buildToken(@Request() req: InputRequest, @Body() body: BuildTokenDto) {
    return this.apiService.buildToken(body);
  }
}
