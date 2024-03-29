import WebSocket from 'isomorphic-ws';
import isEqual from 'lodash.isequal';

function asMessage(instance, kind, payload) {
  return JSON.stringify({
    version: 'v0alpha',
    kind: kind,
    topic: instance.namespace,
    identity: String(instance.key),
    payload: payload
  })
}

export function create(instance, opts) {
  const socket = new WebSocket(opts.endpoint);

  const handleUpdate = (evt) => {
    if (socket.readyState !== 1) {
      return;
    }

    const ops = evt.detail;

    socket.send(asMessage(instance, 'diff', JSON.stringify(ops)))
  }

  instance.events.addEventListener('update', handleUpdate);

  socket.addEventListener('open', (evt) => {
    socket.send(asMessage(instance, 'sync', instance.log.vclock()));
  });

  const handleSync = (message) => {
    const currentState = JSON.parse(instance.log.vclock());
    const nextState = JSON.parse(message.payload);

    if (!isEqual(currentState, nextState)) {
      socket.send(asMessage(instance, 'sync', instance.log.vclock()))
    }

    const diff = JSON.parse(instance.log.diff(message.payload));

    if (diff.length > 0) {
      socket.send(asMessage(instance, 'diff', JSON.stringify(diff)))
    }
  }

  const handleDiff = (message) => {
    try {
      instance.log.apply(message.payload)
    } catch (e) {
      console.warn('Potential OutOfOrder exception happened, resyncing now')

      socket.send(asMessage(instance, 'sync', instance.log.vclock()));
    }
  }

  socket.addEventListener('message', (evt) => {
    const message = JSON.parse(evt.data);

    switch (message.kind) {
      case 'sync':
        handleSync(message);
        break;
      case 'diff':
        handleDiff(message);
        break;
      default:
        console.warn('Unknown message kind, no handler implemented', message)
    }
  });

  socket.addEventListener('close', (evt) => {
    console.warn('Connection closed', evt)
  })

  socket.addEventListener('error', (evt) => {
    console.error('Error', evt)
  })

  return () => {
    instance.events.removeEventListener('update', handleUpdate);
    socket.close();
  }
}