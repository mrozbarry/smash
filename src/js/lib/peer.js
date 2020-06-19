import Peer from 'peerjs';

const options = (secure = false) => ({
  host: 'peer.mrbarry.com',
  key: 'peer-mrbarry',
  secure,
  port: secure ? 443 : 80,
  // secure: true,
});

export const make = (peerId) => new Peer(
  id(peerId),
  options(true),
)

export const id = id => `com-github-mrozbarry-smash-${id}`;
export const simplifyId = id => id
  .replace(/^com-github-mrozbarry-smash-/, '');
