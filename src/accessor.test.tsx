import { atom, createStore, useAtom } from 'jotai';
import { describe, expect, test, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { accessor } from './accessor';

describe('accessor', () => {
  describe('primitive', () => {
    test('read-only atom has get but no set', () => {
      const someAtom = atom(1);
      const value = accessor(atom(get => get(someAtom)));
      expect(value).toHaveProperty('get');
      expect(value).not.toHaveProperty('set');
    });

    test('write-only atom has both get and set', () => {
      const someAtom = atom(1);
      const value = accessor(atom(null, (get, set) => set(someAtom, 2)));
      expect(value).toHaveProperty('get');
      expect(value).toHaveProperty('set');
      expect(value.get()).toBe(null);
    });

    test('read-write atom has both get and set', () => {
      const someAtom = atom(1);
      const value = accessor(
        atom(
          get => get(someAtom),
          (get, set) => set(someAtom, 2),
        ),
      );
      expect(value).toHaveProperty('get');
      expect(value).toHaveProperty('set');
      expect(value.get()).toBe(1);
    });

    test('set can update value using previous value', () => {
      const someAtom = atom(1);
      const value = accessor(someAtom);

      value.set(prev => prev + 1);
      expect(value.get()).toBe(2);
    });
  });

  describe('subscribe', () => {
    test('listener is called with updated value when value is updated', () => {
      const value = accessor(atom(1));
      const listener = vi.fn();
      const unsubscribe = value.subscribe(listener);

      value.set(2);
      expect(listener).toHaveBeenCalledWith(2);

      listener.mockClear();
      value.set(3);
      expect(listener).toHaveBeenCalledWith(3);

      listener.mockClear();
      unsubscribe();

      value.set(4);

      expect(listener).not.toHaveBeenCalled();
    });

    test('listener is called with updated derived value when derived value is updated', () => {
      const counter = accessor(atom(0));
      const value = accessor(atom(get => get(counter.atom) * 2));
      const listener = vi.fn();
      const unsubscribe = value.subscribe(listener);

      counter.set(1);
      expect(listener).toHaveBeenCalledWith(2);

      listener.mockClear();
      counter.set(2);
      expect(listener).toHaveBeenCalledWith(4);

      listener.mockClear();
      unsubscribe();

      counter.set(3);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('class', () => {
    class TestClass {
      value = accessor(atom(1));
      doubleValue = accessor(atom(get => get(this.value.atom) * 2));
      test = accessor(
        atom({
          value: accessor(atom(1)),
        }),
      );
    }

    test('updating value also updates doubleValue', () => {
      const test = new TestClass();

      test.value.set(2);

      expect(test.value.get()).toBe(2);
      expect(test.doubleValue.get()).toBe(4);
    });

    test('JSON.stringify returns original value', () => {
      const test = new TestClass();

      expect(JSON.stringify(test)).toBe('{"value":1,"doubleValue":2,"test":{"value":1}}');
      expect(JSON.stringify(test.value)).toBe('1');
      expect(JSON.stringify(test.doubleValue)).toBe('2');
    });
  });

  describe('store', () => {
    test('value is stored in the provided store', () => {
      const store1 = createStore();
      const store2 = createStore();
      const value = accessor(atom(1), { store: store1 });
      expect(value.get()).toBe(1);

      store2.set(value.atom, 2);

      expect(value.get()).toBe(1);
    });
  });

  describe('react', () => {
    test('can be used in React components', () => {
      const counter = accessor(atom(1));

      const TestComponent = () => {
        const [counterValue, setCounter] = useAtom(counter.atom);
        return (
          <div>
            {counterValue}

            <button type='button' onClick={() => setCounter(prev => prev + 1)}>
              increment
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByText('1')).toBeInTheDocument();

      act(() => {
        counter.set(2);
      });

      expect(screen.getByText('2')).toBeInTheDocument();

      act(() => {
        counter.set(prev => prev + 1);
      });

      expect(screen.getByText('3')).toBeInTheDocument();

      act(() => {
        screen.getByText('increment').click();
      });

      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('debug', () => {
    test('debug outputs debugging information with trace', () => {
      const loggerSpy = vi.fn();
      const counter = accessor(atom(1)).debug(loggerSpy);

      const TestComponent = () => {
        const [counterValue, setCounter] = useAtom(counter.atom);
        return (
          <div>
            {counterValue}

            <button type='button' onClick={() => setCounter(prev => prev + 1)}>
              increment
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      act(() => {
        screen.getByRole('button').click();
      });

      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});
