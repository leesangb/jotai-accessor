# jotai-accessor

`jotai-accessor` is a lightweight wrapper around [`jotai`](https://jotai.org) that provides a simplified API for state management in both Vanilla JavaScript and React applications.

## Why?

When using [`jotai`](https://jotai.org) in projects that combine Vanilla JavaScript and React, you typically need to use verbose syntax like `getDefaultStore().get(someAtom)` or `getDefaultStore().set(someAtom, value)` to interact with atoms outside of React components.

This utility eliminates that verbosity by providing a clean, consistent interface for managing atom state across your entire application.

## Prerequisites

- [`jotai^2.0.0`](https://jotai.org)

## Installation

```bash
npm install @leesangb/jotai-accessor
pnpm install @leesangb/jotai-accessor
yarn add @leesangb/jotai-accessor
bun add @leesangb/jotai-accessor
```

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
