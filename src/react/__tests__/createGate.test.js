//@flow

import {configure} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({
  adapter: new Adapter(),
})

import * as React from 'react'
import {mount} from 'enzyme'
import {createEvent, createStore, createStoreObject} from 'effector'
import {createGate, type Gate as GateType} from 'effector-react'

test('plain gate', () => {
  const Gate = createGate('plain gate')
  expect(Gate.isOpen).toBe(false)
  const tree = mount(
    <section>
      <div>div</div>
      <Gate />
    </section>,
  )
  expect(Gate.isOpen).toBe(true)
  tree.unmount()
  expect(Gate.isOpen).toBe(false)
})

test('gate with props', async() => {
  const Gate = createGate('gate with props')
  expect(Gate.current).toMatchObject({})
  const tree = mount(
    <section>
      <Gate foo="bar" />
    </section>,
  )
  tree.render()
  expect(Gate.state.getState()).toMatchObject({foo: 'bar'})
  expect(Gate.current).toMatchObject({foo: 'bar'})
  expect(tree.text()).toMatchSnapshot('gate with props')
  tree.unmount()
  expect(Gate.state.getState()).toMatchObject({})
})
function calls(fn, ...args) {
  expect(fn.mock.calls).toEqual(args.map(a => [a]))
}
test('gate properties', async() => {
  const Gate = createGate('gate properties')
  const fn1 = jest.fn()
  const fn2 = jest.fn()
  Gate.status.watch(isOpen => fn1(isOpen))
  Gate.state.watch(props => fn2(props))
  const tree = mount(
    <section>
      <Gate foo="bar" />
    </section>,
  )
  tree.render()
  tree.unmount()
  calls(fn1, false, true, false)
  calls(fn2, {}, {foo: 'bar'}, {})
})

describe('child gate', () => {
  test('usage', async() => {
    const Gate = createGate('parent gate')
    const Child = Gate.childGate('child gate')

    const tree = mount(
      <section>
        <Gate />
        <div>
          <Child />
        </div>
      </section>,
    )
    expect(Gate.isOpen).toBe(true)
    expect(Child.isOpen).toBe(true)
    expect(tree.text()).toMatchSnapshot('child gate usage')
    tree.unmount()
    expect(Gate.isOpen).toBe(false)
    expect(Child.isOpen).toBe(false)
  })
  test('order edge case', async() => {
    const Gate = createGate('parent gate')
    const Child = Gate.childGate('child gate')

    const tree = mount(
      <section>
        <div>
          <Child />
        </div>
        <Gate />
      </section>,
    )
    expect(Gate.isOpen).toBe(true)
    expect(Child.isOpen).toBe(true)
    tree.unmount()
    expect(Gate.isOpen).toBe(false)
    expect(Child.isOpen).toBe(false)
  })
  test('parent prevent children from beeing open', async() => {
    const Gate = createGate('parent gate')
    const Child = Gate.childGate('child gate')

    const tree = mount(
      <section>
        <Child />
      </section>,
    )

    expect(Child.isOpen).toBe(false)
    tree.unmount()
    expect(Child.isOpen).toBe(false)
  })
})