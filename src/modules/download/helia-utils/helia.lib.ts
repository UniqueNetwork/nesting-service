import type HeliaLib from 'helia';
import type HeliaUnixfsLib from '@helia/unixfs';

export type { HeliaLib };
export type { HeliaUnixfsLib };

export async function getHeliaLib(): Promise<typeof HeliaLib> {
  return await (eval(`import('helia')`) as Promise<any>);
}

export async function getHeliaUnixfsLib(): Promise<typeof HeliaUnixfsLib> {
  return await (eval(`import('@helia/unixfs')`) as Promise<any>);
}
