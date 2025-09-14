// TypeScript implementation for Phoenix JavaScript client

declare module 'phoenix' {
  export interface SocketParams {
    [key: string]: string | number | boolean;
  }

  export interface SocketOptions {
    params?: SocketParams;
    transport?: unknown;
    timeout?: number;
    heartbeatIntervalMs?: number;
    longpollerTimeout?: number;
    encode?: (payload: unknown, callback: (encoded: string) => void) => void;
    decode?: (payload: string, callback: (decoded: unknown) => void) => void;
    logger?: (kind: string, msg: string, data: unknown) => void;
  }

  export interface Push {
    receive(status: string, callback: (response?: unknown) => void): Push;
  }

  export class Channel {
    constructor(
      topic: string,
      params?: Record<string, unknown>,
      socket?: Socket
    );

    join(timeout?: number): Push;
    leave(timeout?: number): Push;
    push(
      event: string,
      payload?: Record<string, unknown>,
      timeout?: number
    ): Push;
    on(event: string, callback: (payload?: unknown) => void): void;
    off(event: string, ref?: unknown): void;
    onClose(callback: () => void): void;
    onError(callback: (reason?: unknown) => void): void;
  }

  export class Socket {
    constructor(endPoint: string, opts?: SocketOptions);

    connect(): void;
    disconnect(callback?: () => void, code?: number, reason?: string): void;
    channel(topic: string, chanParams?: Record<string, unknown>): Channel;
    push(data: unknown): void;
    log(kind: string, msg: string, data?: unknown): void;
    hasLogger(): boolean;
    onOpen(callback: () => void): void;
    onClose(callback: (event?: unknown) => void): void;
    onError(callback: (error?: unknown) => void): void;
    connectionState(): string;
    isConnected(): boolean;
    remove(channel: Channel): void;
    ref(): string;
  }
}
