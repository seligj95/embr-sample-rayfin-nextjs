import { entity, authenticated, uuid, text, date } from '@microsoft/rayfin-core';

// A shared "notes board" entity.
//
// Access is governed by Rayfin's `authenticated` role: any signed-in Fabric
// user can read and write. Fabric-managed Rayfin only supports the
// `authenticated` role today (anonymous and service-principal/app-only data
// access are NOT supported), and sign-in is an interactive, browser-based
// Fabric flow. That constraint drives this sample's auth design — see README.
@entity()
@authenticated('*')
export class Note {
  @uuid() id!: string;
  @text({ min: 1, max: 280 }) message!: string;
  @text({ min: 1, max: 60 }) author!: string;
  @date() createdAt!: Date;
}
