function write(level, metadata, message) {
  const entry = JSON.stringify({ level, message, timestamp: new Date().toISOString(), ...metadata });
  if (level === 'error') {
    console.error(entry);
  } else {
    console.log(entry);
  }
}

export const logger = Object.freeze({
  info: (metadata, message) => write('info', metadata, message),
  error: (metadata, message) => write('error', metadata, message),
});

