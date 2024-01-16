import type Multiformats from 'multiformats';

export type { CID } from 'multiformats';

export async function getMultiformats(): Promise<typeof Multiformats> {
  return await (eval(`import('multiformats')`) as Promise<any>);
}
