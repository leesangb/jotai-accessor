# jotai-accessor

`jotai-accessor` is a utility to use [`jotai`](https://jotai.org) atoms easily in projects that use both Vanilla and React.

## Why?

When using [`jotai`](https://jotai.org) in a project that uses both Vanilla and React, you have to use `getDefaultStore().get(someAtom)` or `getDefaultStore().set(someAtom, value)` to read/write to an atom.
Altough this is not a problem, it can be a bit verbose when you have to manage a lot of atoms in vanilla code.

This utility is a simple wrapper that lets you use `jotai` atoms conveniently in both Vanilla and React.

## Usage

### Create an accessor

```ts
import { atom } from 'jotai';
import { accessor } from '@leesangb/jotai-accessor';

const counter = accessor(atom(0));
```

### Use the accessor in your component with jotai's API

```tsx
function Counter() {
  const [count, setCount] = useAtom(counter.atom);

  return (
    <h1>
      {count}
      <button onClick={() => setCount((c) => c + 1)}>one up</button>
    </h1>
  );
}
```

### Use it in Vanilla code and React

```tsx
class State {
  counter = accessor(atom(0));
}

const state = new State();

setInterval(() => {
  state.counter.set(prev => prev + 1);
}, 1000);

function Counter() {
  const count = useAtomValue(state.counter.atom);

  return (
    <h1>
      {count}
    </h1>
  );
}
```

### Create derived atoms with computed values
A new read-only atom can be created from existing atoms by passing a read function as the first argument. get allows you to fetch the contextual value of any atom.

```tsx
const doubleCounter = accessor(atom(get => get(counter.atom) * 2));

function DoubleCounter() {
  const [doubledCount] = useAtom(doubleCounter.atom);
  return <h2>{doubledCount}</h2>;
}
```

## License

MIT
