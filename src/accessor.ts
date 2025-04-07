import { type Atom, type PrimitiveAtom, type WritableAtom, getDefaultStore } from 'jotai/vanilla';

export type SetStateAccessor<Value> = Value | ((prev: Value) => Value);

type Store = ReturnType<typeof import('jotai/vanilla').createStore>;

export let _store: Store = getDefaultStore();

/**
 * set global default accessor store
 * @param store
 */
export const setAccessorStore = (store: Store) => {
  _store = store;
};

export type ReadonlyAccessor<Value> = {
  readonly atom: Atom<Value>;
  get: () => Value;
  subscribe: (callback: (value: Value) => void) => () => void;
  debug: (logger: (value: Value) => void) => ReadonlyAccessor<Value>;
};

export type Accessor<Value, Args extends unknown[] = [SetStateAccessor<Value>], Result = void> = Omit<
  ReadonlyAccessor<Value>,
  'debug'
> & {
  readonly atom: WritableAtom<Value, Args, Result>;
  set: (value: SetStateAccessor<Value>) => void;
  debug: (logger: (value: Value) => void) => Accessor<Value, Args, Result>;
};

export type InferAccessor<A> = A extends ReadonlyAccessor<infer V>
  ? V
  : A extends Accessor<infer V>
    ? V
    : A extends WriteonlyAccessor<infer V, infer Args, infer Result>
      ? null
      : never;

export type WriteonlyAccessor<Value, Args extends unknown[] = [SetStateAccessor<Value>], Result = void> = Omit<
  Accessor<Value, Args, Result>,
  'get' | 'subscribe'
>;

// primitive atom
function accessor<A extends PrimitiveAtom<Value>, Value = A extends PrimitiveAtom<infer V> ? V : never>(
  atom: A,
  options?: {
    store?: Store;
    debugLabel?: string;
  },
): Accessor<Value, [SetStateAccessor<Value>], void>;

// write-only atom
function accessor<
  A extends WritableAtom<any, any, any>,
  Value = A extends WritableAtom<infer V, any, any> ? V : never,
  Args extends unknown[] = A extends WritableAtom<any, infer A, any> ? A : never,
  Result = A extends WritableAtom<any, any, infer R> ? R : never,
>(
  atom: A,
  options?: {
    store?: Store;
    debugLabel?: string;
  },
): Accessor<Value, Args, Result>;

// read-only atom
function accessor<A extends Atom<any>, Value = A extends Atom<infer V> ? V : never>(
  atom: A,
  options?: {
    store?: Store;
    debugLabel?: string;
  },
): ReadonlyAccessor<Value>;

/**
 *
 * @param atom
 * @param store
 * @returns
 */
function accessor<A extends Atom<Value> | WritableAtom<Value, Args, Result>, Value, Args extends unknown[], Result>(
  atom: A,
  {
    store = _store,
    debugLabel,
  }: {
    store?: Store;
    debugLabel?: string;
  } = {},
): ReadonlyAccessor<Value> | Accessor<Value, Args, Result> {
  atom.debugLabel = debugLabel;
  return {
    atom,
    get: () => {
      return store.get(atom);
    },
    ...('write' in atom && {
      set: (value: Value | ((prev: Value) => Value)) => {
        store.set(
          atom,
          // @ts-ignore The generic type of store.set and the generic type of value are being treated as different types, but it doesn't matter
          typeof value === 'function' ? value(store.get(atom)) : value,
        );
      },
    }),
    subscribe: (callback: (value: Value) => void) => {
      return store.sub(atom, () => callback(store.get(atom)));
    },
    ...{
      toJSON: () => {
        return store.get(atom);
      },
      debug(
        logger: (value: Value) => void = value => {
          console.group(`${atom.debugLabel ?? '<anonymous>'} accessor debug`);
          console.trace('new value:', value);
          console.groupEnd();
        },
      ) {
        this.subscribe(logger);
        return this;
      },
    },
  };
}

export { accessor };
