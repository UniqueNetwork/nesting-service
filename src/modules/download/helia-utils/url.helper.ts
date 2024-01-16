import { getMultiformats, type CID } from './multiformats.lib';

export type ParsedIpfsUrl = {
  cid: CID;
  path: string;
};

const tryParseIpfsCid = async (cidString: string): Promise<CID | null> => {
  const { CID } = await getMultiformats();
  try {
    return CID.parse(cidString);
  } catch (error) {
    return null;
  }
};

export const tryParseIpfsGatewayUrl = async (url: string): Promise<ParsedIpfsUrl | null> => {
  if (url.includes('/ipfs/')) {
    const [cidString, ...pathItems] = url.split('/ipfs/')[1].split('/');

    const cid = await tryParseIpfsCid(cidString);
    const path = pathItems.filter((item) => !!item).join('/');

    if (cid) return { cid, path };
  }

  return null;
};
