import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sdk } from '@unique-nft/sdk/full';
import { AppConfig, SdkConfig } from '../../config';
import { KeyringProvider } from '@unique-nft/accounts/keyring';

export const SdkProvider: Provider = {
  provide: Sdk,
  useFactory: async (configService: ConfigService<AppConfig>): Promise<Sdk> => {
    const { seed, url } = configService.getOrThrow<SdkConfig>('sdk');

    let signer = null;

    if (seed) {
      const provider = new KeyringProvider({
        type: 'sr25519',
      });
      await provider.init();
      signer = provider.addSeed(seed);
    }

    return new Sdk({
      signer,
      baseUrl: url,
    });
  },
  inject: [ConfigService],
};
