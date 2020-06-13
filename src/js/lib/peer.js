import Peer from 'peerjs';

const options = (secure = false) => ({
  host: 'peer.mrbarry.com',
  key: 'peer-mrbarry',
  secure,
  port: secure ? 443 : 80,
  // secure: true,
});

export const make = (peerId) => peerId
  ? new Peer(id(peerId), options())
  : new Peer(options());

export const id = id => `com-github-mrozbarry-${id}-smash`;
export const simplifyId = id => id
  .replace(/^com-github-mrozbarry-/, '')
  .replace(/-smash$/, '');
